
<div align="center">

# ⚡️ ANONYMOUS CHAT EXPERT ⚡️

**Premium Telegram Bot for Anonymous Matchmaking & Chatting**

[![Node.js](https://img.shields.io/badge/Node.js-20%20LTS-green?logo=nodedotjs)](#)
[![Telegram API](https://img.shields.io/badge/Telegram_API-Ready-2CA5E0?logo=telegram&logoColor=white)](#)
[![Supabase](https://img.shields.io/badge/Supabase-Database-%233FCF8E?logo=supabase&logoColor=white)](#)
[![Midtrans](https://img.shields.io/badge/Midtrans-Payment-blue)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#)

> 🔐 *Sapa dunia tanpa nama. Temukan teman ngobrol, sahabat, atau pasangan secara instan, aman, dan tanpa jejak!* 

Dibuat dengan ❤️ oleh [@raihan_official0307](https://t.me/raihan_official0307) | GitHub: [Dikrey](https://github.com/Dikrey)

---
</div>

## 🌟 Mengapa Bot Ini Berbeda?
Bukan sekadar bot *random chat* biasa. **Anonymous Chat Expert** dibangun dengan arsitektur *Enterprise-Grade*, dilengkapi dengan sistem ekonomi virtual (Token), *Payment Gateway* terintegrasi (QRIS/GoPay & Telegram Stars), algoritma perjodohan (*Cross-Matching Queue*), hingga fitur Gamifikasi (Referral & Redeem Code) dilengkapi lebih dari 27+ fitur. 

---

## 🚀 FITUR LENGKAP (ULTRA-DETAILED)

### 💬 Core Matchmaking System
*   🔍 **Smart Random Search:** Terhubung dengan pengguna lain secara acak dengan antrean cerdas.
*   🚻 **Cross-Queue Gender Match:** Pengguna Premium dapat mencari partner berdasarkan jenis kelamin (Pria/Wanita), dan sistem akan secara cerdas mencarikannya dari antrean global maupun antrean spesifik.
*   ⏭️ **Next & Stop:** Lewati (*skip*) obrolan yang membosankan dengan `/next` atau hentikan kapan saja dengan `/stop`.
*   ⏳ **Anti-Spam Cooldown:** Jeda 20 detik untuk penggunaan command `/next` secara terus-menerus guna mencegah *spam* antrean.

### 💰 Ekonomi & Pembayaran (Monetization)
*   🪙 **Sistem Token (XTR):** Mata uang virtual di dalam bot untuk mengakses fitur-fitur eksklusif.
*   💳 **Midtrans Integration:** Topup Token otomatis via QRIS, GoPay, dan Transfer Bank.
*   ⭐️ **Telegram Stars Integration:** Dukungan pembayaran *native* menggunakan Telegram Stars untuk kenyamanan pengguna global.

### 💎 VIP & Premium Features
*   🌟 **Langganan Premium:** Bebas iklan, prioritas *matchmaking*, dan akses mencari partner berdasarkan jenis kelamin.
*   👑 **Status VIP Sultan:** Akses permanen, *badge* eksklusif `👑 [VIP]` di setiap pesan chat, dan prioritas antrean tertinggi.
*   🪪 **Paywall Profil:** Hanya pengguna Premium/VIP yang dapat melihat ID, Username, dan Gender asli lawan bicara saat terhubung (Pengguna gratis akan melihat data yang di-*sensor*).
*   💎 **Taktik Upselling: Filter Link & URL Khusus VIP** Cara Kerjanya: Pengguna Reguler: Jika mereka mencoba mengirim link (contoh: t.me/, http://, www.), pesannya akan diblokir. Bot akan membalas dengan tawaran: "Hanya VIP yang bisa kirim link! Yuk upgrade sekarang." Pengguna VIP & Owner: Memiliki Hak Veto. Mereka bebas membagikan link grup, link jualan, atau sosial media tanpa batas.
*   🎨 **UI/UX Chat Mewah (Gamifikasi Status)** Cara Kerjanya: Pengalaman visual saat berkirim pesan sekarang dibedakan berdasarkan "Kasta" pengguna: Pengguna Reguler: Menggunakan badge 👤 REGULER dengan teks obrolan standar. Pengguna VIP (Premium): Menggunakan badge 👑 VIP SULTAN. Hebatnya lagi, teks pesan mereka dibalut dengan efek Blockquote bercahaya, membuat pesannya memiliki bingkai garis samping yang sangat menonjol dan elegan.

### 🎮 Gamifikasi & Growth Hacks
*   🎁 **Sistem Referral (Undang Teman):** Pengguna memiliki *link* unik. Sistem menggunakan logika *Pending Referral* (Koin bonus hanya cair setelah teman yang diundang selesai mengatur jenis kelamin).
*   🎟️ **Redeem Code System:** *Owner* dapat membuat kode promo dengan limit kuota tertentu (contoh: `GRATIS10` untuk 50 orang pertama). Pengguna menukarkan kode via `/redeem`.
*   💌 **Ice Breaker: Tombol "Ajak Kenalan" Eksklusif** Cara Kerjanya: Di tengah-tengah asyiknya chatting, pengguna bisa menekan tombol "💌 Ajak Kenalan (Kirim Username)". Efeknya: Bot akan otomatis mengirimkan pesan yang sangat elegan ke partner mereka: "Kamu sangat menarik, sepertinya kita bisa kenalan lebih lanjut di t.me/username_kamu". Tombol ini membuat transisi dari chat anonim ke chat pribadi menjadi sangat keren dan tidak canggung.

### 🛡️ Keamanan & Moderasi Otomatis
*   🎭 **Efek Sensor UI `<tg-spoiler>`:** ID Telegram pada menu utama disamarkan (*blur*) hingga ditekan, demi menjaga privasi saat pengguna merekam layar.
*   🤬 **Smart Censor & Filter Kata Kasar** Cara Kerjanya: Bot memindai setiap pesan teks secara real-time. Jika mendeteksi kata-kata terlarang (kotor/kasar), pesan aslinya akan langsung dihapus sebelum sampai ke partner. Efeknya: Pesan akan diganti menjadi teks merah peringatan 🤬 [Pesan disensor oleh sistem keamanan], dan pengirimnya akan mendapat teguran langsung.
*   🚨 **Advanced Report System:** Saat chat berakhir, pengguna dapat memberikan *feedback* (👍 Like, 👎 Dislike, 🔞 Vulgar, atau ⚠️ Laporkan dengan alasan spesifik seperti VCS, Spam, Mengemis, dll).
*   🧼 **XSS/HTML Cleaner:** Sistem otomatis membersihkan karakter ilegal (`<`, `>`, `&`) dari nama pengguna untuk mencegah *crash* pada *parse_mode* HTML Telegram.
*   🚫 **Satpam Anti-Banned:** Pengguna yang diblokir otomatis terputus dari antrean dan dilarang mengakses menu `/start`.
*   🚫 **Satpam Automatic Banned:** Pengguna yang melakukan spam 3x berturut-turut akan terbanned otomatis oleh sistem & terputus dari antrean dan dilarang mengakses menu `/start`.
*   🛡️ **Gatekeeper: Wajib Username Telegram** Cara Kerjanya: Saat ada pengguna baru menekan /start, sistem akan memindai akun Telegram mereka. Jika mereka belum memiliki username Telegram (akun bodong/kosong), bot akan langsung menolak akses mereka. Fungsinya: Mencegah akun-akun hantu (bot spammer atau tuyul) masuk ke database kamu, serta memastikan fitur "Ajak Kenalan" nantinya bisa berjalan dengan lancar.
*   🚓 **Mesin Keamanan Lapis Baja: Anti-Spam & Auto-Ban BY Visualcodepo** Speed Tracker: Sistem membaca milidetik (ms) kecepatan pesan. Jika ada yang mengetik terlalu cepat bagaikan mesin (kurang dari 1.5 detik per pesan) sebanyak 5 kali berturut-turut, sistem akan mencatatnya sebagai 1 Strike.

Efek Freeze (Beku): Mendapat 1 Strike? Akun pengguna akan dibekukan selama 30 detik. Mereka tidak bisa mengirim pesan sama sekali, dan partner mereka diberi tahu bahwa lawan bicaranya sedang dibekukan karena spam.

Auto-Ban: Jika pengguna ngeyel dan mendapat 3x Strike spam, bot akan tanpa ampun mengeksekusi Banned Permanen.

### 🎛️ Admin & Owner Dashboard
*   📢 **Live Broadcast Panel:** *Owner* dapat menyiarkan pesan ke seluruh *database* pengguna dengan jeda pengiriman (50ms) agar anti-banned oleh Telegram.
*   📊 **Real-Time Server Stats:** Menu utama menampilkan jumlah pengguna terdaftar dan jumlah obrolan yang sedang aktif secara *real-time*.
*   🔨 **Direct Action Button:** Notifikasi laporan masuk ke Owner dilengkapi tombol *inline* untuk `Banned`, `Hapus Akun`, atau `Cabut Premium` target hanya dengan 1 klik.

---

## 🛠️ ARSITEKTUR FILE & DATABASE
Sistem ini menggunakan **Supabase (PostgreSQL)** untuk kecepatan dan keandalan tingkat tinggi.

```text
anonytele/
├── index.js          # Entry point & Telegram Polling
├── supabase.js       # Database handler & Referral logic
├── redeem.js         # Gamification & Redeem code engine
├── supabase.sql      # Database schema
├── .gitignore        # Ignore
├── .env.example      # Environment Variables (Public)
├── package.json      # Dependencies
├── package-lock.json # Dependencies Lock
├── README.md         # This File
└── .env              # Environment Variables (Secret)
```

**Tabel Database (Supabase):**
1.  `users` *(Menyimpan ID, Token, Premium, Gender, Hitungan Referral)*
2.  `redeem_codes` *(Menyimpan kode rahasia dari Owner & limit penggunaan)*
3.  `redeem_history` *(Mencegah user menukarkan kode yang sama 2x)*
4.  `referrals` *(Melacak siapa mengundang siapa)*

---

## 💻 CARA DEPLOY / INSTALASI (DEVELOPER)

### 1. Clone Repositori
```bash
git clone [https://github.com/Dikrey/anonytele.git](https://github.com/Dikrey/anonytele.git)
cd anonytele
```

### 2. Install Dependencies
```bash
npm install
```

```bash
npm install node-telegram-bot-api @supabase/supabase-js midtrans-client express dotenv
```


### 3. Konfigurasi Environment (`.env`)
Buat file `.env` di direktori utama dan isi dengan data berikut:
```env
# Konfigurasi Telegram
TELEGRAM_TOKEN=1234567890:AAH_contoh_token_kamu_disini
OWNER_ID=123456789
OWNER=raihan_official0307
CHANNEL=raihan_official0307
BOT_USERNAME=nama_bot_kamu_bot

# Konfigurasi Supabase
SUPABASE_URL=[https://xyz.supabase.co](https://xyz.supabase.co)
SUPABASE_KEY=eyJhbGciOiJIUzI1... (Gunakan Service Role Key)

# Konfigurasi Midtrans
MIDTRANS_SERVER_KEY=SB-Mid-server-xxx
MIDTRANS_IS_PRODUCTION=false

# Konfigurasi Server
PORT=3000
```

### 4. Jalankan Bot (Terminal dengan UI Neon Keren!)
```bash
node index.js
```

```bash
ngrok http 3000
```

### 5. Service Role Supabase
```
Buka Dashboard Supabase kamu.

Masuk ke menu ⚙️ Project Settings (ikon roda gigi di kiri bawah).

Pilih menu API.

Di bagian Project API keys, kamu akan melihat dua kunci: anon public dan service_role secret.

Salin kunci service_role secret.

Buka file .env kamu, ganti SUPABASE_KEY yang lama dengan kunci rahasia ini:

Cuplikan kode
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR... (paste kunci service_role di sini)
Restart bot kamu (node index.js). Data pasti langsung masuk!
```

***

### 💳 6. Panduan Lengkap Setting Midtrans (Payment Gateway)

Untuk menerima pembayaran token otomatis melalui QRIS, GoPay, atau Bank, kamu harus menghubungkan bot dengan akun Midtrans dan melakukan konfigurasi **Webhook**. Ikuti panduan langkah demi langkah berikut:

#### Langkah 1: Daftar Akun Midtrans
1. Kunjungi website resmi Midtrans: [https://midtrans.com](https://midtrans.com)
2. Klik tombol **Daftar/Register** di pojok kanan atas.
3. Isi formulir pendaftaran. Untuk bagian jenis bisnis, jika kamu baru mencoba/tahap *testing*, pilih saja tipe **Perorangan (Individual)**.

#### Langkah 2: Dapatkan `MIDTRANS_SERVER_KEY` (Mode Sandbox)
Mode *Sandbox* adalah lingkungan uji coba dari Midtrans. Kamu bisa melakukan transaksi simulasi (pembayaran bohong-bohongan) tanpa menggunakan uang asli.

1. Setelah masuk ke *dashboard* (Portal Midtrans), perhatikan *toggle* di pojok kanan atas. Pastikan berada di posisi **Sandbox** (bukan Production).
2. Di menu sebelah kiri, navigasikan ke **Settings** ➔ **Access Keys**.
3. Di halaman tersebut, kamu akan melihat *Merchant ID*, *Client Key*, dan *Server Key*.
4. Salin (*Copy*) nilai dari **Server Key** (biasanya diawali dengan `SB-Mid-server-...`).
5. Buka file `.env` di *project* bot kamu, lalu tempel (*Paste*) kodenya seperti ini:
   ```env
   MIDTRANS_SERVER_KEY=SB-Mid-server-paste_key_kamu_di_sini
   MIDTRANS_IS_PRODUCTION=false
   ```
   > 💡 **Catatan:** Biarkan `MIDTRANS_IS_PRODUCTION=false` selama kamu masih dalam tahap pengembangan dan *testing*.

#### Langkah 3: Menggunakan Ngrok (Solusi Testing di Komputer Lokal)
**Kenapa butuh Ngrok?** Karena bot kamu dijalankan secara lokal di laptop/komputer (`D:\pythonasis\...`), Midtrans tidak bisa mengirimkan notifikasi sukses ke `localhost`. Midtrans membutuhkan URL Publik. Ngrok hadir untuk memberikan URL publik sementara yang terhubung langsung ke komputermu.

1. Download dan instal Ngrok dari [https://ngrok.com](https://ngrok.com).
2. Buka **Terminal / CMD** baru, lalu jalankan perintah ini (sesuai dengan `PORT` bot kamu di `index.js`, yaitu 3000):
   ```cmd
   ngrok http 3000
   ```
3. Ngrok akan berjalan dan memberikan **Forwarding URL** (contoh: `[https://a1b2c3d4.ngrok-free.app](https://a1b2c3d4.ngrok-free.app)`). 
4. Salin *Forwarding URL* tersebut.

> ⚠️ **Penting:** Jika kamu menggunakan Ngrok versi gratis, URL ini akan berubah setiap kali kamu menutup dan membuka ulang aplikasi Ngrok. Pastikan kamu selalu meng-update URL di Midtrans jika Ngrok di-restart.

#### Langkah 4: Konfigurasi Webhook (Notification URL) di Midtrans
Ini adalah **langkah paling krusial**. Webhook bertugas memberi tahu server bot kamu secara *real-time* ketika ada *user* yang berhasil melakukan pembayaran.

1. Kembali ke *dashboard* Midtrans (pastikan masih di mode Sandbox).
2. Klik menu **Settings** ➔ **Configuration**.
3. Gulir ke bawah dan cari kolom **Payment Notification URL** (atau Webhook URL).
4. Masukkan URL Ngrok yang sudah kamu salin tadi, lalu tambahkan rute *endpoint* bot di belakangnya (`/webhook/midtrans`).
   * **Format:** `[URL-NGROK-KAMU]/webhook/midtrans`
   * **Contoh:** `[https://a1b2c3d4.ngrok-free.app/webhook/midtrans](https://a1b2c3d4.ngrok-free.app/webhook/midtrans)`
5. Klik tombol **Update** atau **Save** di bagian paling bawah halaman.

Selesai! Sekarang bot kamu dan Midtrans sudah saling berbicara satu sama lain. Setiap ada pembayaran yang masuk, saldo *user* akan bertambah secara otomatis!

Tutorial By: Raihan_official0307
*** 


## 🛑 PERINGATAN PENTING: HARGAI KARYA ASLI

> ⚠️ **JANGAN HAPUS ATAU GANTI NAMA PEMBUAT ASLI.**

Bot berskala besar ini dirancang, ditulis, dan dikembangkan dengan **waktu, logika kompleks, dan dedikasi tinggi** oleh:
> 💙 **@raihan_official0307** / **Dikrey**

Jika kamu:
- 🔁 *Fork* / Re-upload
- 🔄 Re-Post
- 📦 Memodifikasi Kode
- ☁️ Melakukan Hosting / Deploy ulang

👉 **KAMU WAJIB MENYANTUMKAN KREDIT ASLI.**

### ❌ DILARANG KERAS:
- Mengaku sebagai pembuat asli algoritma bot ini.
- Menghapus/mengganti nama `@raihan_official0307` di source code atau README.
- Menjual *source code* ini seolah-olah ini adalah karya buatanmu sendiri dari nol.

### ✅ DIIZINKAN:
- Mempelajari *codebase* untuk belajar integrasi API, Webhook, dan Supabase.
- Menggunakan bot ini untuk komunitasmu.
- Membagikan repositori ini **dengan mencantumkan kredit**.

---

## 💌 DUKUNGAN & KONTAK
> 🚀 *"Obrolan sejati dimulai saat identitas menghilang."*

Dibuat dengan semangat *coding* tingkat tinggi di Sumatera Utara oleh **@raihan_official0307**. Jika kamu menyukai *project* ini, dukung *developer* dengan cara memberikan ⭐ (Star) pada repositori ini atau gunakan fitur topup Telegram Stars di dalam bot!

[Tanya Developer (Telegram)](https://t.me/raihan_official0307) | [Join Channel](https://t.me/raihan_official0307)
```