CREATE TABLE users (
    telegram_id BIGINT PRIMARY KEY,
    username TEXT,
    first_name TEXT,
    gender TEXT, 
    tokens INT DEFAULT 0,
    premium_until TIMESTAMP WITH TIME ZONE
);


ALTER TABLE users ADD COLUMN is_banned BOOLEAN DEFAULT FALSE;


-- 1. Tambahkan kolom untuk menghitung berapa kali user berhasil mengundang
ALTER TABLE users ADD COLUMN referral_count INTEGER DEFAULT 0;

-- 2. Buat tabel baru untuk mencatat riwayat siapa mengundang siapa
CREATE TABLE referrals (
    id SERIAL PRIMARY KEY,
    referrer_id BIGINT NOT NULL,
    referee_id BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(referee_id) -- Mencegah 1 orang yang sama diundang 2 kali
);

ALTER TABLE users ADD COLUMN referred_by BIGINT DEFAULT NULL;


-- Tabel untuk menyimpan kode redeem buatan Owner
CREATE TABLE redeem_codes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    reward_tokens INTEGER NOT NULL,
    max_uses INTEGER NOT NULL,
    current_uses INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel riwayat penukaran (Mencegah 1 user klaim 2 kali)
CREATE TABLE redeem_history (
    id SERIAL PRIMARY KEY,
    telegram_id BIGINT NOT NULL,
    code VARCHAR(50) NOT NULL,
    redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(telegram_id, code) -- Aturan ketat: 1 ID hanya bisa punya 1 kode yang sama
);

ALTER TABLE users
ADD COLUMN age INT4;

ALTER TABLE users 
ADD COLUMN rating INTEGER DEFAULT 0;
