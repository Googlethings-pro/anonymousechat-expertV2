/**
 * SESSION MANAGER — Database Chat Session Logging
 * ══════════════════════════════════════════════════
 * Mencatat setiap sesi obrolan ke tabel chat_sessions di Supabase.
 */

const { supabase } = require('./supabase');

async function createSession(userA, userB) {
    try {
        const { data, error } = await supabase
            .from('chat_sessions')
            .insert({ user_a: userA, user_b: userB })
            .select()
            .single();
        if (error) return null;
        return data;
    } catch (e) { return null; }
}


async function closeSession(sessionId) {
    if (!sessionId) return;
    try {
        await supabase
            .from('chat_sessions')
            .update({ status: 'ended', ended_at: new Date().toISOString() })
            .eq('id', sessionId);
    } catch (e) { }
}


async function cleanupStaleSessions() {
    try {
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
        const { error } = await supabase
            .from('chat_sessions')
            .update({ status: 'ended', ended_at: new Date().toISOString() })
            .eq('status', 'active')
            .lt('started_at', twoHoursAgo);
        if (!error) console.log('[SessionManager] ✅ Stale session cleanup selesai');
    } catch (e) {
        console.log('[SessionManager] ℹ️ Cleanup skip (tabel belum ada)');
    }
}

// ── Auto-cleanup setiap jam ───────────────────────────────────────
setInterval(cleanupStaleSessions, 60 * 60 * 1000);
setTimeout(cleanupStaleSessions, 5000);

module.exports = { createSession, closeSession };
