# 🤖 Anonymous Chat Expert Bot — Panduan Instalasi Lengkap

> Bot Telegram anonymous chat dengan arsitektur siap scale untuk **10.000+ user aktif**.

---

## 📋 Daftar Isi

1. [Persyaratan Sistem](#persyaratan-sistem)
2. [Instalasi di Replit (Mode Dev)](#instalasi-di-replit)
3. [Instalasi di VPS (Mode Production)](#instalasi-di-vps)
4. [Konfigurasi Environment Variables](#environment-variables)
5. [Setup Database Supabase](#setup-database-supabase)
6. [Setup Redis (VPS Only)](#setup-redis)
7. [Setup PM2 Cluster](#setup-pm2-cluster)
8. [Setup Midtrans Payment](#setup-midtrans)
9. [Verifikasi & Monitoring](#verifikasi--monitoring)
10. [Arsitektur Teknis](#arsitektur-teknis)
11. [FAQ & Troubleshooting](#faq--troubleshooting)

---

## Persyaratan Sistem

### Replit (Development / Small Scale)
| Komponen | Versi |
|---|---|
| Node.js | 20+ |
| Replit Plan | Free (hingga ~500 user) / Reserved VM (ribuan user) |

### VPS (Production / 10.000+ User)
| Komponen | Versi | Keterangan |
|---|---|---|
| OS | Ubuntu 22.04+ / Debian 12+ | - |
| Node.js | 20 LTS | via nvm |
| Redis | 7.x | In-memory queue & session |
| PM2 | Latest | Process manager cluster |
| RAM | Min 2GB | 4GB+ direkomendasikan |
| CPU | Min 2 Core | 4+ Core untuk cluster |

---

## Instalasi di Replit

1. **Fork / Import project** ke Replit
2. Buka tab **Secrets** (ikon gembok di sidebar)
3. Tambahkan semua secrets dari tabel [Environment Variables](#environment-variables) di bawah
4. Setup database Supabase ([lihat bagian ini](#setup-database-supabase))
5. Klik **Run** atau workflow **Start Server** otomatis jalan

> Redis **tidak perlu diinstall** di Replit — bot otomatis pakai in-memory fallback.

---

## Instalasi di VPS

### 1. Persiapan Server

```bash
# Update sistem
sudo apt update && sudo apt upgrade -y

# Install tools dasar
sudo apt install -y curl git build-essential

# Install Node.js 20 via nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
nvm alias default 20
node --version  # Harus tampil v20.x.x
```

### 2. Clone & Install Dependencies

```bash
# Clone project
git clone <URL_REPO> /opt/anonymous-chat-bot
cd /opt/anonymous-chat-bot

# Install packages
npm install

# Install paket Redis untuk Node.js (WAJIB untuk VPS)
npm install redis
```

### 3. Konfigurasi Environment

```bash
# Salin file contoh
cp .env.example .env

# Edit dengan nilai asli
nano .env
```

Isi semua variabel sesuai tabel di bawah, lalu simpan.

---

## Environment Variables

Buat file `.env` di root project. Semua variabel ini **wajib** kecuali yang ditandai opsional.

```env
# ── TELEGRAM ─────────────────────────────────────────────────────
TELEGRAM_TOKEN=         # Token dari @BotFather
OWNER_ID=               # ID Telegram angka owner (cek via @userinfobot)
OWNER=                  # Username Telegram owner (tanpa @)
CHANNEL=                # Username channel official (tanpa @)
BOT_USERNAME=           # Username bot (tanpa @)

# ── SUPABASE (DATABASE) ───────────────────────────────────────────
SUPABASE_URL=           # https://xxxx.supabase.co
SUPABASE_KEY=           # Service role key (bukan anon key!)


# ── SERVER ────────────────────────────────────────────────────────
PORT=3000               # Port HTTP server
NODE_ENV=production     # 'development' di Replit, 'production' di VPS

# ── REDIS (OPSIONAL — hanya VPS) ──────────────────────────────────
# Jika tidak diset, bot pakai in-memory (fine untuk Replit / 1 instance)
# Wajib diset jika pakai PM2 Cluster (agar data queue tidak konflik antar instance)
REDIS_URL=redis://127.0.0.1:6379
# Jika Redis pakai password:
# REDIS_URL=redis://:password_kamu@127.0.0.1:6379
```

### Cara dapat masing-masing nilai:

| Variabel | Cara Mendapatkan |
|---|---|
| `TELEGRAM_TOKEN` | Chat @BotFather → /newbot → copy token |
| `OWNER_ID` | Chat @userinfobot → lihat angka "Id" |
| `OWNER` | Username Telegram kamu (tanpa @) |
| `CHANNEL` | Buat channel di Telegram, copy username tanpa @ |
| `BOT_USERNAME` | Username bot yang dibuat di BotFather (tanpa @) |
| `SUPABASE_URL` | Supabase Dashboard → Settings → API → Project URL |
| `SUPABASE_KEY` | Supabase Dashboard → Settings → API → **service_role** (bukan anon!) |
| `REDIS_URL` | redis://:password_kamu@127.0.0.1:6379 |



---

## Setup Database Supabase

### Langkah 1 — Buat Project Supabase

1. Buka [supabase.com](https://supabase.com) → New Project
2. Pilih region terdekat (Singapore untuk Indonesia)
3. Simpan password database di tempat aman

### Langkah 2 — Jalankan SQL Schema

Buka **Supabase Dashboard → SQL Editor → New Query**, paste SQL ini, lalu klik **Run** dan Run Without RLS:

INTINYA KALIAN MASUKKAN DULU YANG DI supabase.sql baru masukkan yang di supabase_tambahan.sql langsung copy paste saja yang difile itu

### Langkah 3 — Nonaktifkan RLS (Row Level Security)

Karena bot pakai **service_role key**, RLS harus dinonaktifkan agar bot bisa akses data:

```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions DISABLE ROW LEVEL SECURITY;
```

### Langkah 4 — Auto-Cleanup Data Lama (Opsional)

```sql
-- Hapus sesi yang sudah ended lebih dari 30 hari (hemat storage)
-- Jalankan manual atau jadwalkan via pg_cron
DELETE FROM chat_sessions
WHERE status = 'ended'
  AND ended_at < NOW() - INTERVAL '30 days';
```

---

## Setup Redis

> Hanya perlu di VPS. Di Replit, skip bagian ini.

### Instalasi Redis

```bash
# Install Redis
sudo apt install -y redis-server

# Konfigurasi Redis untuk production (OPTIONAL BISA GAK PAKE KARENA KITA MENGGUNAKAN LOCAL)
sudo nano /etc/redis/redis.conf
```

Edit baris-baris ini di redis.conf:

```conf
# Bind ke localhost saja (aman, tidak expose ke internet)
bind 127.0.0.1 -::1

# Aktifkan password (ganti 'password_kuat_kamu' dengan password asli)
requirepass password_kuat_kamu

# Simpan data ke disk tiap 5 menit jika ada 10+ perubahan
save 300 10

# Batas memory (sesuaikan RAM server)
maxmemory 256mb
maxmemory-policy allkeys-lru

# Log level
loglevel notice
logfile /var/log/redis/redis-server.log
```

```bash
# Restart dan aktifkan Redis
sudo systemctl restart redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server

Cek status Redis:
```bash
sudo systemctl status redis-server
```
*(Tekan `q` untuk keluar dari tampilan status).*


# Test Redis berjalan
redis-cli ping
# Harus jawab: PONG

# Test dengan password
redis-cli -a password_kuat_kamu ping
```

### Update REDIS_URL di .env

```env
# Jika pakai password:
REDIS_URL=redis://:password_kuat_kamu@127.0.0.1:6379

# Jika tanpa password:
REDIS_URL=redis://127.0.0.1:6379
```

---

## Setup PM2 Cluster

> Hanya untuk VPS. Membutuhkan Redis aktif.

```bash
# Install PM2 global
npm install -g pm2

# Pastikan REDIS_URL sudah diset di .env
cat .env | grep REDIS_URL

# Jalankan bot dengan PM2 Cluster
pm2 start ecosystem.config.js

# Lihat status semua instance
pm2 status

# Monitor real-time (CPU, RAM, log per instance)
pm2 monit

# Lihat logs
pm2 logs anonymous-chat-expert

# Auto-start saat VPS reboot
pm2 startup
# Ikuti perintah yang muncul (biasanya: sudo env PATH=... pm2 startup ...)
pm2 save
```

### Perintah PM2 yang Sering Dipakai

```bash
pm2 restart anonymous-chat-expert    # Restart semua instance
pm2 reload anonymous-chat-expert     # Reload tanpa downtime (zero-downtime)
pm2 stop anonymous-chat-expert       # Stop semua instance
pm2 delete anonymous-chat-expert     # Hapus dari PM2
pm2 scale anonymous-chat-expert 4    # Skala ke 4 instance manual
pm2 logs --lines 100                 # Lihat 100 baris log terakhir
```

---


## Verifikasi & Monitoring

### Cek Bot Berjalan

Kirim `/start` ke bot di Telegram. Harus muncul menu utama.

### Cek Log Startup

```bash
# Di VPS dengan PM2:
pm2 logs anonymous-chat-expert --lines 30

# Harusnya muncul:
# [✓] SYSTEM    : Bot is Online and Polling
# [i] DATABASE  : Supabase (Connected)
# [i] REDIS     : Enabled (redis://127.0.0.1:6379)
# [i] NODE ENV  : PRODUCTION
```

### Cek Status Redis

```bash
redis-cli -a password_kamu info server | grep redis_version
redis-cli -a password_kamu info clients | grep connected_clients
redis-cli -a password_kamu info memory | grep used_memory_human
```

### Cek Koneksi Supabase

```bash
# Dari terminal VPS
curl -s "https://SUPABASE_URL/rest/v1/users?select=count" \
  -H "apikey: SUPABASE_KEY" \
  -H "Authorization: Bearer SUPABASE_KEY"
# Harus return: [{"count":N}]
```

---

## Arsitektur Teknis

```
┌─────────────────────────────────────────────────────────┐
│                    TELEGRAM SERVERS                     │
└──────────────────────────┬──────────────────────────────┘
                           │ Polling (Long Poll)
                           ▼
┌─────────────────────────────────────────────────────────┐
│              PM2 CLUSTER (VPS) / Single (Replit)        │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐   │
│  │Instance 0│  │Instance 1│  │Instance 2│  │  ...   │   │
│  │index.js  │  │index.js  │  │index.js  │  │        │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬───┘   │
└───────┼─────────────┼─────────────┼─────────────┼───────┘
        │             │             │             │
        └─────────────┴──────┬──────┴─────────────┘
                             │ Shared State
              ┌──────────────┴──────────────┐
              │                             │
              ▼                             ▼
   ┌──────────────────┐          ┌──────────────────┐
   │     REDIS        │          │    SUPABASE      │
   │  queue:general   │          │  users table     │
   │  queue:male      │          │  chat_sessions   │
   │  queue:female    │          │  (PostgreSQL)    │
   │  user:meta:{id}  │          │                  │
   │  (In-memory      │          │  User cache 30s  │
   │   fallback jika  │          │  (di supabase.js)│
   │   no REDIS_URL)  │          │                  │
   └──────────────────┘          └──────────────────┘
```

### Komponen & Tanggung Jawab

| File | Peran |
|---|---|
| `index.js` | Main bot: commands, callbacks, chat relay, payment handling |
| `supabase.js` | DB client + **user cache TTL 30s** (85% less DB calls) |
| `redis.js` | Redis client + in-memory proxy fallback (auto-switch) |
| `queue.js` | Matchmaking queue abstraction (Redis-first, in-memory fallback) |
| `sessionManager.js` | Chat session DB logging + stale session cleanup |
| `captcha.js` | 3-type CAPTCHA generator (code / math / emoji) |
| `ecosystem.config.js` | PM2 cluster config untuk VPS |
| `languages.js` | 5 bahasa (ID, EN, AR, MS, ZH) |

### Flow Matchmaking

```
User ketik /cari
     │
     ▼
CAPTCHA check (3 tipe, 3 nyawa)
     │ lulus
     ▼
Rate limit check (max 10 cari/menit)
     │ aman
     ▼
Cek antrian queue.js
  ├─ Ada match → endChats setup → createSession() → mulai chat
  └─ Tidak ada → masuk waitingList (in-memory / Redis)
                     │
                     └─ Anti-ghosting timer (30 menit silence → warning)
```

---

## FAQ & Troubleshooting

### ❓ Bot tidak merespon setelah start

```bash
# Cek log
pm2 logs anonymous-chat-expert

# Pastikan TELEGRAM_TOKEN benar
echo $TELEGRAM_TOKEN

# Test token valid
curl "https://api.telegram.org/bot$TELEGRAM_TOKEN/getMe"
```

### ❓ Error "SUPABASE_URL is not defined"

Pastikan file `.env` ada dan variabel sudah diisi. Cek:
```bash
cat .env | grep SUPABASE
```

### ❓ Redis error "ECONNREFUSED"

Redis belum jalan atau REDIS_URL salah. Bot akan fallback ke in-memory otomatis.
```bash
sudo systemctl status redis-server
redis-cli ping
```

### ❓ PM2 cluster tapi user tidak bisa match / notifikasi bot dobel

Bot ini memakai **Telegram polling** (`node-telegram-bot-api`), dan polling hanya boleh punya **satu consumer**. Kalau `instances` di `ecosystem.config.js` lebih dari 1 (cluster), setiap proses punya `activeChats` + antrean sendiri-sendiri, jadi user bisa dapat 2x pesan `SEARCHING`, masuk 2 sesi sekaligus, atau seolah "balik ke sesi lama" setelah `/stop` atau `/next`.

**Solusi:** jalankan satu instance saja (`instances: 1`, `exec_mode: 'fork'` di `ecosystem.config.js`). Redis tetap dipakai untuk antrean + lock anti-double request.

### ❓ Bot lambat untuk 10.000+ user

Optimasi yang sudah ada:
- ✅ User cache 30 detik (supabase.js) — kurangi 85% DB call
- ✅ Typing indicator debounce 4 detik — kurangi Telegram API call
- ✅ Queue abstraction siap Redis
- ✅ Session logging async (non-blocking)

Tambahan jika masih lambat:
1. Upgrade RAM VPS ke 4GB+
2. Tambah CPU core → PM2 auto-scale
3. Aktifkan Redis → queue tidak blocking

### ❓ Sesi chat tersimpan terus di database, tidak terhapus

Ini disengaja untuk statistik. `sessionManager.js` hanya mengubah `status` ke `ended`, tidak delete.
Untuk hapus data lama, jalankan SQL di Supabase:
```sql
DELETE FROM chat_sessions
WHERE status = 'ended' AND ended_at < NOW() - INTERVAL '30 days';
```

---

## Kontak Developer

Bot dibuat oleh **Raihan_official0307**

---

*Dokumentasi ini dibuat otomatis. Versi terakhir: Juni 2026.*
