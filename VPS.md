# Panduan Setup VPS & Instalasi Bot

Dokumen ini berisi panduan langkah demi langkah untuk melakukan setup pada VPS baru (Ubuntu/Debian) dari awal hingga bot Anda berjalan stabil menggunakan **PM2** dan **Redis**.

---

## 1. Update Server & Instalasi Kebutuhan Dasar
Langkah pertama setelah masuk (login) ke VPS adalah memperbarui sistem dan menginstal paket dasar.
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install curl git build-essential -y
```

---

## 2. Instalasi Node.js & NPM
Sebaiknya gunakan NodeSource untuk menginstal versi Node.js yang stabil (misalnya versi 20 LTS).
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```
Cek apakah instalasi berhasil:
```bash
node -v
npm -v
```

---

## 3. Instalasi Redis Server
Bot ini menggunakan Redis. Jalankan perintah berikut untuk menginstal dan menyalakan Redis di VPS:
```bash
sudo apt install redis-server -y
```
Pastikan service Redis berjalan secara otomatis ketika VPS direstart:
```bash
sudo systemctl enable redis-server
sudo systemctl start redis-server
```
Cek status Redis:
```bash
sudo systemctl status redis-server
```
*(Tekan `q` untuk keluar dari tampilan status).*

---

## 4. Instalasi PM2
PM2 digunakan agar bot tetap berjalan di latar belakang (background) dan otomatis melakukan *restart* jika terjadi error atau server *reboot*.
```bash
sudo npm install -g pm2
```

---

## 5. Menyiapkan Folder Project & Source Code
Jika menggunakan GitHub/GitLab, Anda bisa melakukan *clone*. Jika mengupload manual, pastikan semua file Anda berada di dalam satu folder.
```bash
# Contoh jika clone dari git
# cd anonymouse-chat
```
Setelah berada di dalam folder project, instal semua modul/library (dependencies):
```bash
npm install
```

---

## 6. Konfigurasi File `.env`
Buat file konfigurasi `.env` (atau *rename* dari `.env.example`).
```bash
nano .env
```
Isi dengan pengaturan yang dibutuhkan bot Anda. Untuk Redis yang berjalan di VPS yang sama (Localhost), pengaturannya biasanya seperti ini:

```env
TELEGRAM_TOKEN=
OWNER_ID=
OWNER=
CHANNEL=
BOT_USERNAME=
DEV_DOMAIN=

SUPABASE_URL=
SUPABASE_KEY=
PORT=3000

# ── 5. REDIS (hanya untuk VPS/Production) ─────────────
# Jika tidak diset, bot otomatis pakai in-memory (cocok untuk Replit)
# Aktifkan ini hanya ketika deploy ke VPS dengan Redis terinstall
# Format: redis://localhost:6379 atau redis://:password@host:6379
REDIS_URL=redis://127.0.0.1:6379


NODE_ENV=production
```
Simpan dan keluar (di Nano: tekan `Ctrl + X`, lalu `Y`, dan `Enter`).

---

## 7. Konfigurasi PM2 (`ecosystem.config.js`)
File tersebut sudah ada
---

## 8. Menjalankan Bot
Setelah Redis menyala, `.env` siap, dan `ecosystem.config.js` sudah dibuat, sekarang saatnya menyalakan bot.

Jalankan perintah ini di dalam folder project:
```bash
pm2 start ecosystem.config.js
```

Untuk melihat proses apakah bot sudah berjalan dengan baik (melihat *console.log*):
```bash
pm2 logs
```

### Menyimpan Konfigurasi PM2 agar Auto-start (saat Server Reboot)
Agar bot otomatis menyala lagi saat VPS baru saja direstart, jalankan perintah berikut:
```bash
pm2 save
pm2 startup
```
*Catatan: Perintah `pm2 startup` mungkin akan memberikan sebuah command panjang untuk Anda copy-paste dan jalankan di terminal. Ikuti instruksi yang muncul di layar tersebut.*

---

## Kumpulan Perintah Penting (Cheat Sheet)
- `pm2 status` : Melihat daftar aplikasi yang berjalan.
- `pm2 logs` : Melihat log bot secara live (tekan `Ctrl+C` untuk keluar).
- `pm2 restart anonymous-chat-expert` : Merestart bot.
- `pm2 stop anonymous-chat-expert` : Mematikan bot sementara.
- `pm2 delete anonymous-chat-expertt` : Menghapus bot dari PM2.
- `redis-cli ping` : Mengetes koneksi redis (Seharusnya muncul "PONG").
