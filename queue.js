/**
 * QUEUE MANAGER — High-Performance Matchmaking Queue
 * ══════════════════════════════════════════════════
 * Hybrid architecture:
 *   - Redis (production) → O(1) dedup via Set, atomic ops via Lua
 *   - In-memory (dev) → Set + Array for same O(1) performance
 *
 * ALWAYS maintains in-memory arrays for backward compatibility with index.js.
 * When Redis is active, operations are synced to BOTH Redis + in-memory.
 *
 * Queue Keys di Redis:
 *   queue:general       → LIST of chatId
 *   queue:general:set   → SET  of chatId (O(1) dedup)
 *   queue:male          → LIST of chatId
 *   queue:male:set      → SET  of chatId
 *   queue:female        → LIST of chatId
 *   queue:female:set    → SET  of chatId
 *   queue:age           → LIST of JSON {id, age, gender, minAge, maxAge, searchMsgId}
 *   queue:age:set       → SET  of chatId
 *   user:meta:{id}      → HASH {gender, age, ts, searchMsgId}
 *
 *   queue:region:{XX}   → LIST of chatId
 *   queue:region:{XX}:s → SET  of chatId
 *   user:region:{id}    → HASH {region, gender, age, ts, searchMsgId}
 */

const redis = require('./redis');

// ── In-Memory backing store (ALWAYS maintained, even with Redis) ──
// index.js imports this reference directly — all in-memory ops use these arrays.
const waitingList = {
    general: [],
    male: [],
    female: [],
    ageList: [],
};
// O(1) membership tracking for in-memory mode
const queueMembers = new Set();

// ── Helper: Remove from in-memory array by id ──
function memRemove(arr, userId) {
    const idx = arr.findIndex(u => u.id === userId);
    if (idx !== -1) arr.splice(idx, 1);
}

// ── Lua Script: Atomic dequeue from Redis ──
// Pop dari list → cek set → hapus set → ambil meta → hapus meta.
// Loop dipakai untuk membuang entri yatim (list ada, set sudah terhapus) supaya
// user yang sudah /stop atau /next tidak pernah bisa ter-match lagi dari sisa antrean.
const LUA_DEQUEUE = `
for i = 1, 200 do
  local val = redis.call('LPOP', KEYS[1])
  if not val then return nil end
  local removed = redis.call('SREM', KEYS[2], val)
  if removed == 1 then
    local meta = redis.call('HGETALL', KEYS[3] .. val)
    redis.call('DEL', KEYS[3] .. val)
    return {val, meta}
  end
end
return nil
`;

const LUA_DEQUEUE_REGION = LUA_DEQUEUE;

// ═══════════════════════════════════════════════════════════════
// GENERIC QUEUE OPERATIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Add user to queue with O(1) dedup
 * @param {'general'|'male'|'female'|'age'} type
 * @param {number} userId
 * @param {object} metadata - { gender, age, searchMsgId, minAge, maxAge }
 */
const QUEUE_TYPES = ['general', 'male', 'female', 'age'];

async function enqueue(type, userId, metadata = {}) {
    const strId = String(userId);
    const memList = type === 'age' ? waitingList.ageList : waitingList[type];

    // ── In-memory: satu user hanya boleh berada di SATU antrean ──
    if (queueMembers.has(userId)) {
        const here = memList.find(u => u.id === userId);
        if (here) {
            // Sudah di antrean yang sama → cukup refresh metadata (searchMsgId terbaru)
            Object.assign(here, metadata);
        } else {
            // Pindah jenis antrean → bersihkan dulu dari yang lain
            memRemove(waitingList.general, userId);
            memRemove(waitingList.male, userId);
            memRemove(waitingList.female, userId);
            memRemove(waitingList.ageList, userId);
            queueMembers.delete(userId);
        }
    }
    if (!queueMembers.has(userId)) {
        queueMembers.add(userId);
        memList.push({ id: userId, ...metadata });
    }

    // Sync to Redis if available
    if (redis.isReady()) {
        const listKey = `queue:${type}`;
        const setKey = `queue:${type}:set`;
        const metaKey = `user:meta:${userId}`;

        try {
            // Pastikan user tidak nyangkut di antrean/region lain.
            // Ini bug yang bikin user "balik ke sesi lama" setelah /stop atau /next.
            const others = [];
            for (const other of QUEUE_TYPES) {
                if (other === type) continue;
                others.push(redis.lRem(`queue:${other}`, 0, strId));
                others.push(redis.sRem(`queue:${other}:set`, strId));
            }
            for (const region of KNOWN_REGIONS) {
                others.push(redis.lRem(`queue:region:${region}`, 0, strId));
                others.push(redis.sRem(`queue:region:${region}:s`, strId));
            }
            if (others.length) await Promise.all(others).catch(() => { });

            // Store metadata including target & age preferences
            const metaObj = {
                gender: metadata.gender || '',
                targetGender: metadata.targetGender || '',
                age: String(metadata.age || ''),
                region: metadata.region || '',
                minAge: metadata.minAge != null ? String(metadata.minAge) : '',
                maxAge: metadata.maxAge != null ? String(metadata.maxAge) : '',
                joinedAt: String(metadata.joinedAt || Date.now()),
                ts: String(Date.now()),
            };
            if (metadata.searchMsgId) metaObj.searchMsgId = String(metadata.searchMsgId);

            await redis.hSet(metaKey, metaObj);
            const added = await redis.sAdd(setKey, strId); // 1 = benar-benar baru
            if (added) await redis.rPush(listKey, strId);
        } catch (e) {
            // Jangan sampai gagal Redis membuat fitur search mati
        }
    }
}

/**
 * Dequeue first user from queue (atomic, race-condition safe)
 * @param {'general'|'male'|'female'|'age'} type
 * @returns {object|null} { id, gender, age, searchMsgId }
 */
async function dequeue(type) {
    if (redis.isReady()) {
        const listKey = `queue:${type}`;
        const setKey = `queue:${type}:set`;
        const metaKey = `user:meta:`;

        try {
            const result = await redis.eval(LUA_DEQUEUE, {
                keys: [listKey, setKey, metaKey],
                arguments: []
            });

            if (!result || !result[0]) return null;

            const userId = parseInt(result[0]);
            const metaArr = result[1] || [];
            const meta = {};
            for (let i = 0; i < metaArr.length; i += 2) {
                meta[metaArr[i]] = metaArr[i + 1];
            }

            // Remove from in-memory too
            queueMembers.delete(userId);
            if (type === 'age') {
                memRemove(waitingList.ageList, userId);
            } else {
                memRemove(waitingList[type], userId);
            }

            return {
                id: userId,
                gender: meta.gender || null,
                targetGender: meta.targetGender || null,
                age: meta.age ? parseInt(meta.age) : null,
                region: meta.region || null,
                minAge: meta.minAge !== '' && meta.minAge != null ? parseInt(meta.minAge) : null,
                maxAge: meta.maxAge !== '' && meta.maxAge != null ? parseInt(meta.maxAge) : null,
                joinedAt: meta.joinedAt ? parseInt(meta.joinedAt) : null,
                searchMsgId: meta.searchMsgId ? parseInt(meta.searchMsgId) : null
            };
        } catch (e) {
            // Fallback to in-memory on Redis error
        }
    }

    // In-memory fallback
    const arr = type === 'age' ? waitingList.ageList : waitingList[type];
    const user = arr.shift();
    if (user) queueMembers.delete(user.id);
    return user || null;
}

/**
 * Remove user from ALL queues (called on match, cancel, disconnect)
 * @param {number} userId
 */
async function removeFromAllQueues(userId) {
    // Always clear in-memory first
    queueMembers.delete(userId);
    memRemove(waitingList.general, userId);
    memRemove(waitingList.male, userId);
    memRemove(waitingList.female, userId);
    memRemove(waitingList.ageList, userId);

    // Clear from Redis if available
    if (redis.isReady()) {
        const strId = String(userId);
        await Promise.all([
            redis.lRem('queue:general', 0, strId),
            redis.sRem('queue:general:set', strId),
            redis.lRem('queue:male', 0, strId),
            redis.sRem('queue:male:set', strId),
            redis.lRem('queue:female', 0, strId),
            redis.sRem('queue:female:set', strId),
            redis.lRem('queue:age', 0, strId),
            redis.sRem('queue:age:set', strId),
            redis.del(`user:meta:${userId}`),
        ]).catch(() => { });
    }
}

/**
 * Check if user is in any queue — O(1) via Set
 * @param {number} userId
 * @returns {boolean}
 */
async function isInQueue(userId) {
    // Fast in-memory check
    if (queueMembers.has(userId)) return true;

    // Check Redis if available
    if (redis.isReady()) {
        const strId = String(userId);
        const results = await Promise.all([
            redis.sIsMember('queue:general:set', strId),
            redis.sIsMember('queue:male:set', strId),
            redis.sIsMember('queue:female:set', strId),
            redis.sIsMember('queue:age:set', strId),
        ]);
        return results.some(r => r === 1 || r === true);
    }

    return false;
}

/**
 * Remove user from specific queue type
 * @param {'general'|'male'|'female'|'age'} type
 * @param {number} userId
 */
async function removeFromQueue(type, userId) {
    queueMembers.delete(userId);
    if (type === 'age') {
        memRemove(waitingList.ageList, userId);
    } else {
        memRemove(waitingList[type], userId);
    }

    if (redis.isReady()) {
        const strId = String(userId);
        await Promise.all([
            redis.lRem(`queue:${type}`, 0, strId),
            redis.sRem(`queue:${type}:set`, strId),
            redis.del(`user:meta:${userId}`),
        ]).catch(() => { });
    }
}

/**
 * Get queue size
 * @param {'general'|'male'|'female'|'age'} type
 * @returns {number}
 */
async function getQueueSize(type) {
    if (redis.isReady()) {
        return redis.lLen(`queue:${type}`);
    }
    return type === 'age' ? waitingList.ageList.length : waitingList[type].length;
}

/**
 * Total users waiting across all queues
 * @returns {number}
 */
async function getTotalWaiting() {
    if (redis.isReady()) {
        const [g, m, f, a] = await Promise.all([
            redis.lLen('queue:general'),
            redis.lLen('queue:male'),
            redis.lLen('queue:female'),
            redis.lLen('queue:age'),
        ]);
        return g + m + f + a;
    }
    return waitingList.general.length + waitingList.male.length +
        waitingList.female.length + waitingList.ageList.length;
}

// ═══════════════════════════════════════════════════════════════
// REGION QUEUE — O(1) per-region matchmaking
// ═══════════════════════════════════════════════════════════════

const regionWaiting = {};  // { 'ID': [{id, gender, age, searchMsgId}], ... }

const KNOWN_REGIONS = ['ID', 'EN', 'AR', 'MY', 'CN', 'JP', 'RU'];

/**
 * Add user to region queue
 * @param {string} region
 * @param {number} userId
 * @param {object} metadata - { gender, age, searchMsgId }
 */
async function enqueueRegion(region, userId, metadata = {}) {
    if (!region) return;
    const strId = String(userId);

    // Always update in-memory
    if (!regionWaiting[region]) regionWaiting[region] = [];
    if (!regionWaiting[region].find(u => u.id === userId)) {
        regionWaiting[region].push({ id: userId, ...metadata });
    }

    // Sync to Redis
    if (redis.isReady()) {
        const listKey = `queue:region:${region}`;
        const setKey = `queue:region:${region}:s`;
        const metaKey = `user:region:${userId}`;

        const isMember = await redis.sIsMember(setKey, strId);
        if (isMember) return;

        const metaObj = {
            region,
            gender: metadata.gender || '',
            age: String(metadata.age || ''),
            ts: String(Date.now()),
        };
        if (metadata.searchMsgId) metaObj.searchMsgId = String(metadata.searchMsgId);

        await redis.hSet(metaKey, metaObj);
        await redis.sAdd(setKey, strId);
        await redis.rPush(listKey, strId);
    }
}

/**
 * Dequeue first user from region queue (atomic)
 * @param {string} region
 * @returns {object|null} { id, gender, age, region, searchMsgId }
 */
async function dequeueRegion(region) {
    if (!region) return null;

    if (redis.isReady()) {
        const listKey = `queue:region:${region}`;
        const setKey = `queue:region:${region}:s`;
        const metaKey = `user:region:`;

        try {
            const result = await redis.eval(LUA_DEQUEUE_REGION, {
                keys: [listKey, setKey, metaKey],
                arguments: []
            });

            if (!result || !result[0]) return null;

            const userId = parseInt(result[0]);
            const metaArr = result[1] || [];
            const meta = {};
            for (let i = 0; i < metaArr.length; i += 2) {
                meta[metaArr[i]] = metaArr[i + 1];
            }

            // Remove from in-memory
            if (regionWaiting[region]) {
                memRemove(regionWaiting[region], userId);
            }

            return {
                id: userId,
                gender: meta.gender || null,
                age: meta.age ? parseInt(meta.age) : null,
                region: meta.region || region,
                searchMsgId: meta.searchMsgId ? parseInt(meta.searchMsgId) : null
            };
        } catch (e) {
            // Fallback
        }
    }

    // In-memory fallback
    if (!regionWaiting[region] || !regionWaiting[region].length) return null;
    return regionWaiting[region].shift() || null;
}

/**
 * Remove user from ALL region queues
 * @param {number} userId
 */
async function removeFromRegionQueues(userId) {
    // In-memory
    for (const r of KNOWN_REGIONS) {
        if (regionWaiting[r]) memRemove(regionWaiting[r], userId);
    }

    // Redis
    if (redis.isReady()) {
        const strId = String(userId);
        const ops = [
            redis.del(`user:region:${userId}`),
            ...KNOWN_REGIONS.map(r => redis.lRem(`queue:region:${r}`, 0, strId)),
            ...KNOWN_REGIONS.map(r => redis.sRem(`queue:region:${r}:s`, strId)),
        ];
        await Promise.all(ops).catch(() => { });
    }
}

/**
 * Check if user is in a specific region queue — O(1)
 * @param {number} userId
 * @param {string} [region] - optional, checks all regions if omitted
 * @returns {boolean}
 */
async function isInRegionQueue(userId, region) {
    if (region) {
        // Check specific region
        if (regionWaiting[region] && regionWaiting[region].find(u => u.id === userId)) return true;
        if (redis.isReady()) {
            const r = await redis.sIsMember(`queue:region:${region}:s`, String(userId));
            return r === 1 || r === true;
        }
        return false;
    }

    // Check all regions (in-memory first)
    for (const r of KNOWN_REGIONS) {
        if (regionWaiting[r] && regionWaiting[r].find(u => u.id === userId)) return true;
    }
    if (redis.isReady()) {
        const strId = String(userId);
        const results = await Promise.all(
            KNOWN_REGIONS.map(r => redis.sIsMember(`queue:region:${r}:s`, strId))
        );
        return results.some(r => r === 1 || r === true);
    }
    return false;
}

/**
 * Get region queue size
 * @param {string} region
 * @returns {number}
 */
async function getRegionQueueSize(region) {
    if (!region) return 0;
    if (redis.isReady()) return redis.lLen(`queue:region:${region}`);
    return (regionWaiting[region] || []).length;
}

module.exports = {
    // Backward-compatible export (index.js imports this directly)
    waitingList,

    // Generic queue ops
    enqueue,
    dequeue,
    removeFromAllQueues,
    isInQueue,
    removeFromQueue,
    getQueueSize,
    getTotalWaiting,

    // Region queue ops
    enqueueRegion,
    dequeueRegion,
    removeFromRegionQueues,
    isInRegionQueue,
    getRegionQueueSize,
    regionWaiting,
};
