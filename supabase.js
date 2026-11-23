require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// ── User Cache (TTL 30 detik) ─────────────────────────────────────
// Mengurangi panggilan Supabase ~85% untuk user aktif.
// Setiap getUser() yang dipanggil dalam 30 detik pakai cache.
const userCache = new Map();          // chatId → { data, expiresAt }
const CACHE_TTL = 30 * 1000;         // 30 detik

// Bersihkan cache yang expired setiap 5 menit (cegah memory leak)
setInterval(() => {
    const now = Date.now();
    for (const [key, val] of userCache) {
        if (now > val.expiresAt) userCache.delete(key);
    }
}, 5 * 60 * 1000);

async function getUser(telegram_id, msg = null) {
    // ── Cek cache dulu ──
    const cached = userCache.get(telegram_id);
    if (cached && Date.now() < cached.expiresAt) return cached.data;

    // ── Hit database ──
    let { data } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegram_id)
        .maybeSingle();

    if (!data && msg) {
        const newUser = {
            telegram_id: telegram_id,
            username: msg.from.username || '',
            first_name: msg.from.first_name || 'User',
            premium_until: null,
            gender: null,
            is_banned: false,
            region: null,
        };
        await supabase.from('users').insert([newUser]);
        data = newUser;
        data.is_new_user = true;
    }

    if (data) userCache.set(telegram_id, { data, expiresAt: Date.now() + CACHE_TTL });
    return data;
}

/**
 * Update field tertentu di user dan invalidate cache
 * Dipakai setelah update gender, premium, dll.
 */
async function updateUserField(telegram_id, fields = {}) {
    await supabase.from('users').update(fields).eq('telegram_id', telegram_id);
    userCache.delete(telegram_id);
}

/**
 * Paksa invalidate cache untuk user tertentu
 * Dipakai setelah operasi yang mengubah data user
 */
function invalidateUserCache(telegram_id) {
    userCache.delete(telegram_id);
}

async function getAllUserIds({ skipBanned = true } = {}) {
    // Supabase membatasi 1000 baris per request → WAJIB paginasi.
    // Tanpa ini, broadcast hanya terkirim ke 1000 user pertama.
    const PAGE = 1000;
    const ids = [];
    for (let from = 0; ; from += PAGE) {
        const { data, error } = await supabase
            .from('users')
            .select('telegram_id, is_banned')
            .order('telegram_id', { ascending: true })
            .range(from, from + PAGE - 1);
        if (error) {
            console.error('❌ Gagal mengambil data user untuk broadcast:', error.message || error);
            break;
        }
        if (!data || data.length === 0) break;
        for (const u of data) {
            if (!u.telegram_id) continue;
            if (skipBanned && u.is_banned) continue;
            ids.push(u.telegram_id);
        }
        if (data.length < PAGE) break;
    }
    return ids;
}

module.exports = {
    supabase,
    getUser,
    updateUserField,
    invalidateUserCache,
    getAllUserIds,
};
