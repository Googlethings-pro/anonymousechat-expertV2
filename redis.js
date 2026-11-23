/**
 * REDIS CLIENT — Graceful Fallback Architecture
 * ══════════════════════════════════════════════
 * - Jika REDIS_URL ada di env → pakai Redis (mode VPS/Production)
 * - Jika tidak ada → fallback ke in-memory Map (mode Dev)
 *
 * Cara aktifkan di VPS:
 *   1. Install: npm install redis
 *   2. Tambahkan env: REDIS_URL=redis://localhost:6379
 *   3. Jalankan Redis: redis-server
 *   4. Jalankan bot: pm2 start ecosystem.config.js
 */

let redisClient = null;
let _isReady = false;

// ── In-Memory Fallback Store ──────────────────────────────────────
const memStore = new Map();
const memExpiry = new Map();

const inMemoryFallback = {
    async set(key, value, options = {}) {
        const exp = memExpiry.get(key);
        if (exp && Date.now() > exp) { memStore.delete(key); memExpiry.delete(key); }
        // Dukungan NX (dipakai untuk lock anti-double request)
        if (options.NX && memStore.has(key)) return null;
        memStore.set(key, value);
        if (options.EX) memExpiry.set(key, Date.now() + options.EX * 1000);
        if (options.PX) memExpiry.set(key, Date.now() + options.PX);
        return 'OK';
    },
    async get(key) {
        const exp = memExpiry.get(key);
        if (exp && Date.now() > exp) { memStore.delete(key); memExpiry.delete(key); return null; }
        return memStore.get(key) ?? null;
    },
    async del(key) { memStore.delete(key); memExpiry.delete(key); },
    async exists(key) { return memStore.has(key) ? 1 : 0; },
    async rPush(key, ...values) {
        const arr = memStore.get(key) || [];
        arr.push(...values);
        memStore.set(key, arr);
        return arr.length;
    },
    async lPop(key) {
        const arr = memStore.get(key) || [];
        if (!arr.length) return null;
        const val = arr.shift();
        memStore.set(key, arr);
        return val;
    },
    async lRem(key, count, value) {
        const arr = memStore.get(key) || [];
        const before = arr.length;
        const filtered = arr.filter(v => v !== value);
        memStore.set(key, filtered);
        return before - filtered.length;
    },
    async lRange(key, start, stop) {
        const arr = memStore.get(key) || [];
        return stop === -1 ? arr.slice(start) : arr.slice(start, stop + 1);
    },
    async lLen(key) { return (memStore.get(key) || []).length; },
    async lPos(key, value) {
        const arr = memStore.get(key) || [];
        const idx = arr.indexOf(value);
        return idx === -1 ? null : idx;
    },
    async hSet(key, obj) {
        const existing = memStore.get(key) || {};
        memStore.set(key, { ...existing, ...obj });
    },
    async hGet(key, field) { return (memStore.get(key) || {})[field] ?? null; },
    async hGetAll(key) { return memStore.get(key) || {}; },
    async sAdd(key, ...members) {
        const set = memStore.get(key) || new Set();
        members.forEach(m => set.add(m));
        memStore.set(key, set);
    },
    async sIsMember(key, member) {
        const set = memStore.get(key) || new Set();
        return set.has(member) ? 1 : 0;
    },
    async sRem(key, member) {
        const set = memStore.get(key) || new Set();
        set.delete(member);
        memStore.set(key, set);
    },
    async eval(script, options = {}) {
        // Simplified Lua eval for in-memory fallback
        // Hanya mendukung pola dequeue: LPOP + SREM + HGETALL + DEL
        // Loop dipakai agar entri "yatim" (list masih ada, set sudah tidak) dilewati,
        // sehingga user lama tidak bisa muncul lagi sebagai pasangan.
        const keys = options.keys || [];
        if (keys.length >= 3) {
            const listKey = keys[0];
            const setKey = keys[1];
            const metaPrefix = keys[2];
            const arr = memStore.get(listKey) || [];
            while (arr.length) {
                const val = arr.shift();
                const set = memStore.get(setKey) || new Set();
                if (!set.delete(val)) continue; // entri yatim → buang, lanjut
                memStore.set(listKey, arr);
                memStore.set(setKey, set);
                const meta = memStore.get(metaPrefix + val) || {};
                memStore.delete(metaPrefix + val);
                const metaArr = [];
                for (const [k, v] of Object.entries(meta)) { metaArr.push(k, v); }
                return [val, metaArr];
            }
            memStore.set(listKey, arr);
            return null;
        }
        return null;
    },
    async incr(key) {
        const val = parseInt(memStore.get(key) || '0') + 1;
        memStore.set(key, String(val));
        return val;
    },
    async expire(key, seconds) {
        memExpiry.set(key, Date.now() + seconds * 1000);
    },
    async ttl(key) {
        const exp = memExpiry.get(key);
        if (!exp) return -1;
        const remaining = Math.ceil((exp - Date.now()) / 1000);
        return remaining > 0 ? remaining : -2;
    },
    isReady: () => true,
};

// ── Redis Client (aktif jika REDIS_URL tersedia) ──────────────────
if (process.env.REDIS_URL) {
    try {
        const { createClient } = require('redis');
        redisClient = createClient({
            url: process.env.REDIS_URL,
            socket: {
                reconnectStrategy: (retries) => {
                    if (retries > 10) return new Error('Redis max retries exceeded');
                    return Math.min(retries * 100, 3000);
                },
                connectTimeout: 5000,
            },
        });
        redisClient.on('connect', () => {
            _isReady = true;
            console.log('[Redis] ✅ Connected — Queue & Session di Redis aktif!');
        });
        redisClient.on('error', (err) => {
            _isReady = false;
            console.log('[Redis] ⚠️ Error:', err.message, '— Fallback ke in-memory');
        });
        redisClient.on('end', () => { _isReady = false; });
        redisClient.connect().catch(err => {
            console.log('[Redis] ❌ Tidak bisa connect:', err.message, '— Menggunakan in-memory');
        });
    } catch (e) {
        console.log('[Redis] Package belum diinstall. Install: npm install redis');
    }
}

// ── Proxy: Auto-select Redis atau In-Memory ───────────────────────
const redis = new Proxy(inMemoryFallback, {
    get(target, prop) {
        if (prop === 'isReady') return () => _isReady;
        if (redisClient && _isReady && typeof redisClient[prop] === 'function') {
            return redisClient[prop].bind(redisClient);
        }
        return target[prop];
    }
});

module.exports = redis;
