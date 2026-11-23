# UPDATE V2 — Panduan Deploy & Update Bot dari GitHub (VPS Client)

Panduan ini untuk **pemilik server (client VPS)**. Dulu file bot di-upload manual dari Google Drive.
Sekarang sumber kode resminya **GitHub**, dan update dilakukan dengan `git pull` — **tanpa pernah menghapus `.env`**.

---

## 0. Ganti dulu nilai berikut (dipakai di semua perintah bawah)

| Variabel | Contoh | Keterangan |
|---|---|---|
| `BOT_DIR` | `/opt/anonymouse-chat` | folder bot yang baru (dari GitHub) |
| `OLD_DIR` | `/root/bot-lama` | folder bot lama (hasil upload Drive) |
| `REPO` | `git@github.com:username/anonymous-chat.git` | URL repo GitHub |
| `APP` | `anonymous-chat-expert` | nama proses di PM2 (dari `ecosystem.config.js`) |

Perintah untuk mempermudah (jalankan sekali di sesi SSH):

```bash
BOT_DIR=/opt/anonymouse-chat
OLD_DIR=/root/bot-lama
REPO=git@github.com:username/anonymous-chat.git
APP=anonymous-chat-expert
```

### Yang berubah di versi ini (penting untuk VPS)

| Perubahan | Alasan |
|---|---|
| `ecosystem.config.js`: `wait_ready: false` | bot tidak memanggil `process.send('ready')`; kalau `true`, PM2 menganggap gagal lalu restart terus |
| `index.js`: shutdown rapi (`SIGINT`/`SIGTERM`) | `pm2 restart` langsung jalan, kunci `bot:polling-owner` dilepas otomatis (tidak menunggu 20 detik) |
| `instances: 1`, `exec_mode: 'fork'` | polling Telegram hanya boleh satu proses |
| `.gitignore` menambah `*.rdb`, `logs/`, `data/*.json` | supaya `git pull` tidak menimpa data runtime server |

---

## 1. Prasyarat di VPS (cek sekali)

```bash
node -v      # HARUS v18 ke atas, disarankan v20 / v22 LTS
npm -v
git --version
redis-cli ping   # harus menjawab: PONG
pm2 -v
```

Kalau ada yang belum ada:

```bash
# Node 20 LTS (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git redis-server

sudo npm install -g pm2
sudo systemctl enable --now redis-server

# Jam server ke WIB (supaya tanggal premium & log tidak meleset)
sudo timedatectl set-timezone Asia/Jakarta
```

---

## 2. BAGIAN A — Migrasi awal Drive → GitHub (SEKALI SAJA)

### A1. Dari sisi pemilik kode (bukan VPS)
Repo dibuat sekali di GitHub, lalu kode di-push:

```bash
git init
git add .
git status            # PASTIKAN .env TIDAK ikut terdaftar
git commit -m "Initial commit bot v2"
git branch -M main
git remote add origin git@github.com:username/anonymous-chat.git
git push -u origin main
```

> `.gitignore` sudah mengecualikan `.env`, `node_modules/`, `*.log`, `data/*.json`, `*.rdb`.
> Cek dengan: `git ls-files | grep -E "^\.env$"` → **harus kosong**.

Repo **private** + **Deploy Key read-only** disarankan untuk VPS.

### A2. Backup folder lama di VPS (WAJIB, jangan dilewati)

```bash
sudo cp -a $OLD_DIR $OLD_DIR-backup-$(date +%F)
sudo cp -a $OLD_DIR/.env /root/env-backup-$(date +%F).env
ls -l /root/env-backup-*.env
```

### A3. Ambil kode dari GitHub ke folder BARU (folder lama tidak disentuh)

```bash
sudo mkdir -p $BOT_DIR
sudo chown -R $USER:$USER $BOT_DIR
git clone $REPO $BOT_DIR
cd $BOT_DIR
git log --oneline -3        # pastikan commit terbaru muncul
```

Kalau repo private, siapkan akses dulu:

```bash
# Opsi A (disarankan): Deploy Key read-only
ssh-keygen -t ed25519 -C "vps-bot" -f ~/.ssh/id_ed25519_bot -N ""
cat ~/.ssh/id_ed25519_bot.pub     # tempel di GitHub → Repo → Settings → Deploy keys (read-only)

cat >> ~/.ssh/config <<'EOF'
Host github.com
  IdentityFile ~/.ssh/id_ed25519_bot
  IdentitiesOnly yes
EOF

# Opsi B: HTTPS + Personal Access Token
# git clone https://<TOKEN>@github.com/username/anonymous-chat.git $BOT_DIR
```

### A4. Pindahkan `.env` dan data runtime dari folder lama (JANGAN bikin baru)

```bash
cd $BOT_DIR
cp $OLD_DIR/.env .env
chmod 600 .env

# Data runtime yang tidak ada di GitHub (kalau folder lama punya)
mkdir -p data
[ -d $OLD_DIR/data ] && cp -an $OLD_DIR/data/. ./data/ 2>/dev/null || true

ls -l .env
grep -c "=" .env            # isinya harus sama seperti yang lama
```

Isi `.env` yang dibaca bot ini (untuk memastikan tidak ada yang hilang):

```
# wajib
TELEGRAM_TOKEN=...
OWNER_ID=...
SUPABASE_URL=...
SUPABASE_KEY=...
REDIS_URL=redis://127.0.0.1:6379
PORT=3000

# opsional (tergantung fitur yang dipakai)
CHANNEL=@channelkamu
OWNER=@usernameowner
DEV_DOMAIN=https://domain-kamu.com
MIDTRANS_SERVER_KEY=...
MIDTRANS_IS_PRODUCTION=false
```

> Kalau `.env` lama kosong/rusak, buka `$OLD_DIR-backup-*/` atau minta ulang ke pemilik kode. **Jangan** membuat `.env` baru dari nol tanpa data asli.

### A5. Install dependency & uji tanpa menjalankan

```bash
cd $BOT_DIR
npm install
node --check index.js && node --check queue.js && node --check redis.js && echo "SINTAKS OK"
```

### A6. Matikan bot lama, lalu jalankan versi baru

```bash
pm2 delete all 2>/dev/null || true
pkill -f "node index.js" 2>/dev/null || true
sleep 2

cd $BOT_DIR
pm2 start ecosystem.config.js
pm2 save
pm2 startup            # ikuti instruksi yang dicetak, supaya auto-start saat reboot
```

### A7. Verifikasi (lihat Bagian 4 & 5 di bawah), lalu arsipkan folder lama

```bash
mv $OLD_DIR $OLD_DIR-arsip-$(date +%F)
```

Jangan langsung dihapus — simpan 1–2 minggu sebagai cadangan.

---

## 3. BAGIAN B — Update rutin (setiap ada versi baru)

**Aturan utama: jangan pernah mengedit file di server.** Semua perubahan datang dari `git pull`.
Kalau pernah mengedit manual, `git pull` akan konflik.

### 3.1 Cara cepat (skrip `update.sh`)

Simpan sekali di `$BOT_DIR/update.sh` (file ini aman, tidak dilacak git):

```bash
#!/usr/bin/env bash
set -e
cd /opt/anonymouse-chat

echo "== 1/6 Cek perubahan lokal =="
if [ -n "$(git status --porcelain)" ]; then
  echo "!! Ada file yang diubah manual di server. Jalankan: git stash"
  git status --short
  exit 1
fi

echo "== 2/6 Backup .env =="
cp .env "$HOME/env-backup-$(date +%F-%H%M).env"
chmod 600 "$HOME"/env-backup-*.env

echo "== 3/6 Tarik kode terbaru =="
git pull --ff-only

echo "== 4/6 Dependency (hanya jika package.json berubah) =="
if git diff --name-only ORIG_HEAD HEAD 2>/dev/null | grep -q "package.json"; then
  npm install --omit=dev
else
  echo "   package.json tidak berubah — lewati npm install"
fi

echo "== 5/6 Cek sintaks =="
node --check index.js
node --check queue.js
node --check redis.js
node --check supabase.js

echo "== 6/6 Restart bot =="
pm2 restart anonymous-chat-expert --update-env
sleep 6
pm2 logs anonymous-chat-expert --lines 40 --nostream
```

```bash
chmod +x /opt/anonymouse-chat/update.sh
/opt/anonymouse-chat/update.sh
```

### 3.2 Cara manual (kalau tidak mau pakai skrip)

```bash
cd /opt/anonymouse-chat

# 1) pastikan tidak ada perubahan lokal
git status --short          # harus kosong

# 2) backup .env (berjaga-jaga)
cp .env ~/env-backup-$(date +%F-%H%M).env

# 3) ambil update
git pull --ff-only

# 4) hanya kalau package.json berubah
npm install --omit=dev

# 5) cek sintaks
node --check index.js

# 6) restart (JANGAN pakai "pm2 restart all" kalau ada app lain)
pm2 restart anonymous-chat-expert --update-env

# 7) lihat log
pm2 logs anonymous-chat-expert --lines 40 --nostream
```

> `ecosystem.config.js` sekarang memakai `instances: 1` + `exec_mode: 'fork'`.
> **Jangan pernah** mengubahnya jadi `cluster`/`instances > 1` — bot polling Telegram hanya boleh punya satu proses, kalau lebih akan muncul notifikasi dobel.

---

## 4. BAGIAN C — Cek Redis (WAJIB sebelum & sesudah update)

Redis adalah "otak" antrean pasangan. Kalau Redis mati, bot **tetap jalan** tapi masuk mode satu-proses (antrean di memori) → rawan tidak sinkron setelah restart. Karena itu Redis harus hidup dulu.

```bash
# 1) service hidup?
sudo systemctl status redis-server --no-pager | head -5
redis-cli ping                     # → PONG

# 2) bot terhubung ke Redis?
grep REDIS_URL /opt/anonymouse-chat/.env

# 3) apakah hanya SATU proses yang polling?
redis-cli get bot:polling-owner

# 4) isi antrean sekarang
redis-cli llen queue:general
redis-cli llen queue:age
redis-cli dbsize
```

Interpretasi:

| Hasil | Arti | Tindakan |
|---|---|---|
| `PONG` | Redis normal | lanjut |
| `Could not connect to Redis` | Redis mati | `sudo systemctl start redis-server` |
| `bot:polling-owner` berisi PID/host lama | proses lama mati mendadak | `redis-cli del bot:polling-owner` **hanya saat bot sedang mati** |
| `queue:general` besar tapi tidak ada user online | antrean basi | lihat 4.1 |

### 4.1 Bersihkan antrean basi (HANYA kalau user mengeluh "nyangkut / tidak dapat pasangan")

```bash
pm2 stop anonymous-chat-expert            # 1) stop dulu, WAJIB

redis-cli --scan --pattern 'queue:*' | xargs -r redis-cli del
redis-cli --scan --pattern 'search:*' | xargs -r redis-cli del
redis-cli del bot:polling-owner

pm2 start anonymous-chat-expert           # 2) nyalakan lagi
```

> Jangan pakai `redis-cli FLUSHALL` kalau Redis-nya dipakai aplikasi lain.

---

## 5. BAGIAN D — Verifikasi bot benar-benar normal

### 5.1 Log startup (harus muncul baris ini)

```bash
pm2 logs anonymous-chat-expert --lines 60 --nostream
```

Yang **harus ada**:

```
[Bot] ✅ Polling Telegram dimulai (single owner).
```

Yang **harus TIDAK ada**:

| Di log | Arti | Solusi |
|---|---|---|
| `⏳ Menunggu instance lain berhenti` | masih ada proses bot lain | `pkill -f "node index.js"`, atau saat bot mati: `redis-cli del bot:polling-owner` |
| `polling_error ... 409 Conflict` | dua proses polling token yang sama | sama seperti di atas |
| `Redis tidak aktif` | `REDIS_URL` salah / Redis mati | cek `.env` + `systemctl start redis-server` |
| `SUPABASE` / `Invalid API key` | `.env` rusak | pulihkan dari `~/env-backup-*.env` |
| `Cannot find module ...` | dependency belum lengkap | `npm install` |

### 5.2 Uji dari Telegram (pakai 2 akun)

1. Akun A kirim `/start` → balasan welcome (hanya **satu** pesan).
2. Akun A kirim `/search`, lalu `/stop`, lalu `/search` lagi → pesan status **di-edit**, bukan menumpuk jadi 3 pesan.
3. Akun A `/search` + Akun B `/search` → keduanya dapat "PARTNER FOUND" tanpa notifikasi dobel.
4. `/next` dua kali cepat → tidak ada pesan ganda, tidak balik ke sesi lama.
5. `/profil` (atau `/settings`) terbuka → koneksi Supabase sehat.
6. `/vip` → pilih paket → invoice Telegram Stars muncul (kalau dibatalkan, tidak ada error di log).

Kalau 1–6 lolos, deploy dianggap **sukses**.

### 5.3 Cek resource

```bash
pm2 status                     # status: online, restart: 0–2
pm2 monit                      # CPU / memory
free -h                        # RAM sisa
df -h /                        # disk (log bisa menumpuk)
```

---

## 6. BAGIAN E — Rollback (kalau versi baru bermasalah)

```bash
cd /opt/anonymouse-chat
git log --oneline -5                     # lihat commit
git reset --hard <commit_sha_lama>       # kembali ke versi sebelumnya
npm install --omit=dev
pm2 restart anonymous-chat-expert --update-env
pm2 logs anonymous-chat-expert --lines 40 --nostream
```

Kalau `.env` ikut bermasalah:

```bash
cp ~/env-backup-YYYY-MM-DD-HHMM.env .env && chmod 600 .env
pm2 restart anonymous-chat-expert --update-env
```

---

## 7. BAGIAN F — Masalah umum & solusinya

| Gejala | Penyebab | Solusi |
|---|---|---|
| Bot online tapi tidak membalas apa pun | token salah / token dipakai proses lain | cek `TELEGRAM_TOKEN`, `pm2 delete all` lalu start ulang |
| Notifikasi dobel | ada 2 proses bot / `instances > 1` | `pkill -f "node index.js"`, pastikan `instances: 1`, `exec_mode: 'fork'` |
| "kembali ke sesi lama" setelah `/stop` | proses lama masih polling | sama seperti di atas + `redis-cli del bot:polling-owner` saat bot mati |
| User nyangkut "mencari pasangan" | antrean basi di Redis | Bagian 4.1 |
| `git pull` ditolak: "local changes would be overwritten" | ada file diedit di server | `git stash` (simpan) → `git pull` → bandingkan, **jangan** `git checkout .` tanpa cek |
| `git pull` ditolak: "diverged" | commit dibuat langsung di server | `git stash` + `git reset --hard origin/main` (kode server tidak dianggap sumber) |
| Invoice Stars error | koneksi Telegram / plan tidak dikenal | lihat log; pastikan paket VIP sesuai `PREMIUM_PLANS` di `index.js` |
| Bot mati setelah reboot VPS | `pm2 save` / `pm2 startup` belum dijalankan | jalankan keduanya sekali |
| Memory naik terus | log/antrean menumpuk | `pm2 restart`, pasang `pm2 install pm2-logrotate` |

---

## 8. Checklist update (cetak & tempel di dekat server)

```
[ ] redis-cli ping  → PONG
[ ] cd $BOT_DIR && git status --short  → kosong
[ ] cp .env ~/env-backup-$(date +%F).env
[ ] git pull --ff-only  → sukses
[ ] npm install --omit=dev   (hanya kalau package.json berubah)
[ ] node --check index.js  → tidak ada error
[ ] pm2 restart $APP --update-env
[ ] log muncul: "[Bot] ✅ Polling Telegram dimulai (single owner)."
[ ] log TIDAK ada: 409 Conflict / "Menunggu instance lain" / "Redis tidak aktif"
[ ] tes Telegram: /start, /search, /stop, /search, /next
[ ] redis-cli llen queue:general  → wajar (bukan ribuan)
```

---

## 9. Aturan yang tidak boleh dilanggar

1. **`.env` tidak pernah masuk GitHub** dan tidak pernah ditimpa `git pull`. Selalu backup sebelum update.
2. **Jangan edit file di server.** Ubah di repo → push → `git pull` di VPS.
3. **Satu proses saja** (`instances: 1`, `exec_mode: 'fork'`). Dua proses = notifikasi dobel & sesi hantu.
4. **Redis harus hidup** sebelum bot distart.
5. **Jangan `pm2 restart all`** kalau di VPS ada aplikasi lain — sebut nama app-nya.
6. **Jangan `FLUSHALL`** di Redis bersama.
7. Setelah update besar: uji `/search` → `/stop` → `/search` di Telegram. Kalau pesan status menumpuk, berarti update belum ter-load (cek `pm2 restart` benar-benar jalan).

---

## 10. Ringkasan perintah harian (copy-paste)

```bash
# update
/opt/anonymouse-chat/update.sh

# kalau tanpa skrip
cd /opt/anonymouse-chat && cp .env ~/env-backup-$(date +%F).env && git pull --ff-only && pm2 restart anonymous-chat-expert --update-env && pm2 logs anonymous-chat-expert --lines 40 --nostream

# cek sehat
redis-cli ping && redis-cli get bot:polling-owner && pm2 status

# restart bersih
pm2 delete anonymous-chat-expert; cd /opt/anonymouse-chat && pm2 start ecosystem.config.js && pm2 save
```
