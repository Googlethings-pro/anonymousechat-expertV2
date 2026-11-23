-- =================================================================
-- supabase_chat_sessions.sql
-- Jalankan SQL ini di Supabase SQL Editor (https://supabase.com)
-- =================================================================

-- Tabel untuk mencatat setiap sesi obrolan anonim
CREATE TABLE IF NOT EXISTS chat_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_a BIGINT NOT NULL,
    user_b BIGINT NOT NULL,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    last_message_a TIMESTAMPTZ DEFAULT NOW(),
    last_message_b TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'active',
    ended_at TIMESTAMPTZ,
    session_uuid UUID DEFAULT gen_random_uuid()
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_a ON chat_sessions(user_a);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_b ON chat_sessions(user_b);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_status ON chat_sessions(status);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_started_at ON chat_sessions(started_at DESC);

DELETE FROM chat_sessions 
WHERE status = 'ended' AND ended_at < NOW() - INTERVAL '30 days';

-- REGION SYSTEM
ALTER TABLE users ADD COLUMN IF NOT EXISTS region VARCHAR(10) DEFAULT NULL;
CREATE INDEX IF NOT EXISTS idx_users_region ON users(region);
CREATE INDEX IF NOT EXISTS idx_users_region_notnull ON users(region) WHERE region IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_region_id ON users(region, telegram_id) WHERE region IS NOT NULL;

-- =================================================================
-- MIGRATION v2.0 — Hapus Sistem Token dan Redeem
-- Jalankan bagian ini setelah deploy bot versi terbaru
-- =================================================================

-- Hapus kolom tokens dari tabel users
ALTER TABLE users DROP COLUMN IF EXISTS tokens;

-- Hapus tabel redeem (tidak digunakan lagi)
DROP TABLE IF EXISTS redeem_history;
DROP TABLE IF EXISTS redeem_codes;

-- =================================================================
-- Struktur tabel users setelah migration:
--   telegram_id    BIGINT PRIMARY KEY
--   username       TEXT
--   first_name     TEXT
--   gender         TEXT
--   premium_until  TIMESTAMP WITH TIME ZONE
--   is_banned      BOOLEAN DEFAULT FALSE
--   referral_count INTEGER DEFAULT 0
--   referred_by    BIGINT DEFAULT NULL
--   age            INT4
--   rating         INTEGER DEFAULT 0
--   region         VARCHAR(10) DEFAULT NULL
-- =================================================================

