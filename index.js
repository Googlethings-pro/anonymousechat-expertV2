require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const express = require("express");


const moment = require("moment");

const { supabase, getUser, getAllUserIds } = require("./supabase");
const LANGS = require("./languages");
const REACTIONS = require("./reactions");
const QUIZ_LIST = require("./quiz");
const { generateCaptcha } = require('./captcha');
const { createSession, closeSession } = require('./sessionManager');

// ── Redis + Queue ──
const redis = require("./redis");

// ── Region System ──
const REGION_INFO = {
    'ID': { name: 'Indonesia', flag: '🇮🇩', nativeName: 'Indonesia' },
    'EN': { name: 'English / Global', flag: '🌐', nativeName: 'English' },
    'AR': { name: 'Arab / Middle East', flag: '🇸🇦', nativeName: 'العربية' },
    'MY': { name: 'Malaysia / Melayu', flag: '🇲🇾', nativeName: 'Melayu' },
    'CN': { name: 'China', flag: '🇨🇳', nativeName: '中文' },
    'JP': { name: 'Japan', flag: '🇯🇵', nativeName: '日本語' },
    'RU': { name: 'Russia', flag: '🇷🇺', nativeName: 'Русский' },
};

function getRegionDisplay(region) {
    if (!region || !REGION_INFO[region]) return '🌍 Not Set';
    const r = REGION_INFO[region];
    return `${r.flag} ${r.name}`;
}

const {
    waitingList: _queueWaitingList,
    enqueue,
    removeFromAllQueues,
    isInQueue,
    removeFromQueue,
    getQueueSize,
    removeFromRegionQueues,
    isInRegionQueue,
    getRegionQueueSize,
} = require('./queue');

const http = require("http");
const https = require("https");
const os = require("os");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const APP_START_TIME = Date.now();

// ============================================================
// SISTEM RAIHAN_OFFCIIAL0307
// ============================================================
const userLang = new Map();
const bottleMode = new Map();

function getLang(chatId) {
    return LANGS[userLang.get(chatId) || "id"];
}


function isOwnerChat(chatId) {
    return !!process.env.OWNER_ID && chatId.toString() === process.env.OWNER_ID.toString();
}



// ── Deteksi URL dan @username ─────────────────────────────────
function containsUrlOrUsername(text) {
    if (!text) return false;
    const urlPattern = /(https?:\/\/|www\.|t\.me\/|tele\.me\/|telegram\.me\/|bit\.ly\/|youtu\.be\/|fb\.me\/|wa\.me\/)[^\s]*/i;
    const domainPattern = /\b[a-zA-Z0-9-]+\.(com|net|org|id|io|gg|xyz|info|biz|co|ly|me|app|dev|web|shop|store|link)\b/i;
    const usernamePattern = /(^|\s)@[a-zA-Z0-9_]{3,}/;
    return urlPattern.test(text) || domainPattern.test(text) || usernamePattern.test(text);
}

// urlViolationMap: chatId → { count, banUntil (timestamp ms) }
const urlViolationMap = new Map();

const chatMessageMap = new Map();

const bottleDailyMap = new Map();

const bottleExtraMap = new Map();

const activeQuizzes = new Map();


const captchaMap = new Map();
const captchaFailMap = new Map();
const searchRateMap = new Map();
const nextSpamMap = new Map();
const msgFloodMap = new Map();
const lastMsgTimeMap = new Map();
const ghostingWarnedMap = new Map();
const sessionIdMap = new Map();
const rpsMap = new Map();
const scrambleMap = new Map();
const guessMap = new Map();
// Debounce typing indicator — kirim max 1x per 4 detik per user
const lastTypingMap = new Map();
// Debounce notifikasi "tidak sedang dalam obrolan" (anti-spam)
const lastNoChatNotice = new Map();

// ── Pesan status terakhir per user (untuk di-EDIT / DIHAPUS) ──────
// Semua notifikasi status (radar off, sesi berakhir, reminder, dll)
// disimpan di sini supaya perintah berikutnya (mis. /next, /search)
// bisa meng-EDIT pesan itu menjadi "SEARCHING..." alih-alih
// mengirim pesan baru. Hasilnya chat tetap bersih.
const statusMsgMap = new Map();          // chatId → { id, at }
const sessionStatusMsgMap = new Map();   // chatId → msgId banner "partner found" sesi aktif
const STATUS_MSG_TTL = 10 * 60 * 1000;   // pesan status kadaluarsa 10 menit

// Masa tunggu "ketat" untuk pencarian by gender. Selama masa ini user HANYA
// dicocokkan dengan gender asli yang dipilih (tidak asal comot). Setelah
// habis, radar baru boleh menghubungkan ke user yang belum set gender.
const GENDER_STRICT_MS = 45 * 1000;

const activeTOD = new Map();

const ageRegistrationMode = new Map();

const unlockedPartnerInfo = new Map();

const TOD_DATA = {
    truth: [
        "Siapa orang yang terakhir kamu kepoin di media sosial?",
        "Apa rahasia terbesar yang belum pernah kamu ceritakan ke siapapun?",
        "Kapan terakhir kali kamu menangis dan karena apa?",
        "Apa hal paling memalukan yang pernah kamu lakukan di depan umum?",
        "Siapa orang di chat ini yang menurutmu paling menarik?",
        "Siapa nama orang yang sedang kamu kagumi (crush) saat ini?",
        "Siapa nama pacar atau mantan terakhir kamu?",
        "Apakah ada orang yang saat ini kamu sukai secara diam-diam?",
        "Apa hal pertama yang kamu lihat saat pertama kali bertemu lawan jenis?",
        "Pernahkah kamu selingkuh atau diselingkuhi? Ceritakan singkat!",
        "Apa ketakutan terbesar kamu dalam sebuah hubungan?",
        "Jika kamu bisa bertukar nasib dengan seseorang, siapa orang itu?",
        "Siapa nama orang yang sedang kamu kagumi (crush) saat ini? 🤫",
        "Siapa nama pacar atau mantan terakhir kamu? 💔",
        "Apakah ada orang yang saat ini kamu sukai secara diam-diam? ❤️",
        "Apa rahasia terbesar yang belum pernah kamu ceritakan ke siapapun?",
        "Apa hal memalukan yang pernah kamu lakukan di depan umum?",
        "Pernahkah kamu stalking akun mantan sampai jam 3 pagi?",
        "Siapa orang yang paling ingin kamu ajak ketemuan di bot ini?",
    ],
    dare: [
        "Kirimkan foto selfie terkini dengan ekspresi paling lucu!",
        "Chat mantan kamu dan bilang 'Aku kangen', lalu kirim screenshotnya ke sini!",
        "Rekam suara kamu menyanyi lagu anak-anak selama 15 detik!",
        "Tulis status di WhatsApp/Instagram: 'Aku jomblo butuh kasih sayang' selama 5 menit!",
        "Kirimkan pesan suara gombalan maut untuk partner chatmu sekarang!",
        "Sebutkan Username Instagram kamu dan minta partner chatmu untuk mempromosikan bot ini di Story IG-nya!",
        "SS (Screenshot) chat paling atas di WhatsApp kamu dan kirim ke sini!",
        "VC (Video Call) partner chat kamu selama 1 menit tanpa suara, hanya ekspresi wajah!",
        "Kirimkan pap (photo) telapak tangan kamu dan biarkan partner meramal nasibmu!",
        "Kirim pesan ke grup keluarga kamu: 'Aku mau nikah besok!', lalu SS reaksinya ke sini!",
        "Promosikan bot ini di status WA kamu dengan kata-kata: 'Bot chat paling asik buat cari jodoh: t.me/anonymousehanz_bot'!",
        "Kirimkan VN (Voice Note) bilang 'I Love You' ke partner chat kamu sekarang!",
        "Sebutkan Username Instagram kamu dan promosikan bot ini di Story IG sekarang! 📸",
        "Kirim pesan ke gebetan/pacar kamu: 'Aku mau jujur sesuatu...', SS reaksinya! 🔥",
        "Tulis di status WhatsApp: 'Lagi nyari jodoh di t.me/anonymousehanz_bot' selama 1 jam! 🚀",
        "Rekam suara kamu nyanyi lagu galau selama 15 detik![cite: 1]",
        "Tukarkan username Instagram dengan partner chatmu sekarang juga! ✨",
        "Chat mantan kamu: 'Ternyata kamu masih yang terbaik', SS ke sini![cite: 1]",
        "Foto barang yang ada di depanmu sekarang dan ceritakan sejarahnya!",
    ],
};

function canSendBottle(chatId, isPremiumUser) {
    if (isPremiumUser) return true;
    const today = new Date().toISOString().slice(0, 10);
    const entry = bottleDailyMap.get(chatId) || { count: 0, day: today };
    if (entry.day !== today) {
        entry.count = 0;
        entry.day = today;
    }
    const freeLimit = 4;
    const extra = bottleExtraMap.get(chatId) || 0;
    if (entry.count < freeLimit || extra > 0) {
        if (entry.count >= freeLimit && extra > 0) {
            bottleExtraMap.set(chatId, extra - 1);
        } else {
            entry.count++;
        }
        bottleDailyMap.set(chatId, entry);
        return true;
    }
    return false;
}

function bottleUsageInfo(chatId) {
    const today = new Date().toISOString().slice(0, 10);
    const entry = bottleDailyMap.get(chatId) || { count: 0, day: today };
    if (entry.day !== today)
        return { used: 0, limit: 4, extra: bottleExtraMap.get(chatId) || 0 };
    return {
        used: entry.count,
        limit: 4,
        extra: bottleExtraMap.get(chatId) || 0,
    };
}


function getChatKeyboard() {
    return {
        keyboard: [
            [{ text: "🔄 Next Partner" }, { text: "🛑 Stop Chat" }],
            [{ text: "🎯 Search by Age" }, { text: "🚻 Search by Gender" }],
            [{ text: "👤 Partner Info" }],
            [{ text: "💎 Upgrade VIP" }, { text: "🌐 Change Settings" }],
            [{ text: "🏠 Main Menu" }],
        ],
        resize_keyboard: true,
        one_time_keyboard: false,
    };
}

function getMainKeyboard() {
    return {
        keyboard: [
            [{ text: "🔍 Find Friend" }],
            [{ text: "🔄 Next Partner" }, { text: "🛑 Stop Chat" }],
            [{ text: "🚻 Search by Gender" }, { text: "🎯 Search by Age" }],
            [{ text: "💎 Upgrade VIP" }],
            [{ text: "🪪 My Profile" }, { text: "🌐 Change Settings" }],
        ],
        resize_keyboard: true,
        one_time_keyboard: false,
    };
}

function formatUptime(seconds) {
    seconds = Math.floor(seconds);
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    let str = "";
    if (d > 0) str += `${d}h `;
    if (h > 0) str += `${h}j `;
    str += `${m}m ${s}d`;
    return str.trim();
}

function formatBytes(bytes) {
    if (!bytes || bytes < 0) return "0 B";
    const units = ["B", "KB", "MB", "GB", "TB", "PB"];
    let i = 0;
    let value = bytes;

    while (value >= 1024 && i < units.length - 1) {
        value /= 1024;
        i++;
    }

    return `${value.toFixed(2)} ${units[i]}`;
}

function getDiskInfo(targetPath = "/") {
    try {
        const output = execSync(`df -kP ${targetPath}`, { encoding: "utf8" });
        const lines = output.trim().split("\n");
        if (lines.length < 2) return null;

        const parts = lines[1].split(/\s+/);
        const totalKB = parseInt(parts[1], 10);
        const usedKB = parseInt(parts[2], 10);
        const freeKB = parseInt(parts[3], 10);
        const usePercent = parts[4];

        return {
            filesystem: parts[0],
            total: totalKB * 1024,
            used: usedKB * 1024,
            free: freeKB * 1024,
            percent: usePercent,
            mount: parts[5] || targetPath,
        };
    } catch (err) {
        return null;
    }
}

function getSwapInfo() {
    try {
        const output = execSync(`free -b`, { encoding: "utf8" });
        const lines = output.trim().split("\n");
        const swapLine = lines.find((line) =>
            line.toLowerCase().startsWith("swap"),
        );
        if (!swapLine) return null;

        const parts = swapLine.split(/\s+/);
        return {
            total: parseInt(parts[1], 10) || 0,
            used: parseInt(parts[2], 10) || 0,
            free: parseInt(parts[3], 10) || 0,
        };
    } catch (err) {
        return null;
    }
}

function getNetworkInfo() {
    const nets = os.networkInterfaces();
    const result = [];

    for (const ifaceName of Object.keys(nets)) {
        for (const net of nets[ifaceName]) {
            if (net.family === "IPv4" && !net.internal) {
                result.push({
                    name: ifaceName,
                    address: net.address,
                    mac: net.mac,
                });
            }
        }
    }
    return result;
}

function getServerPing() {
    try {
        const output = execSync("ping -c 1 -W 1 8.8.8.8", { encoding: "utf8" });
        const match = output.match(/time=([\d.]+) ms/);
        return match ? `${match[1]} ms` : "Timeout";
    } catch (err) {
        return "Offline/Blocked";
    }
}

function progressBar(percent, length = 10) {
    const filled = Math.round((percent / 100) * length);
    const empty = length - filled;
    return `[ ${"🟩".repeat(filled)}${"⬛".repeat(empty)} ] ${percent}%`;
}

const app = express();
app.use(express.json());
app.get("/", (req, res) => {
    const modernHTML = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Anonymous Bot - Server Status</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;800&display=swap');

            body {
                margin: 0;
                padding: 0;
                height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
                font-family: 'Poppins', sans-serif;
                background: linear-gradient(-45deg, #0f172a, #1e1b4b, #312e81, #0f172a);
                background-size: 400% 400%;
                animation: gradientBG 15s ease infinite;
                color: #ffffff;
            }

            @keyframes gradientBG {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }


            .glass-card {
                background: rgba(255, 255, 255, 0.03);
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
                border: 1px solid rgba(255, 255, 255, 0.08);
                box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.4);
                border-radius: 24px;
                padding: 50px 40px;
                text-align: center;
                max-width: 450px;
                width: 85%;
                position: relative;
                overflow: hidden;
            }

            .glass-card::before {
                content: '';
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: radial-gradient(circle, rgba(56, 189, 248, 0.05) 0%, transparent 60%);
                z-index: -1;
            }

            h1 {
                margin: 0 0 8px 0;
                font-size: 2rem;
                font-weight: 800;
                letter-spacing: 2px;
                text-transform: uppercase;
                color: #ffffff;
                text-shadow: 0 0 10px rgba(56, 189, 248, 0.6), 0 0 20px rgba(56, 189, 248, 0.3);
            }

            p {
                font-weight: 300;
                color: #cbd5e1;
                margin-bottom: 30px;
                font-size: 0.95rem;
                letter-spacing: 0.5px;
            }

            .status-badge {
                display: inline-flex;
                align-items: center;
                background: rgba(16, 185, 129, 0.1);
                border: 1px solid rgba(16, 185, 129, 0.4);
                color: #34d399;
                padding: 10px 20px;
                border-radius: 50px;
                font-weight: 600;
                font-size: 0.95rem;
                letter-spacing: 1px;
                box-shadow: 0 0 15px rgba(16, 185, 129, 0.2);
            }

            .pulse-dot {
                width: 12px;
                height: 12px;
                background-color: #34d399;
                border-radius: 50%;
                margin-right: 12px;
                box-shadow: 0 0 10px #34d399;
                animation: pulse 2s infinite;
            }

            @keyframes pulse {
                0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.7); }
                70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(52, 211, 153, 0); }
                100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(52, 211, 153, 0); }
            }

            .footer {
                margin-top: 40px;
                font-size: 0.75rem;
                color: #64748b;
                border-top: 1px solid rgba(255,255,255,0.05);
                padding-top: 20px;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
        </style>
    </head>
    <body>
        <div class="glass-card">
            <h1>Expert Chat</h1>
            <p>Matchmaking Server Engine</p>

            <div class="status-badge">
                <div class="pulse-dot"></div>
                SYSTEM ONLINE
            </div>

            <div class="footer">
                Secured Connection Established<br>
                Midtrans Webhook Ready
            </div>
        </div>
    </body>
    </html>
    `;

    res.send(modernHTML);
});

process.on("uncaughtException", (err) => {
    console.error("[uncaughtException]", err.message);
});

process.on("unhandledRejection", (reason) => {
    console.error("[unhandledRejection]", reason);
});

// ── Shutdown rapi (pm2 restart / systemctl stop / Ctrl+C) ──────────
// Tanpa ini, kunci "bot:polling-owner" (TTL 20 detik) masih dipegang proses
// yang sudah mati, sehingga proses baru menunggu sampai TTL habis.
async function gracefulShutdown(signal) {
    console.log(`[Bot] ⏹️ ${signal} diterima — mematikan dengan rapi...`);
    try {
        if (leaderTimer) clearInterval(leaderTimer);
    } catch (e) { }
    try {
        if (redis.isReady()) {
            const owner = await redis.get(LEADER_KEY);
            if (owner === INSTANCE_ID) await redis.del(LEADER_KEY);
        }
    } catch (e) { }
    try {
        await bot.stopPolling({ cancel: true });
    } catch (e) { }
    process.exit(0);
}

process.once("SIGINT", () => gracefulShutdown("SIGINT"));
process.once("SIGTERM", () => gracefulShutdown("SIGTERM"));

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: false });

bot.on("polling_error", (err) => {
    console.error("[polling_error]", err.code, "-", err.message);
});

bot.on("error", (err) => {
    console.error("[bot_error]", err.message);
});

// ── Edit pesan yang tahan gagal sesaat (rate limit / race antar proses) ──
// Return true kalau pesan berhasil di-edit (atau isinya memang sudah sama).
async function safeEdit(chatId, messageId, text, extra = {}) {
    if (!messageId) return false;
    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            await bot.editMessageText(text, Object.assign({ chat_id: chatId, message_id: messageId }, extra));
            return true;
        } catch (err) {
            const desc =
                (err && err.response && err.response.body && err.response.body.description) ||
                (err && err.message) ||
                '';
            if (/not modified/i.test(desc)) return true;
            if (/message to edit not found|message can.t be edited/i.test(desc)) return false;
            await new Promise((r) => setTimeout(r, 350 * (attempt + 1)));
        }
    }
    return false;
}

// ── Pesan status: satu pesan, di-edit/dihapus berulang ────────────
function rememberStatusMsg(chatId, messageId) {
    if (!messageId) return;
    statusMsgMap.set(chatId, { id: messageId, at: Date.now() });
}

function takeStatusMsgId(chatId) {
    const rec = statusMsgMap.get(chatId);
    if (!rec) return null;
    statusMsgMap.delete(chatId);
    if (Date.now() - rec.at > STATUS_MSG_TTL) return null;
    return rec.id;
}

function forgetStatusMsg(chatId, messageId = null) {
    const rec = statusMsgMap.get(chatId);
    if (rec && (!messageId || rec.id === messageId)) statusMsgMap.delete(chatId);
}

// Kirim pesan status: kalau sudah ada pesan status sebelumnya, pesan itu
// yang di-EDIT (bukan kirim baru). Kalau edit gagal, pesan lama dihapus
// lalu kirim satu pesan baru → tetap maksimal satu pesan status.
async function pushStatus(chatId, text, options = {}) {
    const opts = { parse_mode: 'HTML', ...options };
    const prev = statusMsgMap.get(chatId);

    if (prev && Date.now() - prev.at < STATUS_MSG_TTL) {
        if (await safeEdit(chatId, prev.id, text, opts)) {
            statusMsgMap.set(chatId, { id: prev.id, at: Date.now() });
            return prev.id;
        }
        bot.deleteMessage(chatId, prev.id).catch(() => { });
    }

    const sent = await bot.sendMessage(chatId, text, opts).catch(() => null);
    if (sent && sent.message_id) rememberStatusMsg(chatId, sent.message_id);
    return sent ? sent.message_id : null;
}

// ── Single polling owner ──────────────────────────────────────────────
// Hanya SATU proses yang boleh polling ke Telegram. Kalau ada instance lama
// (mis. proses lama belum mati / deploy lain) yang masih jalan, proses ini
// menunggu lalu berhenti supaya notifikasi tidak pernah dobel.
const INSTANCE_ID = `${os.hostname()}-${process.pid}-${Math.random().toString(36).slice(2, 8)}`;
const LEADER_KEY = 'bot:polling-owner';
let leaderTimer = null;

async function waitForRedis(timeoutMs = 5000) {
    if (!process.env.REDIS_URL) return false;
    const end = Date.now() + timeoutMs;
    while (Date.now() < end) {
        if (redis.isReady()) return true;
        await new Promise((r) => setTimeout(r, 150));
    }
    return redis.isReady();
}

async function renewPollingOwnership() {
    if (!redis.isReady()) return;
    try {
        const owner = await redis.get(LEADER_KEY);
        if (owner && owner !== INSTANCE_ID) {
            console.error('[Bot] ❌ Instance lain mengambil alih polling. Proses ini berhenti agar tidak dobel notifikasi.');
            process.exit(1);
        }
        await redis.set(LEADER_KEY, INSTANCE_ID, { EX: 20 });
    } catch (e) { }
}

async function claimPollingOwnership() {
    const redisUp = await waitForRedis();
    if (!redisUp) {
        console.log('[Bot] ⚠️ Redis tidak aktif — asumsi hanya satu proses (single instance).');
        return true;
    }
    let attempt = 0;
    // Tunggu (tanpa crash-loop) sampai instance lama benar-benar berhenti.
    while (true) {
        try {
            const ok = await redis.set(LEADER_KEY, INSTANCE_ID, { NX: true, EX: 20 });
            if (ok === 'OK' || ok === true) {
                leaderTimer = setInterval(renewPollingOwnership, 7000);
                if (leaderTimer.unref) leaderTimer.unref();
                return true;
            }
            if (attempt % 10 === 0) {
                const owner = await redis.get(LEADER_KEY);
                console.log(`[Bot] ⏳ Menunggu instance lain berhenti (owner: ${owner || 'unknown'})...`);
            }
        } catch (e) {
            // Redis error → izinkan jalan (fallback single instance)
            return true;
        }
        attempt++;
        await new Promise((r) => setTimeout(r, 3000));
    }
}



// waitingList diambil dari queue.js agar terhubung dengan Redis abstraction
// Referensi objek SAMA — semua kode lama yang baca/tulis waitingList tetap bekerja
const waitingList = _queueWaitingList;
const activeChats = new Map();
const searchMsgMap = new Map();
const searchAnimMap = new Map(); // { timer, interval } untuk animasi fase pencarian

function clearSearchAnim(chatId) {
    const anim = searchAnimMap.get(chatId);
    if (!anim) return;
    if (anim.timer) clearTimeout(anim.timer);
    if (anim.interval) clearInterval(anim.interval);
    searchAnimMap.delete(chatId);
}

// ── Anti-rematch + anti-spam pencarian ──────────────────────────────
const searchStartedAt = new Map();
const recentPartnerMap = new Map();
const PARTNER_COOLDOWN_MS = 15 * 60 * 1000;
const SEARCH_STALE_MS = 10 * 60 * 1000;

function isSearchActive(chatId) {
    if (!searchMsgMap.has(chatId)) return false;
    const startedAt = searchStartedAt.get(chatId) || 0;
    if (startedAt && Date.now() - startedAt > SEARCH_STALE_MS) {
        searchMsgMap.delete(chatId);
        searchStartedAt.delete(chatId);
        if (redis.isReady()) redis.del(`search:active:${chatId}`).catch(() => { });
        return false;
    }
    return true;
}

// ── State pencarian lintas proses (Redis) ──
// Kalau bot jalan di lebih dari satu proses (mis. proses lama belum mati saat
// deploy), dua proses bisa menangani /start atau /next yang sama dan sama-sama
// mengirim pesan SEARCHING. State di Redis membuat hanya SATU yang boleh kirim.
const SEARCH_STATE_TTL = 90; // detik (di-refresh tiap 30 detik selama menunggu)

async function reserveSearchSlot(chatId) {
    if (!redis.isReady()) return true; // tanpa Redis, cukup lock lokal
    try {
        const ok = await redis.set(`search:reserve:${chatId}`, '1', { NX: true, EX: 15 });
        return ok === 'OK' || ok === true;
    } catch (e) {
        return true;
    }
}

async function publishSearchState(chatId, msgId) {
    if (!redis.isReady() || !msgId) return;
    try {
        await redis.set(`search:active:${chatId}`, String(msgId), { EX: SEARCH_STATE_TTL });
        await redis.del(`search:reserve:${chatId}`);
    } catch (e) { }
}

async function clearRemoteSearchState(chatId) {
    if (!redis.isReady()) return;
    try {
        await Promise.all([
            redis.del(`search:active:${chatId}`),
            redis.del(`search:reserve:${chatId}`),
        ]);
    } catch (e) { }
}

async function getRemoteSearchMsgId(chatId) {
    if (!redis.isReady()) return null;
    try {
        const val = await redis.get(`search:active:${chatId}`);
        const id = parseInt(val);
        return Number.isFinite(id) ? id : null;
    } catch (e) {
        return null;
    }
}

async function isSearchActiveAnywhere(chatId) {
    if (isSearchActive(chatId)) return true;
    return Boolean(await getRemoteSearchMsgId(chatId));
}

// ── Per-user lock (anti double /next, double search, double notifikasi) ──
// Lock lokal (Map) untuk proses ini + lock Redis (SET NX PX) kalau Redis aktif,
// supaya dua request yang datang hampir bersamaan tidak dieksekusi dua kali.
const localLocks = new Map();
const endingPairs = new Set();

function localLockActive(key) {
    const until = localLocks.get(key);
    if (!until) return false;
    if (Date.now() > until) { localLocks.delete(key); return false; }
    return true;
}

async function acquireLock(name, chatId, ttlMs = 20000) {
    const key = `${name}:${chatId}`;
    if (localLockActive(key)) return false;
    localLocks.set(key, Date.now() + ttlMs);
    if (redis.isReady()) {
        try {
            const ok = await redis.set(`lock:${key}`, '1', { NX: true, PX: ttlMs });
            if (ok !== 'OK' && ok !== true) {
                localLocks.delete(key);
                return false;
            }
        } catch (e) {
            // Redis error → tetap pakai lock lokal
        }
    }
    return true;
}

async function releaseLock(name, chatId) {
    const key = `${name}:${chatId}`;
    localLocks.delete(key);
    if (redis.isReady()) {
        try { await redis.del(`lock:${key}`); } catch (e) { }
    }
}

// Hentikan animasi + hapus pesan pencarian + bersihkan antrean user.
// Dipakai oleh /stop dan tombol Stop Chat supaya tidak ada sisa state.
async function cancelSearch(chatId) {
    clearSearchAnim(chatId);
    const msgId = searchMsgMap.get(chatId) || await getRemoteSearchMsgId(chatId);
    if (msgId) {
        bot.deleteMessage(chatId, msgId).catch(() => { });
        // Pesan searching sudah dihapus → jangan dijadikan target edit lagi
        forgetStatusMsg(chatId, msgId);
    }
    searchMsgMap.delete(chatId);
    searchStartedAt.delete(chatId);
    await clearRemoteSearchState(chatId);
    await removeFromAllQueues(chatId);
    await removeFromRegionQueues(chatId);
}

function normalizeGender(gender) {
    return gender === "M" || gender === "F" ? gender : null;
}

function pairKey(a, b) {
    return a < b ? `${a}:${b}` : `${b}:${a}`;
}

function isPairOnCooldown(a, b) {
    if (a == null || b == null || a === b) return false;
    const key = pairKey(a, b);
    const until = recentPartnerMap.get(key);
    if (!until) return false;
    if (Date.now() > until) {
        recentPartnerMap.delete(key);
        return false;
    }
    return true;
}

function markPairCooldown(a, b) {
    if (a == null || b == null || a === b) return;
    recentPartnerMap.set(pairKey(a, b), Date.now() + PARTNER_COOLDOWN_MS);
}

function cleanupPairCooldowns() {
    const now = Date.now();
    for (const [key, until] of recentPartnerMap) {
        if (now > until) recentPartnerMap.delete(key);
    }
}
setInterval(cleanupPairCooldowns, 10 * 60 * 1000).unref?.();

// Bersihkan map anti-spam/lock supaya tidak menumpuk di memori (memory leak)
setInterval(() => {
    const now = Date.now();
    for (const [k, v] of nextSpamMap) {
        if (now - (v.lastTime || 0) > 10 * 60 * 1000) nextSpamMap.delete(k);
    }
    for (const [k, v] of searchRateMap) {
        if (now > (v.resetAt || 0)) searchRateMap.delete(k);
    }
    for (const [k, t] of lastNoChatNotice) {
        if (now - t > 10 * 60 * 1000) lastNoChatNotice.delete(k);
    }
    for (const [k, until] of localLocks) {
        if (now > until) localLocks.delete(k);
    }
    for (const [k, t] of lastTypingMap) {
        if (now - t > 10 * 60 * 1000) lastTypingMap.delete(k);
    }
    for (const [k, v] of statusMsgMap) {
        if (now - (v.at || 0) > STATUS_MSG_TTL) statusMsgMap.delete(k);
    }
    for (const [k] of sessionStatusMsgMap) {
        if (!activeChats.has(k)) sessionStatusMsgMap.delete(k);
    }
}, 10 * 60 * 1000).unref?.();

// Refresh TTL state pencarian di Redis selama user masih menunggu,
// supaya key tidak keburu kedaluwarsa / tidak ada sisa state basi.
setInterval(() => {
    if (!redis.isReady()) return;
    for (const [chatId, msgId] of searchMsgMap) {
        publishSearchState(chatId, msgId);
    }
}, 30 * 1000).unref?.();

function candidateIsAvailable(candidate, chatId) {
    if (!candidate || candidate.id == null || candidate.id === chatId) return false;
    if (activeChats.has(candidate.id)) return false;
    if (isPairOnCooldown(chatId, candidate.id)) return false;
    return true;
}

function preferencesCompatible(candidate, myGender, targetGender, allowUnsetFallback) {
    const candidateGender = normalizeGender(candidate.gender);
    const candidateTarget = normalizeGender(candidate.targetGender);

    // Preferensi orang yang sedang menunggu harus cocok dengan gender kita
    if (candidateTarget) {
        if (myGender !== candidateTarget) {
            if (!(allowUnsetFallback && !myGender)) return false;
        }
    }

    // Target pencarian kita harus cocok dengan gender asli kandidat
    if (targetGender) {
        if (candidateGender !== targetGender) {
            if (!(allowUnsetFallback && !candidateGender)) return false;
        }
    }

    return true;
}

async function pruneQueue(list) {
    for (let i = list.length - 1; i >= 0; i--) {
        const candidate = list[i];
        if (!candidate || activeChats.has(candidate.id)) {
            list.splice(i, 1);
            if (candidate && candidate.id != null) {
                removeFromAllQueues(candidate.id).catch(() => { });
                removeFromRegionQueues(candidate.id).catch(() => { });
            }
        }
    }
}

async function takeQueueCandidate(list, predicate) {
    const index = list.findIndex(predicate);
    if (index === -1) return null;
    const [candidate] = list.splice(index, 1);
    await removeFromAllQueues(candidate.id).catch(() => { });
    await removeFromRegionQueues(candidate.id).catch(() => { });
    return candidate;
}

function getAgeRange(action, age) {
    const myAge = Number(age);
    if (!Number.isFinite(myAge)) return null;
    if (action === "search_age_exact") {
        return { minAge: myAge, maxAge: myAge };
    }
    if (action === "search_age_older") {
        const minAge = myAge + 1;
        if (minAge > 99) return null;
        return { minAge, maxAge: Math.min(99, myAge + 5) };
    }
    if (action === "search_age_younger") {
        const maxAge = myAge - 1;
        if (maxAge < 12) return null;
        return { minAge: Math.max(12, myAge - 5), maxAge };
    }
    return null;
}

function ageCompatible(candidate, myAge, minAge, maxAge, requireMutual) {
    const candidateAge = Number(candidate.age);
    if (!Number.isFinite(candidateAge)) return false;
    if (candidateAge < minAge || candidateAge > maxAge) return false;
    if (requireMutual) {
        const candidateMin = Number(candidate.minAge);
        const candidateMax = Number(candidate.maxAge);
        if (Number.isFinite(candidateMin) && Number.isFinite(candidateMax) && Number.isFinite(myAge)) {
            if (myAge < candidateMin || myAge > candidateMax) return false;
        }
    }
    return true;
}

async function takeAgeMatch(chatId, user, minAge, maxAge) {
    const myGender = normalizeGender(user.gender);
    const myAge = Number(user.age);
    const passes = [
        { list: waitingList.ageList, mutual: true, fallback: false },
        { list: waitingList.ageList, mutual: false, fallback: false },
        { list: waitingList.general, mutual: false, fallback: false },
        { list: waitingList.ageList, mutual: false, fallback: true },
        { list: waitingList.general, mutual: false, fallback: true },
    ];
    for (const pass of passes) {
        for (; ;) {
            const candidate = await takeQueueCandidate(pass.list, (item) =>
                candidateIsAvailable(item, chatId) &&
                ageCompatible(item, myAge, minAge, maxAge, pass.mutual) &&
                preferencesCompatible(item, myGender, null, pass.fallback)
            );
            if (!candidate) break;

            // Verifikasi usia ke DATABASE supaya "search by age" tepat sasaran
            // (metadata antrean bisa basi kalau user mengganti usianya).
            const dbUser = await getUser(candidate.id).catch(() => null);
            const dbAge = dbUser ? Number(dbUser.age) : NaN;
            if (Number.isFinite(dbAge) && (dbAge < minAge || dbAge > maxAge)) continue;

            // Pass fallback hanya untuk user yang gender-nya belum diisi
            if (pass.fallback && normalizeGender(dbUser ? dbUser.gender : null)) continue;

            return candidate;
        }
    }
    return null;
}

async function takeGeneralMatch(chatId, user, targetGender, { allowFallback = true } = {}) {
    const myGender = normalizeGender(user.gender);
    const region = user.region && user.region !== "GLOBAL" ? user.region : null;
    const passes = [];
    if (region) passes.push({ sameRegion: true, fallback: false });
    passes.push({ sameRegion: false, fallback: false });
    // Fallback (user tanpa gender) hanya dipakai kalau memang diizinkan.
    // Untuk pencarian gender, fallback DITUNDA sampai masa tunggu selesai
    // supaya tidak langsung dapat user asal-asalan.
    if ((targetGender || !myGender) && allowFallback) {
        if (region) passes.push({ sameRegion: true, fallback: true });
        passes.push({ sameRegion: false, fallback: true });
    }
    for (const pass of passes) {
        for (; ;) {
            const candidate = await takeQueueCandidate(waitingList.general, (item) =>
                candidateIsAvailable(item, chatId) &&
                (!pass.sameRegion || (item.region || null) === region) &&
                preferencesCompatible(item, myGender, targetGender, pass.fallback)
            );
            if (!candidate) break;

            // Pencarian random tidak memfilter gender → langsung pakai
            if (!targetGender) return candidate;

            // Verifikasi gender ke DATABASE. Metadata antrean bisa basi/keliru,
            // dan inilah penyebab utama "pilih Female tapi dapat Male".
            const dbUser = await getUser(candidate.id).catch(() => null);
            const dbGender = normalizeGender(dbUser ? dbUser.gender : null);

            if (pass.fallback) {
                if (!dbGender) return candidate; // hanya user TANPA gender
            } else if (dbGender === targetGender) {
                return candidate;
            }
            // Gender tidak cocok → buang kandidat ini, lanjut cari berikutnya
        }
    }
    return null;
}

const nextCooldowns = new Map();
const processedOrders = new Set();

const spamMap = new Map();
const badWords = [
    "anjing",
    "babi",
    "kontol",
    "memek",
    "bangsat",
    "www.",
    "loli",
    "bokep",
    "username",
    "pap",
    "PAP",
    "tetek",
    "vagina",
    "hentai",
    "nekopoi",
    "pornhub",
    "sagne",
    "sange",
    "vcs",
    "VCS",
    "ngentod",
    "colmek",
    "colmex",
];
const urlKeywords = [
    "t.me/",
    "http://",
    "https://",
    "www.",
    "loli",
    "bokep",
    "username",
    "tetek",
    "vagina",
    "vt.tiktok.com/",
    "tiktok.com",
    "instagram.com",
];

let latestBroadcastMsg =
    "Maaf saat ini belum ada pengumuman resmi dari Developer saat ini.";

// ── Paket Premium/VIP — SATU sumber harga (Telegram Stars ⭐️) ─────
// Dipakai oleh menu /vip DAN handler pembayaran, jadi harga yang
// ditampilkan selalu sama dengan yang ditagihkan.
const PREMIUM_PLANS = {
    7: { days: 7, stars: 50, label: "Premium 1 Minggu", name: "1 Minggu" },
    30: { days: 30, stars: 75, label: "Premium 1 Bulan", name: "1 Bulan" },
    60: { days: 60, stars: 120, label: "Premium 2 Bulan", name: "2 Bulan" },
    90: { days: 90, stars: 175, label: "Premium 3 Bulan", name: "3 Bulan" },
    365: { days: 365, stars: 350, label: "VIP Sultan 1 Tahun", name: "1 Tahun (VIP SULTAN)" },
};

function isPremium(user) {
    if (!user.premium_until) return false;
    return moment().isBefore(moment(user.premium_until));
}

function getPremiumTimeLeft(user) {
    if (!user.premium_until) return "Tidak Aktif ❌";
    const now = moment();
    const end = moment(user.premium_until);
    if (now.isAfter(end)) return "Kadaluarsa ⚠️";

    const diffYears = end.diff(now, "years");
    if (diffYears > 10) return "Permanen (VIP 👑)";

    const diffDays = end.diff(now, "days");
    if (diffDays > 0) return `${diffDays} Hari Lagi`;

    const diffHours = end.diff(now, "hours");
    return `${diffHours} Jam Lagi`;
}

async function sendMainMenu(chatId, messageId = null, user = null) {
    if (!user) user = await getUser(chatId);

    // No longer block on missing gender — users can access menu freely

    // Mengambil total user dari Supabase
    const { count } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true });

    // Hitung user yang benar-benar aktif di sistem matchmaking baru
    const onlineCount =
        activeChats.size +
        waitingList.general.length +
        waitingList.ageList.length;

    const L = getLang(chatId);
    const hour = moment().utcOffset("+0700").hour();
    let greeting = L.greeting_malam || "Selamat Malam";
    if (hour >= 4 && hour < 11) greeting = L.greeting_pagi || "Selamat Pagi";
    else if (hour >= 11 && hour < 15) greeting = L.greeting_siang || "Selamat Siang";
    else if (hour >= 15 && hour < 18) greeting = L.greeting_sore || "Selamat Sore";

    const chatIcon = user.gender === 'M' ? '👦' : '👧';
    const displayGender = user.gender === "M" ? "👦 Laki-laki" : "👧 Perempuan";

    const isPrem = isPremium(user);
    const premBadge = isPrem ? `🌟 <b>VIP SULTAN</b>` : '⚪ <b>REGULER</b>';
    const premTime = getPremiumTimeLeft(user);
    const defaultWelcome = "Masuk ke dalam jaringan, temukan koneksi baru, dan biarkan identitasmu menjadi misteri. Tidak ada batasan, tidak ada jejak. Hanya kamu dan ribuan pengguna lain yang menunggu di seluruh dunia.";

    let caption = `✨ <b>A N O N Y M O U S  P L U S</b> ✨\n`;
    caption += `<code>v3.0 • Enterprise Edition</code>\n`;
    caption += `<code>━━━━━━━━━━━━━━━━━━━━━━</code>\n`;
    caption += `${L.menu_subtitle || '<i>⚡ Fast Match · 🌍 Global · 🔒 Anonymous</i>'}\n\n`;

    caption += `👋 <b>${greeting}🌅, ${user.first_name}!</b> ${chatIcon}\n`;
    caption += `<i>"${L.menu_welcome_text || defaultWelcome}"</i>\n\n`;

    caption += `🪪 <b>[ P R O F I L E ]</b>\n`;
    caption += `${L.menu_wallet}\n`;
    caption += `▪️ <tg-spoiler>ID: ${chatId}</tg-spoiler>  ·  ${displayGender}\n`;
    caption += `▪️ <b>Status</b>  : ${premBadge}\n`;
    if (isPrem) caption += `▪️ <b>Sisa VIP</b>: <i>${premTime}</i>\n`;

    caption += `<code>━━━━━━━━━━━━━━━━━━━━━━</code>\n`;
    caption += `${L.menu_server}\n`;
    caption += `⚡ ${L.menu_online || "Online"}: <b>${onlineCount}</b>  ·  👥 ${L.menu_users || "Total"}: <b>${count || 0}</b>\n`;
    caption += `🚀 <i>Fast Match™ — avg &lt;3s connect</i>\n\n`;

    caption += `<code>━━━━━━━━━━━━━━━━━━━━━━</code>\n`;
    caption += `🎯 <i>${L.menu_choose || "Pilih command di bawah ini:"}</i>`;

    const options = {
        parse_mode: "HTML",
        reply_markup: {
            inline_keyboard: [
                [{ text: `${L.btn_search_random || "Cari Partner (Random)"}`, callback_data: "search_random" }],
                [{ text: `🎯 Find by Age`, callback_data: "menu_search_age" }],
                [
                    { text: `${L.btn_search_male || "Pria"}`, callback_data: "search_male" },
                    { text: `${L.btn_search_female || "Wanita"}`, callback_data: "search_female" },
                ],
                [
                    { text: `${L.btn_profile || "Profil Saya"}`, callback_data: "my_profile" },
                    { text: `${L.btn_change_lang || "Ganti Bahasa"}`, callback_data: "lang_menu" }
                ],

                [
                    { text: "💎 Upgrade VIP Sultan", callback_data: "buy_premium" },
                ],

            ],
        },
    };


    if (messageId) {
        return bot
            .editMessageText(caption, {
                chat_id: chatId,
                message_id: messageId,
                ...options,
            })
            .catch(() => {
                bot.sendMessage(chatId, caption, options);
            });
    }

    bot.sendMessage(
        chatId,
        "🏠 <b>Menu Engine Aktif</b> — Menu terenkripsi tersedia!",
        {
            parse_mode: "HTML",
            reply_markup: getMainKeyboard(),
        },
    ).catch(() => { });

    return bot
        .sendMessage(chatId, caption, options)
        .catch(() => bot.sendMessage(chatId, caption, options));
}

// ══════════════════════════════════════════════════════════════
// REGION SETUP — Tampil saat user pertama kali start / dari profile
// ══════════════════════════════════════════════════════════════
async function sendRegionSetup(chatId, isFirstTime = true) {
    const headerText = isFirstTime
        ? `🌍 <b>WELCOME TO ANONYMOUS CHAT!</b> 🌍`
        : `🌍 <b>REGION SETTINGS</b>`;

    const bodyText = isFirstTime
        ? `Before we connect you with someone new, let's set up your <b>Region</b>.\n\n` +
        `Your region determines who you'll be matched with:\n` +
        `• <b>With region set</b> → You'll be matched with people from the <b>same region</b>\n` +
        `• <b>Skip / No region</b> → Matched with anyone globally (random)\n\n` +
        `<i>💡 You can change this anytime in your Profile Settings.</i>`
        : `Choose your region to be matched with people from the same community.\n\n` +
        `• <b>With region set</b> → Matched with same-region users\n` +
        `• <b>No region</b> → Random global matching\n\n` +
        `<i>💡 Changing region takes effect on your next search.</i>`;

    const text = `${headerText}\n<code>━━━━━━━━━━━━━━━━━━━━</code>\n\n${bodyText}`;

    const regionRows = [
        [
            { text: `🇮🇩 Indonesia`, callback_data: 'region_set_ID' },
            { text: `🌐 English / Global`, callback_data: 'region_set_EN' },
        ],
        [
            { text: `🇸🇦 Arab / Middle East`, callback_data: 'region_set_AR' },
            { text: `🇲🇾 Malaysia`, callback_data: 'region_set_MY' },
        ],
        [
            { text: `🇨🇳 China`, callback_data: 'region_set_CN' },
            { text: `🇯🇵 Japan`, callback_data: 'region_set_JP' },
        ],
        [
            { text: `🇷🇺 Russia`, callback_data: 'region_set_RU' },
        ],
        [
            { text: isFirstTime ? '⏭️ Skip for now (Random Match)' : '🌍 Remove Region (Random Match)', callback_data: 'region_skip' },
        ],
    ];

    return bot.sendMessage(chatId, text, {
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: regionRows },
    });
}

// --- MENU HANDLER (CALLBACK QUERY) ---
bot.on("callback_query", async (query) => {
    const chatId = query.message.chat.id;
    console.log("Tombol ditekan, datanya adalah:", query.data);
    const action = query.data;
    const user = await getUser(chatId);

    bot.answerCallbackQuery(query.id);



    if (action === "menu_search_age") {
        const uAge = await getUser(chatId);

        if (!uAge.age) {
            ageRegistrationMode.set(chatId, 'register');
            bot.answerCallbackQuery(query.id, {
                text: "⚠️ USIA BELUM DIATUR! Silakan cek pesan di bawah.",
                show_alert: true,
            }).catch(() => { });
            return bot.sendMessage(
                chatId,
                "⚠️ <b>USIA BELUM DIATUR!</b>\nSilakan ketik usia kamu dalam bentuk angka (Contoh: 18) di chat ini sekarang:",
                { parse_mode: "HTML" },
            );
        }

        const isPremForAge = isPremium(uAge);
        const ageMenuTxt =
            `🎯 <b>RADAR USIA SPESIFIK</b> 🎯\n━━━━━━━━━━━━━━━━━━━━\n\n` +
            `Usia kamu saat ini: <b>${uAge.age} Tahun</b>\n` +
            `Pilih kriteria rentang usia target yang ingin kamu temukan.\n\n` +
            (isPremForAge ? `✅ <b>Status:</b> Premium — Fitur ini GRATIS untuk kamu!` : `🔒 <b>Syarat Akses:</b> Fitur ini khusus untuk pengguna <b>Premium</b>!\n<i>Upgrade sekarang untuk mengakses radar usia.</i>`);

        return bot.editMessageText(ageMenuTxt, {
            chat_id: chatId,
            message_id: query.message.message_id,
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: `🎯 Sama (Usia ${uAge.age})`,
                            callback_data: `search_age_exact`,
                        },
                    ],
                    [
                        {
                            text: `⬆️ Lebih Tua (${uAge.age + 1} - ${Math.min(99, uAge.age + 5)})`,
                            callback_data: `search_age_older`,
                        },
                    ],
                    [
                        {
                            text: `⬇️ Lebih Muda (${Math.max(12, uAge.age - 5)} - ${uAge.age - 1})`,
                            callback_data: `search_age_younger`,
                        },
                    ],
                    [
                        {
                            text: "🔙 Kembali ke Menu Utama",
                            callback_data: "back_to_main",
                        },
                    ],
                ],
            },
        });
    }

    if (action === "play_truth" || action === "play_dare") {
        const currentPartnerId = activeChats.get(chatId);

        if (!currentPartnerId) {
            return bot.answerCallbackQuery(query.id, {
                text: "❌ GAGAL! Kamu tidak sedang dalam obrolan apapun.",
                show_alert: true,
            });
        }
        bot.answerCallbackQuery(query.id, {
            text: "🎲 Mengirim tantangan ke partner...",
        });

        const type =
            action === "play_truth" ? "JUJUR (Truth) 🗣️" : "BERANI (Dare) 😈";
        const challenge =
            action === "play_truth"
                ? "Ceritakan satu rahasia memalukan yang belum pernah kamu kasih tau ke siapa-siapa!"
                : "Kirim satu foto selfie gaya paling jelek kamu sekarang juga!";

        bot.sendMessage(
            chatId,
            `✅ Kamu menantang lawan bicaramu untuk <b>${type}</b>!\n\n<i>Tunggu balasan dari partnermu...</i> 😎`,
            { parse_mode: "HTML" },
        );
        const partnerMsg =
            `🚨 <b>TANTANGAN TRUTH OR DARE!</b> 🚨\n` +
            `━━━━━━━━━━━━━━━━━━━━\n\n` +
            `Partnermu menantang kamu untuk memilih <b>${type}</b>!\n\n` +
            `👉 <b>Tantangan/Pertanyaan:</b>\n` +
            `<i>"${challenge}"</i>\n\n` +
            `Ayo balas sekarang! Jangan cemen! 🤪`;

        return bot
            .sendMessage(currentPartnerId, partnerMsg, { parse_mode: "HTML" })
            .catch(() => { });
    }


    if (action.startsWith("qzans_")) {
        const parts = action.split("_");
        const masterId = parseInt(parts[1]);
        const choiceIndex = parseInt(parts[2]);
        let qSession = activeQuizzes.get(masterId);
        if (!qSession) {
            return bot.answerCallbackQuery(query.id, {
                text: "⏳ Terlambat! Kuis sudah berakhir atau dijawab.",
                show_alert: true,
            });
        }
        if (choiceIndex === qSession.correctAnswer) {
            qSession.answered = true;
            const labels = ["A", "B", "C", "D"];
            const winnerName = cleanHTML(query.from.first_name);

            const winMsg = `${qSession.baseText}\n\n🎉 <b>${winnerName} MENJAWAB BENAR!</b> 🏆\nJawaban: <b>${labels[choiceIndex]}. ${qSession.correctText}</b>`;
            bot.editMessageText(winMsg, {
                chat_id: masterId,
                message_id: qSession.msgIdA,
                parse_mode: "HTML",
            }).catch(() => { });
            bot.editMessageText(winMsg, {
                chat_id: qSession.pid,
                message_id: qSession.msgIdB,
                parse_mode: "HTML",
            }).catch(() => { });
            activeQuizzes.delete(masterId);
            activeQuizzes.delete(qSession.pid);
            return bot.answerCallbackQuery(query.id, {
                text: "✅ BENAR! Kamu hebaaat!",
                show_alert: true,
            });
        } else {
            return bot.answerCallbackQuery(query.id, {
                text: "❌ SALAH! Ayo coba pilih yang lain.",
                show_alert: true,
            });
        }
    }


    if (action === "stop_chat") {
        if (activeChats.has(chatId)) {
            bot.deleteMessage(chatId, query.message.message_id).catch(() => { });
            const partnerId = activeChats.get(chatId);
            endChatAndSendFeedback(chatId, partnerId, false);
        } else {
            bot.answerCallbackQuery(query.id, {
                text: "❌ Kamu tidak sedang dalam obrolan!",
                show_alert: true,
            });
        }
    }

    if (action === "tod_spin_player") {
        const partnerId = activeChats.get(chatId);
        if (!partnerId)
            return bot.answerCallbackQuery(query.id, {
                text: "Obrolan berakhir!",
                show_alert: true,
            });

        const msgId = query.message.message_id;
        const players = [chatId, partnerId];
        const frames = ["⏳ 🔄", "⌛ 🔃", "⏳ 🌀", "⌛ 🔄"];

        for (let i = 0; i < 10; i++) {
            await bot
                .editMessageText(
                    `🌀 <b>MEMILIH KORBAN...</b> 🌀\n\n` +
                    `       [ ${frames[i % 4]} ]\n\n` +
                    `<i>Siapa yang akan mendapatkan giliran pertama?</i>`,
                    { chat_id: chatId, message_id: msgId, parse_mode: "HTML" },
                )
                .catch(() => { });
            await new Promise((res) => setTimeout(res, 400));
        }

        const targetId = players[Math.floor(Math.random() * players.length)];
        const isYou = targetId === chatId;

        const resultText =
            `🎯 <b>TARGET DITETAPKAN!</b>\n━━━━━━━━━━━━━━━━━━━━\n\n` +
            `Giliran: <b>${isYou ? "KAMU" : "PARTNER"}</b>\n\n` +
            `<i>${isYou ? "Silakan pilih nasibmu!" : "Tunggu partner memilih nasibnya..."}</i>`;

        await bot
            .editMessageText(resultText, {
                chat_id: chatId,
                message_id: msgId,
                parse_mode: "HTML",
            })
            .catch(() => { });
        bot.sendMessage(partnerId, resultText).catch(() => { });

        if (isYou) {
            bot.editMessageReplyMarkup(
                {
                    inline_keyboard: [
                        [
                            {
                                text: "😇 TRUTH",
                                callback_data: "tod_select_truth",
                            },
                            {
                                text: "😈 DARE",
                                callback_data: "tod_select_dare",
                            },
                        ],
                    ],
                },
                { chat_id: chatId, message_id: msgId },
            ).catch(() => { });
        }
    }

    if (action.startsWith("tod_select_")) {
        const type = action.replace("tod_select_", "");
        const partnerId = activeChats.get(chatId);
        const msgId = query.message.message_id;

        const animIcons =
            type === "truth"
                ? ["❓", "💭", "📖", "🔍"]
                : ["🔥", "⚡", "💣", "🧨"];
        for (let i = 0; i < 8; i++) {
            await bot
                .editMessageText(
                    `🎲 <b>MENGACAK ${type.toUpperCase()}...</b>\n\n` +
                    `       [ ${animIcons[i % 4]} ]\n\n` +
                    `<i>Berdoa saja semoga tantangannya mudah...</i>`,
                    { chat_id: chatId, message_id: msgId, parse_mode: "HTML" },
                )
                .catch(() => { });
            await new Promise((res) => setTimeout(res, 500));
        }

        const list = TOD_DATA[type];
        const challenge = list[Math.floor(Math.random() * list.length)];

        const finalMsg =
            `✨ <b>${type.toUpperCase()} CHALLENGE</b> ✨\n━━━━━━━━━━━━━━━━━━━━\n\n` +
            `👉 <blockquote>${challenge}</blockquote>\n\n` +
            `<i>Lakukan tantangan di atas sekarang!</i>`;

        bot.editMessageText(finalMsg, {
            chat_id: chatId,
            message_id: msgId,
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "✅ SUDAH JAWAB / DILAKUKAN",
                            callback_data: "tod_done",
                        },
                    ],
                    [{ text: "🛑 AKHIRI GAME", callback_data: "tod_end" }],
                ],
            },
        }).catch(() => { });

        bot.sendMessage(partnerId, finalMsg).catch(() => { });
    }

    if (action === "tod_done") {
        const partnerId = activeChats.get(chatId);
        const nextMsg = `👏 <b>TANTANGAN SELESAI!</b>\n\nSekarang giliran partner untuk memutar spin pemain!`;

        bot.editMessageText(nextMsg, {
            chat_id: chatId,
            message_id: query.message.message_id,
            parse_mode: "HTML",
        }).catch(() => { });
        bot.sendMessage(
            partnerId,
            `✅ Partner sudah menjawab! Sekarang giliranmu untuk SPIN!`,
            {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "🔄 SPIN PEMAIN SEKARANG!",
                                callback_data: "tod_spin_player",
                            },
                        ],
                    ],
                },
            },
        ).catch(() => { });
    }

    if (action === "tod_end") {
        const partnerId = activeChats.get(chatId);
        const endMsg = `🛑 <b>GAME BERAKHIR</b>\n\nPermainan Truth or Dare telah dihentikan. Silakan lanjut mengobrol biasa!`;
        bot.editMessageText(endMsg, {
            chat_id: chatId,
            message_id: query.message.message_id,
        }).catch(() => { });
        bot.sendMessage(partnerId, endMsg).catch(() => { });
    }



    if (action.startsWith("search_age_")) {
        const uTarget = await getUser(chatId);

        const msgId = query.message.message_id;

        const receiptTxt =
            `✅ <b>INISIALISASI RADAR USIA</b> ✅\n` +
            `━━━━━━━━━━━━━━━━━━━━\n\n` +
            `Fitur: <b>Radar Usia Spesifik</b>\n` +
            `Status: <b>Gratis (Premium)</b>\n\n` +
            `Developer By: Raihan_official0307\n` +
            `<i>Memulai inisialisasi sistem pencarian...</i>`;

        await bot
            .editMessageText(receiptTxt, {
                chat_id: chatId,
                message_id: msgId,
                parse_mode: "HTML",
            })
            .catch(() => { });

        await new Promise((r) => setTimeout(r, 3000));

        const frames = [
            "⚙️ <i>Mengkalibrasi satelit radar...</i>",
            "📡 <i>Menyaring data demografi server...</i>",
            "🎯 <i>Menetapkan parameter rentang usia...</i>",
            "🚀 <i>Sistem siap! Memulai pencarian target...</i>",
        ];

        for (let i = 0; i < frames.length; i++) {
            await bot
                .editMessageText(
                    `🎯 <b>MENGAKTIFKAN RADAR USIA</b>\n\n${frames[i]}`,
                    { chat_id: chatId, message_id: msgId, parse_mode: "HTML" },
                )
                .catch(() => { });
            await new Promise((r) => setTimeout(r, 600));
        }
        bot.deleteMessage(chatId, msgId).catch(() => { });
        return startSearch(chatId, action, null);
    }

    if (action === "react_cancel") {
        return bot
            .deleteMessage(chatId, query.message.message_id)
            .catch(() => { });
    }

    if (action.startsWith("react_send_")) {
        const emoji = action.replace("react_send_", "");
        const partnerId = activeChats.get(chatId);

        bot.deleteMessage(chatId, query.message.message_id).catch(() => { });

        if (!partnerId) {
            return bot.answerCallbackQuery(query.id, {
                text: "❌ Gagal mengirim. Obrolan sudah berakhir!",
                show_alert: true,
            });
        }
        const sender = await getUser(chatId);
        const isSenderPrem = isPremium(sender);

        let rxMsg = "";
        if (isSenderPrem) {
            rxMsg = `╔══════════════════╗\n`;
            rxMsg += `  👑 <b>VIP SULTAN REACTION</b>\n`;
            rxMsg += `╚══════════════════╝\n\n`;
            rxMsg += `     ✨ ${emoji} ${emoji} ${emoji} ✨`;
        } else {
            rxMsg = `👤 <b>Partner bereaksi:</b> ${emoji} ${emoji} ${emoji}`;
        }

        bot.sendMessage(partnerId, rxMsg, { parse_mode: "HTML" });
        bot.answerCallbackQuery(query.id, {
            text: `✅ Reaksi ${emoji} berhasil dikirim ke partner!`,
        });
    }

    if (action === "buy_premium") {
        return sendVipMenu(chatId, query.message.message_id);
    }





    if (action === "share_my_username") {
        const partnerId = activeChats.get(chatId);

        if (!partnerId) {
            return bot.answerCallbackQuery(query.id, {
                text: "❌ Kamu tidak sedang dalam obrolan!",
                show_alert: true,
            });
        }

        bot.answerCallbackQuery(query.id, {
            text: "✅ Pesan kenalan berhasil dikirim dengan gaya ke partnermu!",
            show_alert: true,
        }).catch(() => { });
        const sender = await getUser(chatId);
        const tgUsername = sender.username || "anonymousechat";

        const shareMsg = `✨ <b>ADA YANG TERTARIK PADAMU!</b> ✨\n\nLawan bicaramu mengirimkan undangan spesial:\n\n<i>"Kamu sangat menarik, sepertinya kita bisa kenalan lebih lanjut di t.me/${tgUsername}"</i>\n\nKlik link di atas jika kamu merasa cocok untuk berteman lebih jauh!`;
        bot.sendMessage(partnerId, shareMsg, {
            parse_mode: "HTML",
            disable_web_page_preview: true,
        }).catch(() => { });

        bot.editMessageReplyMarkup(
            {
                inline_keyboard: [
                    [
                        {
                            text: "👁️ Lihat Informasi Pengguna",
                            callback_data: "view_partner_info",
                        },
                    ],
                    [{ text: "🛑 Akhiri Obrolan", callback_data: "stop_chat" }],
                ],
            },
            { chat_id: chatId, message_id: query.message.message_id },
        ).catch(() => { });
    }

    if (action === "menu_broadcast") {
        const ownerId = process.env.OWNER_ID.toString();
        if (chatId.toString() === ownerId) {
            let ownerText = `📢 <b>PANEL BROADCAST OWNER</b> 👑\n\n`;
            ownerText += `Halo Boss! Untuk mengirimkan siaran (broadcast) ke seluruh pengguna, kamu tidak perlu lewat menu ini.\n\n`;
            ownerText += `Cukup ketik langsung di kolom chat dengan format:\n`;
            ownerText += `<code>/broadcast [Pesan Kamu Di Sini]</code>\n\n`;
            ownerText += `<b>Contoh:</b>\n`;
            ownerText += `<code>/broadcast Besok server maintenance jam 12 malam ya!</code>`;

            return bot.editMessageText(ownerText, {
                chat_id: chatId,
                message_id: query.message.message_id,
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "👁️ Lihat Pengumuman Saat Ini",
                                callback_data: "view_broadcast_msg",
                            },
                        ],
                        [
                            {
                                text: "🔙 Kembali ke Menu Utama",
                                callback_data: "back_to_main",
                            },
                        ],
                    ],
                },
            });
        } else {
            let userText = `📢 <b>PENGUMUMAN TERBARU SERVER</b>\n`;
            userText += `━━━━━━━━━━━━━━━━━━━━\n\n`;
            userText += `${latestBroadcastMsg}\n\n`;
            userText += `━━━━━━━━━━━━━━━━━━━━\n`;
            userText += `<i>⚠️ Akses Ditolak: Anda bukan Owner. Anda hanya dapat melihat dan membaca pengumuman terbaru di halaman ini.</i>`;

            return bot.editMessageText(userText, {
                chat_id: chatId,
                message_id: query.message.message_id,
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "🔙 Kembali ke Menu Utama",
                                callback_data: "back_to_main",
                            },
                        ],
                    ],
                },
            });
        }
    }

    if (action === "view_broadcast_msg") {
        let msgText = `📢 <b>PENGUMUMAN TERBARU SERVER</b>\n`;
        msgText += `━━━━━━━━━━━━━━━━━━━━\n\n`;
        msgText += `${latestBroadcastMsg}\n\n`;
        msgText += `━━━━━━━━━━━━━━━━━━━━\n`;
        msgText += `<i>👀 Ini adalah tampilan pengumuman yang sedang tayang dan dibaca oleh seluruh user saat ini.</i>`;

        return bot.editMessageText(msgText, {
            chat_id: chatId,
            message_id: query.message.message_id,
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "🔙 Kembali ke Panel Admin",
                            callback_data: "menu_broadcast",
                        },
                    ],
                    [
                        {
                            text: "🏠 Buka Menu Utama",
                            callback_data: "back_to_main",
                        },
                    ],
                ],
            },
        });
    }

    if (action === "skip_gender" || action === "set_gender_male" || action === "set_gender_female") {
        if (action !== "skip_gender") {
            const g = action === "set_gender_male" ? "M" : "F";
            await supabase.from('users').update({ gender: g }).eq('telegram_id', chatId);
            require('./supabase').invalidateUserCache(chatId);
        }
        bot.editMessageText("✅ <b>Langkah 1 Selesai.</b>", { chat_id: chatId, message_id: query.message.message_id, parse_mode: "HTML" }).catch(() => { });

        // Lanjut ke Usia — set mode ke 'register' (string) bukan boolean!
        ageRegistrationMode.set(chatId, "register");
        return bot.sendMessage(chatId, "🎂 <b>Langkah 2:</b> Silakan ketik usia Anda dalam angka (misal: 18) di chat ini, atau tekan Skip.", {
            parse_mode: "HTML",
            reply_markup: { inline_keyboard: [[{ text: "⏩ Skip", callback_data: "skip_age" }]] }
        });
    }

    if (action === "skip_age") {
        ageRegistrationMode.delete(chatId);

        const congratsText = `🎉 <b>SELAMAT DATANG DI ANONYMOUS CHAT!</b> 🎉\n<code>━━━━━━━━━━━━━━━━━━━━</code>\n\n✅ <b>Profil Berhasil Dibuat!</b>\n\n🚀 Pencarian partner dimulai sekarang...`;
        // Pesan congrats dipakai ulang (di-edit) jadi SEARCHING — tanpa pesan tambahan
        const congratsMsg = await bot.sendMessage(chatId, congratsText, { parse_mode: "HTML" }).catch(() => null);

        startSearch(chatId, "search_random", null, congratsMsg ? congratsMsg.message_id : null);
        return;
    }

    if (action === "chat_gender_male" || action === "chat_gender_female") {
        const uTarget = await getUser(chatId);
        if (!isPremium(uTarget)) {
            bot.answerCallbackQuery(query.id, { text: "⚠️ Fitur ini khusus pengguna VIP/Premium!", show_alert: true }).catch(() => { });
            return sendVipMenu(chatId, query.message.message_id);
        }


        bot.answerCallbackQuery(query.id, { text: "✅ Memulai pencarian spesifik gender..." });

        if (activeChats.has(chatId)) {
            const partnerId = activeChats.get(chatId);
            endChatAndSendFeedback(chatId, partnerId, false); // Terminate current session quietly
        }

        const nextAction = action === "chat_gender_male" ? "search_male" : "search_female";
        // Mode ketat dulu: hanya gender asli yang dipilih (fallback ditunda ke radar).
        return startSearch(chatId, nextAction, null, null, { allowFallback: false });
    }

    if (action === "set_gender") {
        const options = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "Laki-laki 👦", callback_data: "set_m" }],
                    [{ text: "Perempuan 👧", callback_data: "set_f" }],
                ],
            },
        };
        return bot.sendMessage(chatId, "Silakan pilih gender kamu:", options);
    }

    if (action === "set_m" || action === "set_f") {
        const gender = action === "set_m" ? "M" : "F";

        await supabase
            .from("users")
            .update({ gender: gender })
            .eq("telegram_id", chatId);

        bot.answerCallbackQuery(query.id, {
            text: "✅ Jenis Kelamin disimpan!",
            show_alert: false,
        });

        ageRegistrationMode.set(chatId, "update");

        return bot
            .editMessageText(
                `✅ <b>Gender Tersimpan!</b>\n\n📝 <b>Opsional: Masukkan Usia</b>\n\nKetik usiamu dalam angka (contoh: 18, 20, 25) di kolom chat.\n<i>Atau klik Skip untuk tutup:</i>`,
                {
                    chat_id: chatId,
                    message_id: query.message.message_id,
                    parse_mode: "HTML",
                    reply_markup: { inline_keyboard: [[{ text: "⏭️ Skip", callback_data: "close_info_msg" }]] },
                },
            )
            .catch(() => { });
    }



    if (action.startsWith("prem_stars_")) {
        const days = parseInt(action.split("_")[2]);
        const plan = PREMIUM_PLANS[days];

        if (!plan) {
            return bot.answerCallbackQuery(query.id, {
                text: "❌ Paket tidak ditemukan. Ketik /vip untuk melihat paket.",
                show_alert: true,
            }).catch(() => { });
        }

        bot.answerCallbackQuery(query.id, { text: `🌟 Menyiapkan invoice ${plan.label}...` }).catch(() => { });

        const title = `Topup ${plan.label} 🌟`;
        const description =
            "Akses eksklusif Premium/VIP: bebas pilih gender target, lihat info profil lengkap partner tanpa batas, badge profil khusus, prioritas matchmaking, dan lainnya!";
        const payload = `prem_stars_${days}_${chatId}_${Date.now()}`;

        // Pesan sementara: dihapus setelah invoice muncul (chat tetap rapi)
        const tempMsg = await bot.sendMessage(
            chatId,
            `⏳ <i>Menyiapkan invoice resmi Telegram Stars...</i>`,
            { parse_mode: "HTML" },
        ).catch(() => null);

        try {
            // Telegram Stars (XTR): provider_token WAJIB string kosong ""
            await bot.sendInvoice(
                chatId,
                title,
                description,
                payload,
                "",
                "XTR",
                [{ label: plan.label, amount: plan.stars }],
            );
            if (tempMsg) bot.deleteMessage(chatId, tempMsg.message_id).catch(() => { });
        } catch (err) {
            const desc =
                (err && err.response && err.response.body && err.response.body.description) ||
                (err && err.message) ||
                "unknown error";
            console.error("[STARS INVOICE] Gagal membuat invoice:", desc);
            const failText =
                `❌ <b>Gagal membuat invoice Stars</b>\n\n` +
                `<code>${desc}</code>\n\n` +
                `Coba lagi beberapa saat lagi atau hubungi Owner.`;
            if (tempMsg) {
                if (!(await safeEdit(chatId, tempMsg.message_id, failText, { parse_mode: "HTML" }))) {
                    bot.sendMessage(chatId, failText, { parse_mode: "HTML" }).catch(() => { });
                }
            } else {
                bot.sendMessage(chatId, failText, { parse_mode: "HTML" }).catch(() => { });
            }
        }
        return;
    }

    if (action === "devbc_send" || action === "devbc_rewrite" || action === "devbc_cancel") {
        const sess = devBcSessions.get(chatId);

        if (!sess || !sess.text) {
            bot.answerCallbackQuery(query.id, { text: "❌ Sesi sudah berakhir. Jalankan /broadcastdeveloper lagi.", show_alert: true }).catch(() => { });
            bot.deleteMessage(chatId, query.message.message_id).catch(() => { });
            return;
        }

        if (action === "devbc_cancel") {
            devBcSessions.delete(chatId);
            bot.answerCallbackQuery(query.id, { text: "Dibatalkan" }).catch(() => { });
            return bot.editMessageText("❌ <b>Broadcast Developer dibatalkan.</b>", {
                chat_id: chatId,
                message_id: query.message.message_id,
                parse_mode: "HTML",
            }).catch(() => { });
        }

        if (action === "devbc_rewrite") {
            sess.step = "text";
            sess.text = null;
            sess.expiresAt = Date.now() + DEV_BC_TTL;
            bot.answerCallbackQuery(query.id, { text: "Silakan kirim pesan baru" }).catch(() => { });
            return bot.editMessageText(
                "✏️ <b>TULIS ULANG PESAN</b>\n<code>━━━━━━━━━━━━━━━━━━━━</code>\n\nKirim isi pesan broadcast yang baru di chat ini.\n\n<i>Ketik /batal untuk membatalkan.</i>",
                { chat_id: chatId, message_id: query.message.message_id, parse_mode: "HTML" },
            ).catch(() => { });
        }

        // devbc_send
        bot.answerCallbackQuery(query.id, { text: "🚀 Mengirim broadcast..." }).catch(() => { });
        const textToSend = sess.text;
        devBcSessions.delete(chatId);
        bot.deleteMessage(chatId, query.message.message_id).catch(() => { });
        return runBroadcast(chatId, textToSend, { kind: "info" });
    }

    if (action === "cancel_payment") {
        bot.deleteMessage(chatId, query.message.message_id).catch(() => { });
        return bot.sendMessage(chatId, "✅ Pembayaran telah dibatalkan.");
    }

    if (action === "view_partner_info") {
        const currentPartnerId = activeChats.get(chatId);

        if (!currentPartnerId) {
            return bot.answerCallbackQuery(query.id, {
                text: "❌ Kamu tidak sedang dalam obrolan apapun saat ini.",
                show_alert: true,
            });
        }

        const currentUser = await getUser(chatId);
        const isUserPrem = isPremium(currentUser);

        const partnerData = await getUser(currentPartnerId);
        const isPartnerPrem = isPremium(partnerData);
        const hasUnlocked =
            unlockedPartnerInfo.get(chatId) === currentPartnerId;

        let infoText = `🕵️‍♂️ *INFORMASI LAWAN BICARA* 🕵️‍♀️\n`;
        infoText += `━━━━━━━━━━━━━━━━━━━━\n`;

        let inlineKeyboard = [];

        if (isUserPrem || hasUnlocked) {
            const displayUsername =
                partnerData.username && partnerData.username !== "Anonim"
                    ? `[@${partnerData.username}](https://t.me/${partnerData.username})`
                    : "_Tidak disetel (Disembunyikan)_";

            const displayGender =
                partnerData.gender === "M"
                    ? "Laki-laki 👦"
                    : partnerData.gender === "F"
                        ? "Perempuan 👧"
                        : "Belum diatur ❓";

            const displayAge = partnerData.age
                ? `${partnerData.age} Tahun`
                : "_Belum diatur ❓_";

            const pRating = partnerData.rating || 0;
            let ratingInfo = `📊 *Rating:* ${pRating > 0 ? "+" : ""}${pRating} Poin`;

            if (pRating < 0) {
                ratingInfo += `\n🚨 *PERINGATAN:* Rating user ini sangat BURUK! Berhati-hatilah saat berinteraksi. Akun dengan reputasi buruk secara terus-menerus akan berdampak pada BANNED permanen dari sistem.`;
            } else if (pRating >= 5) {
                ratingInfo += `\n✨ *Catatan:* User ini sangat direkomendasikan dan ramah!`;
            }

            infoText += `Berikut adalah data dari orang yang sedang terhubung denganmu saat ini:\n\n`;
            infoText += `💠 *ID Pengguna:* \`${partnerData.telegram_id}\`\n`;
            infoText += `👤 *Nama Panggilan:* ${partnerData.first_name}\n`;
            infoText += `🔗 *Username:* ${displayUsername}\n`;
            infoText += `🚻 *Gender:* ${displayGender}\n`;
            infoText += `🎂 *Usia:* ${displayAge}\n`;
            infoText += `${ratingInfo}\n`;
            infoText += `🌟 *Status:* ${isPartnerPrem ? "👑 VIP / PREMIUM" : "⚪ REGULER"}\n\n`;

            inlineKeyboard.push([
                { text: "Tutup Info ❌", callback_data: "close_info_msg" },
            ]);
        }
        // JIKA USER REGULER — PREMIUM ONLY
        else {
            infoText += `⚠️ *AKSES DIBATASI* ⚠️\n\n`;
            infoText += `Kamu harus menjadi pengguna 🌟 *Premium* atau 👑 *VIP* untuk bisa melihat identitas asli lawan bicaramu.\n\n`;

            infoText += `💠 *ID Pengguna:* 🔒 _PREMIUM ONLY_\n`;
            infoText += `👤 *Nama Panggilan:* 🔒 _PREMIUM ONLY_\n`;
            infoText += `🔗 *Username:* 🔒 _PREMIUM ONLY_\n`;
            infoText += `🚻 *Gender:* 🔒 _PREMIUM ONLY_\n`;
            infoText += `🎂 *Usia:* 🔒 _PREMIUM ONLY_\n`;
            infoText += `📊 *Rating:* 🔒 _PREMIUM ONLY_\n`;
            infoText += `🌟 *Status:* 🔒 _PREMIUM ONLY_\n\n`;

            infoText += `_Upgrade akunmu sekarang untuk membuka semua fitur eksklusif tanpa batas!_`;

            inlineKeyboard.push([
                { text: "🌟 Upgrade Premium / VIP Sekarang!", callback_data: "buy_premium" },
            ]);
            inlineKeyboard.push([
                { text: "Tutup Info ❌", callback_data: "close_info_msg" },
            ]);
        }

        infoText += `━━━━━━━━━━━━━━━━━━━━\n`;
        infoText += `💡 *Tips Aman:* _Gunakan informasi ini dengan bijak. Jaga etika dan kesopanan selama mengobrol agar tidak di-report oleh lawan bicaramu!_\n`;

        return bot.sendMessage(chatId, infoText, {
            parse_mode: "Markdown",
            disable_web_page_preview: true,
            reply_markup: {
                inline_keyboard: inlineKeyboard,
            },
        });
    }



    if (action === "close_info_msg") {
        return bot
            .deleteMessage(chatId, query.message.message_id)
            .catch(() => { });
    }

    if (action === "my_profile") {
        const user = await getUser(chatId);
        const statusPrem = isPremium(user) ? "🌟 PREMIUM" : "⚪ REGULER";
        const premTime = getPremiumTimeLeft(user);
        const displayGender =
            user.gender === "M"
                ? "Laki-laki 👦"
                : user.gender === "F"
                    ? "Perempuan 👧"
                    : "Belum diatur ❓";
        const displayUsername =
            user.username && user.username !== "Anonim"
                ? `@${user.username}`
                : "<i>Tidak disetel</i>";

        // Penambahan Tampilan Usia
        const displayAge = user.age
            ? `${user.age} Tahun`
            : "<i>Belum diatur ❓</i>";

        // Region display
        const displayRegion = user.region
            ? (user.region === 'GLOBAL'
                ? '🌍 Global (Random Match)'
                : getRegionDisplay(user.region))
            : '<i>Belum diatur (random global)</i>';

        const userRating = user.rating || 0;
        let ratingDisplay = `📊 <b>Reputasi (Rating):</b> ${userRating > 0 ? "+" : ""}${userRating} Poin\n`;

        if (userRating < 0) {
            ratingDisplay += `\n🚨 <b>WARNING: RATING ANDA SANGAT BURUK!</b> 🚨\n`;
            ratingDisplay += `<i>Harap jaga ketikan dan sikap Anda! Jika rating Anda terus menurun karena feedback negatif dari lawan bicara, maka ACCOUNT ANDA AKAN DI-BANNED OTOMATIS oleh sistem.</i>\n\n`;
            ratingDisplay += `<i>✨ Developer By: Raihan_official0307</i>\n\n`;
        } else if (userRating >= 10) {
            ratingDisplay += `<i>✨ Mantap! Anda memiliki reputasi yang sangat baik di komunitas ini.</i>\n\n`;
            ratingDisplay += `<i>✨ Developer By: Raihan_official0307</i>\n\n`;
        } else {
            ratingDisplay += `\n`;
        }

        let info = `🪪 <b>KARTU INFORMASI PRIBADI</b> 🪪\n`;
        info += `━━━━━━━━━━━━━━━━━━━━\n\n`;

        info += `💠 <b>ID Telegram:</b> <tg-spoiler>${chatId}</tg-spoiler> <i>(Klik untuk melihat)</i>\n`;
        info += `👤 <b>Nama Panggilan:</b> ${user.first_name}\n`;
        info += `🔗 <b>Username:</b> ${displayUsername}\n`;
        info += `🚻 <b>Jenis Kelamin:</b> ${displayGender}\n`;
        info += `🎂 <b>Usia:</b> ${displayAge}\n`;
        info += `🌍 <b>Region:</b> ${displayRegion}\n\n`;

        info += ratingDisplay;

        info += `💰 <b>Sisa Token:</b> 🪙 ${user.tokens}\n`;
        info += `💎 <b>Status Akun:</b> ${statusPrem}\n`;
        info += `⏳ <b>Masa Aktif:</b> ${premTime}\n\n`;

        info += `━━━━━━━━━━━━━━━━━━━━\n`;
        info += `<i>🌍 <b>INFO REGION:</b> Jika Anda mengatur region, Anda akan dicocokkan dengan orang yang berasal dari region yang sama. Bahasa sistem adalah pengaturan terpisah.</i>\n\n`;
        info += `<i>Jaga kerahasiaan ID Telegram Anda dari orang yang tidak dikenal!</i>`;

        const Lp = getLang(chatId);
        const currentLangName = LANGS[userLang.get(chatId) || "id"].name;
        return bot.editMessageText(info, {
            chat_id: chatId,
            message_id: query.message.message_id,
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: Lp.btn_change_gender || "🚻 Ubah Gender",
                            callback_data: "set_gender",
                        },
                        {
                            text: "🎂 Ubah Usia",
                            callback_data: "set_age_manual",
                        },
                    ],
                    [
                        {
                            text: `🌍 Set Region (${user.region ? getRegionDisplay(user.region) : 'Not Set'})`,
                            callback_data: "region_menu",
                        },
                    ],
                    [
                        {
                            text: `${Lp.btn_change_lang || "🌐 Bahasa Sistem"} (${currentLangName})`,
                            callback_data: "lang_menu",
                        },
                    ],
                    [
                        {
                            text: Lp.btn_back || "🔙 Kembali",
                            callback_data: "back_to_main",
                        },
                    ],
                    [
                        {
                            text: "❌ Tutup",
                            callback_data: "close_info_msg",
                        },
                    ],
                ],
            },
        });
    }

    if (action === "back_to_main") {
        return sendMainMenu(chatId, query.message.message_id);
    }

    if (action === "menu_features") {
        const userLangCode = userLang.get(chatId) || "id";

        const Ll = LANGS[userLangCode] || LANGS["id"];
        const featText = Ll.features_text;

        return bot
            .editMessageText(featText, {
                chat_id: chatId,
                message_id: query.message.message_id,
                parse_mode: "HTML",
                disable_web_page_preview: true,
                reply_markup: {
                    inline_keyboard: [
                        [{ text: Ll.btn_back, callback_data: "back_to_main" }],
                    ],
                },
            })
            .catch(() =>
                bot.sendMessage(chatId, featText, {
                    parse_mode: "HTML",
                    disable_web_page_preview: true,
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    text: Ll.btn_back,
                                    callback_data: "back_to_main",
                                },
                            ],
                        ],
                    },
                }),
            );
    }



    if (action === "lang_menu") {
        const Ll = getLang(chatId);
        const langText = `${Ll.lang_menu_title}\n━━━━━━━━━━━━━━━━━━━━\n\n${Ll.lang_menu_body}`;
        return bot.editMessageText(langText, {
            chat_id: chatId,
            message_id: query.message.message_id,
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "🇮🇩 Indonesia", callback_data: "lang_set_id" },
                        { text: "🇬🇧 English", callback_data: "lang_set_en" },
                    ],
                    [
                        { text: "🇸🇦 العربية", callback_data: "lang_set_ar" },
                        {
                            text: "🇲🇾 Bahasa Melayu",
                            callback_data: "lang_set_ms",
                        },
                    ],
                    [{ text: "🇨🇳 中文", callback_data: "lang_set_zh" }],
                    [{ text: Ll.btn_back, callback_data: "my_profile" }],
                ],
            },
        });
    }

    if (action.startsWith("lang_set_")) {
        const selectedLang = action.replace("lang_set_", "");
        if (LANGS[selectedLang]) {
            userLang.set(chatId, selectedLang);
            const Lnew = LANGS[selectedLang];
            bot.answerCallbackQuery(query.id, {
                text: Lnew.lang_changed,
                show_alert: false,
            });
            return sendMainMenu(chatId, query.message.message_id);
        }
    }

    if (action === "set_age_manual") {
        const uAgeUpdate = await getUser(chatId);
        const currentAge = uAgeUpdate.age
            ? `<b>${uAgeUpdate.age} Tahun</b>`
            : "<i>Belum diatur ❓</i>";

        ageRegistrationMode.set(chatId, "update");

        bot.answerCallbackQuery(query.id);

        const textEditAge =
            `🎂 <b>PEMBARUAN DATA USIA</b> 🎂\n` +
            `━━━━━━━━━━━━━━━━━━━━\n\n` +
            `Sistem mendeteksi permintaan pembaruan data demografi untuk akun Anda.\n\n` +
            `👤 <b>Usia Anda Saat Ini:</b> ${currentAge}\n\n` +
            `⏳ <b>Silakan ketik USIA BARU Anda dalam bentuk angka</b> (Contoh: 18, 20, 25) di kolom chat sekarang.\n\n` +
            `<i>Ketik /batal jika Anda berubah pikiran dan ingin membatalkan proses ini.</i>\n\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `🔒 <b>PRIVACY GUARANTEE (JAMINAN KEAMANAN):</b>\n` +
            `<i>Kami menjamin bahwa data usia dan identitas pribadi Anda dienkripsi secara aman. Data Anda <b>TIDAK AKAN PERNAH</b> disalahgunakan, disebarluaskan, atau digunakan untuk tindakan ilegal. Keamanan dan privasi Anda adalah prioritas utama sistem Anonymous Chat Expert.</i>`;

        return bot
            .editMessageText(textEditAge, {
                chat_id: chatId,
                message_id: query.message.message_id,
                parse_mode: "HTML",
            })
            .catch(() => { });
    }

    // FITUR PESAN BOTOL REMOVED

    if (action.startsWith("recover_")) {
        return bot.answerCallbackQuery(query.id, {
            text: "⌛ Tombol ini sudah tidak berlaku. Gunakan /next untuk mencari partner baru.",
            show_alert: true,
        }).catch(() => { });
    }

    if (action === "antighost_newchat") {
        await bot.answerCallbackQuery(query.id, { text: "🔍 Mencari partner baru..." });
        const pid = activeChats.get(chatId);
        if (!pid && isSearchActive(chatId)) return;
        if (pid) {
            await endChatAndSendFeedback(chatId, pid, true);
        }
        await removeFromAllQueues(chatId);
        await removeFromRegionQueues(chatId);
        await startSearch(chatId, 'search_random', null);
        return;
    }

    if (action === "antighost_wait") {
        ghostingWarnedMap.delete(chatId);
        await bot.answerCallbackQuery(query.id, { text: "⏳ OK, menunggu partnermu aktif..." });
        return;
    }

    if (action.startsWith("captcha_")) {
        const cap = captchaMap.get(chatId);
        if (!cap) {
            return bot.answerCallbackQuery(query.id, { text: "⏰ Sesi CAPTCHA sudah habis. Mulai /search lagi.", show_alert: true });
        }
        if (Date.now() > cap.expires) {
            captchaMap.delete(chatId);
            bot.deleteMessage(chatId, cap.msgId).catch(() => { });
            return bot.answerCallbackQuery(query.id, { text: "⏰ Waktu CAPTCHA habis. Ketik /search lagi.", show_alert: true });
        }
        const idx = parseInt(action.split("_")[1]);
        const chosen = cap.options[idx];
        if (chosen === cap.answer) {
            captchaMap.delete(chatId);
            captchaFailMap.delete(chatId);
            const L = getLang(chatId);
            await bot.answerCallbackQuery(query.id, { text: L.captcha_passed || "✅ Verifikasi berhasil! Mencari partner..." });
            await bot.editMessageText(
                `✅ <b>VERIFIKASI BERHASIL!</b>\n<code>━━━━━━━━━━━━━━━━━━━━</code>\n\n🎉 <i>Identitas manusia terkonfirmasi!\nMencarikan partner untukmu sekarang...</i>`,
                { chat_id: chatId, message_id: cap.msgId, parse_mode: "HTML" }
            ).catch(() => { });
            return startSearch(chatId, cap.action, cap.queryId);
        } else {
            const L = getLang(chatId);
            const prevFail = captchaFailMap.get(chatId) || { count: 0 };
            const newCount = prevFail.count + 1;
            if (newCount >= 3) {
                captchaFailMap.set(chatId, { count: newCount, blockedUntil: Date.now() + 5 * 60 * 1000 });
                captchaMap.delete(chatId);
                await bot.answerCallbackQuery(query.id, { text: "🚫 3x salah! Diblokir 5 menit.", show_alert: true });
                await bot.editMessageText(
                    `🚫 <b>AKSES DIBLOKIR SEMENTARA</b>\n<code>━━━━━━━━━━━━━━━━━━━━</code>\n\n⛔ Kamu gagal verifikasi <b>3 kali</b> berturut-turut.\n\n⏳ Tunggu <b>5 menit</b> sebelum mencoba lagi.`,
                    { chat_id: chatId, message_id: cap.msgId, parse_mode: "HTML" }
                ).catch(() => { });
                return;
            }
            captchaFailMap.set(chatId, { count: newCount, blockedUntil: null });
            await bot.answerCallbackQuery(query.id, { text: `❌ Salah! Sisa percobaan: ${3 - newCount}x`, show_alert: true });
            captchaMap.delete(chatId);
            return showCaptcha(chatId, cap.action, cap.queryId);
        }
    }

    if (action.startsWith("rps_pick_")) {
        const myChoice = action.replace("rps_pick_", "");
        const partnerId = activeChats.get(chatId);
        if (!partnerId) {
            return bot.answerCallbackQuery(query.id, { text: "❌ Obrolan sudah berakhir!", show_alert: true });
        }
        if (rpsMap.has(chatId) && rpsMap.get(chatId).choice) {
            return bot.answerCallbackQuery(query.id, { text: "⏳ Kamu sudah memilih! Tunggu partner...", show_alert: true });
        }
        rpsMap.set(chatId, { choice: myChoice, partnerId });
        const choiceEmoji = { batu: "🪨", gunting: "✂️", kertas: "📄" }[myChoice] || "❓";
        await bot.answerCallbackQuery(query.id, { text: `${choiceEmoji} Kamu memilih ${myChoice.toUpperCase()}! Menunggu partner...` });
        bot.editMessageText(
            `🪨✂️📄 <b>BATU GUNTING KERTAS!</b>\n━━━━━━━━━━━━━━━━━━━━\n\n${choiceEmoji} Kamu sudah memilih: <b>${myChoice.toUpperCase()}</b>\n\n⏳ <i>Menunggu partner memilih...</i>`,
            { chat_id: chatId, message_id: query.message.message_id, parse_mode: "HTML" }
        ).catch(() => { });
        const partnerData = rpsMap.get(partnerId);
        if (partnerData && partnerData.choice) {
            const theirChoice = partnerData.choice;
            rpsMap.delete(chatId);
            rpsMap.delete(partnerId);
            const myEmoji = { batu: "🪨", gunting: "✂️", kertas: "📄" }[myChoice] || "❓";
            const theirEmoji = { batu: "🪨", gunting: "✂️", kertas: "📄" }[theirChoice] || "❓";
            const winner = getRPSWinner(myChoice, theirChoice);
            const loser = getRPSWinner(theirChoice, myChoice);
            const resultA = `🪨✂️📄 <b>HASIL BATU GUNTING KERTAS!</b>\n━━━━━━━━━━━━━━━━━━━━\n\nKamu: ${myEmoji} <b>${myChoice.toUpperCase()}</b>\nPartner: ${theirEmoji} <b>${theirChoice.toUpperCase()}</b>\n\n${winner === "draw" ? "🤝 <b>SERI! Kalian berdua kompak!</b>" : winner === "win" ? "🏆 <b>KAMU MENANG!</b> Selamat! 🎉" : "😅 <b>KAMU KALAH!</b> Lebih beruntung lain kali!"}`;
            const resultB = `🪨✂️📄 <b>HASIL BATU GUNTING KERTAS!</b>\n━━━━━━━━━━━━━━━━━━━━\n\nKamu: ${theirEmoji} <b>${theirChoice.toUpperCase()}</b>\nPartner: ${myEmoji} <b>${myChoice.toUpperCase()}</b>\n\n${loser === "draw" ? "🤝 <b>SERI! Kalian berdua kompak!</b>" : loser === "win" ? "🏆 <b>KAMU MENANG!</b> Selamat! 🎉" : "😅 <b>KAMU KALAH!</b> Lebih beruntung lain kali!"}`;
            bot.sendMessage(chatId, resultA, { parse_mode: "HTML" });
            bot.sendMessage(partnerId, resultB, { parse_mode: "HTML" });
        } else {
            bot.sendMessage(partnerId,
                `🪨✂️📄 <b>PARTNER INGIN MAIN BATU GUNTING KERTAS!</b>\n━━━━━━━━━━━━━━━━━━━━\n\nPartnermu sudah memilih! Sekarang giliranmu!\n\n<i>Pilih gerakanmu:</i>`,
                {
                    parse_mode: "HTML",
                    reply_markup: {
                        inline_keyboard: [[
                            { text: "🪨 Batu", callback_data: "rps_pick_batu" },
                            { text: "✂️ Gunting", callback_data: "rps_pick_gunting" },
                            { text: "📄 Kertas", callback_data: "rps_pick_kertas" }
                        ]]
                    }
                }
            );
        }
        return;
    }

    if (action === "scramble_skip") {
        const gameData = scrambleMap.get(chatId);
        if (!gameData) return bot.answerCallbackQuery(query.id, { text: "Tidak ada game aktif." });
        scrambleMap.delete(chatId);
        scrambleMap.delete(gameData.pid);
        bot.answerCallbackQuery(query.id, { text: "⏭️ Kata dilewati!" });
        const skipMsg = `⏭️ <b>Kata Dilewati!</b>\nKata aslinya adalah: <b>${gameData.word}</b>`;
        bot.sendMessage(chatId, skipMsg, { parse_mode: "HTML" });
        bot.sendMessage(gameData.pid, skipMsg, { parse_mode: "HTML" });
        return;
    }

    if (action === "guess_giveup") {
        const gameData = guessMap.get(chatId);
        if (!gameData) return bot.answerCallbackQuery(query.id, { text: "Tidak ada game aktif." });
        guessMap.delete(chatId);
        guessMap.delete(gameData.pid);
        bot.answerCallbackQuery(query.id, { text: "🏳️ Menyerah!" });
        const giveupMsg = `🏳️ <b>Game Selesai!</b>\nAngka yang benar adalah: <b>${gameData.number}</b>`;
        bot.sendMessage(chatId, giveupMsg, { parse_mode: "HTML" });
        bot.sendMessage(gameData.pid, giveupMsg, { parse_mode: "HTML" });
        return;
    }

    if (action.startsWith("search_")) {
        // Pencarian gender mulai dengan mode KETAT (tanpa fallback) supaya
        // benar-benar ketemu target yang dipilih. Fallback ke user tanpa
        // gender ditangani radar setelah masa tunggu habis.
        const strictGender = action === "search_male" || action === "search_female";
        return startSearch(chatId, action, query.id, null, { allowFallback: !strictGender });
    }

    if (
        action.startsWith("fb_vulgar_")
    ) {
        bot.deleteMessage(chatId, query.message.message_id).catch(() => { });
        return bot.sendMessage(chatId, "Terima kasih atas tanggapan Anda! 🙏");
    }

    if (action.startsWith("fb_report_")) {
        const targetId = action.split("_")[2];
        const reportOptions = {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "VCS 🔞",
                            callback_data: `rpt_vcs_${targetId}`,
                        },
                        {
                            text: "SPAM 🤖",
                            callback_data: `rpt_spam_${targetId}`,
                        },
                    ],
                    [
                        {
                            text: "Iklan/Berjualan 🛒",
                            callback_data: `rpt_ads_${targetId}`,
                        },
                        {
                            text: "Mengemis 🤲",
                            callback_data: `rpt_beg_${targetId}`,
                        },
                    ],
                    [
                        {
                            text: "Menghina 🤬",
                            callback_data: `rpt_insult_${targetId}`,
                        },
                        {
                            text: "Kekerasan 🔪",
                            callback_data: `rpt_viol_${targetId}`,
                        },
                    ],
                    [
                        {
                            text: "Propaganda 📢",
                            callback_data: `rpt_prop_${targetId}`,
                        },
                    ],
                    [
                        {
                            text: "🔙 Kembali",
                            callback_data: `fb_back_${targetId}`,
                        },
                    ],
                ],
            },
        };
        return bot.editMessageText("⚠️ *Pilih alasan pengaduan:*", {
            chat_id: chatId,
            message_id: query.message.message_id,
            parse_mode: "Markdown",
            ...reportOptions,
        });
    }

    // --- TOMBOL KEMBALI DI MENU LAPORAN ---
    if (action.startsWith("fb_back_")) {
        const targetId = action.split("_")[2];
        const feedbackMsg =
            "Jika mau, silakan tinggalkan feedback tentang pasangan Anda. Ini akan membantu kami mencarikan pasangan yang lebih sesuai untuk Anda di masa depan:";
        return bot.editMessageText(feedbackMsg, {
            chat_id: chatId,
            message_id: query.message.message_id,
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "👍 Like",
                            callback_data: `fb_like_${targetId}`,
                        },
                        {
                            text: "👎 Dislike",
                            callback_data: `fb_dislike_${targetId}`,
                        },
                    ],
                    [
                        {
                            text: "🔞 Vulgar",
                            callback_data: `fb_vulgar_${targetId}`,
                        },
                        {
                            text: "⚠️ Laporkan",
                            callback_data: `fb_report_${targetId}`,
                        },
                    ],
                ],
            },
        });
    }

    if (action.startsWith("fb_like_")) {
        const targetId = action.split("_")[2];

        bot.answerCallbackQuery(query.id, {
            text: "Terima kasih atas penilaian positifmu! 👍",
        });

        const targetUser = await getUser(targetId);
        const currentRating = targetUser.rating || 0;
        await supabase
            .from("users")
            .update({ rating: currentRating + 1 })
            .eq("telegram_id", targetId);
        return bot
            .editMessageText(
                `✅ <b>Feedback Terkirim!</b>\n\nKamu telah memberikan <b>👍 Like</b> (Rating +1) kepada lawan bicaramu. Penilaianmu sangat berarti untuk komunitas kami!`,
                {
                    chat_id: chatId,
                    message_id: query.message.message_id,
                    parse_mode: "HTML",
                },
            )
            .catch(() => { });
    }
    if (action.startsWith("fb_dislike_")) {
        const targetId = action.split("_")[2];

        bot.answerCallbackQuery(query.id, {
            text: "Terima kasih atas masukannya. 👎",
        });

        const targetUser = await getUser(targetId);
        const currentRating = targetUser.rating || 0;

        await supabase
            .from("users")
            .update({ rating: currentRating - 1 })
            .eq("telegram_id", targetId);

        return bot
            .editMessageText(
                `✅ <b>Feedback Terkirim!</b>\n\nKamu telah memberikan <b>👎 Dislike</b> (Rating -1) kepada lawan bicaramu. Kami akan menggunakan data ini untuk evaluasi algoritma pencarian.`,
                {
                    chat_id: chatId,
                    message_id: query.message.message_id,
                    parse_mode: "HTML",
                },
            )
            .catch(() => { });
    }

    if (action.startsWith("rpt_")) {
        const dataParts = action.split("_");
        const reasonCode = dataParts[1];
        const targetId = dataParts[2];

        const reasonMap = {
            vcs: "VCS",
            spam: "SPAM",
            ads: "Iklan/Berjualan",
            beg: "Mengemis",
            insult: "Menghina",
            viol: "Kekerasan",
            prop: "Propaganda",
        };
        const reasonStr = reasonMap[reasonCode];

        bot.deleteMessage(chatId, query.message.message_id).catch(() => { });

        bot.sendMessage(
            chatId,
            `✅ <b>Laporan Diterima</b>\n\nPengguna dengan ID <code>${targetId}</code> telah dilaporkan dengan kasus: <b>${reasonStr}</b>.\nLaporan akan ditindaklanjuti oleh Owner. Terima kasih telah menjaga komunitas ini!`,
            { parse_mode: "HTML" },
        );

        const ownerId = process.env.OWNER_ID;
        if (ownerId) {
            const reporter = await getUser(chatId);
            const target = await getUser(targetId);

            const cleanHTML = (str) => {
                if (!str) return "-";
                return str
                    .toString()
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;");
            };

            let adminMsg = `🚨 <b>LAPORAN PENGGUNA MASUK</b> 🚨\n\n`;
            adminMsg += `👤 <b>PELAPOR:</b>\n`;
            adminMsg += `- ID: <code>${chatId}</code>\n`;
            adminMsg += `- Nama: ${cleanHTML(reporter.first_name)}\n`;
            adminMsg += `- Username: @${cleanHTML(reporter.username)}\n\n`;

            adminMsg += `👹 <b>TERLAPOR (TARGET):</b>\n`;
            adminMsg += `- ID: <code>${targetId}</code>\n`;
            adminMsg += `- Nama: ${cleanHTML(target.first_name)}\n`;
            adminMsg += `- Username: @${cleanHTML(target.username)}\n\n`;

            adminMsg += `⚠️ <b>KASUS:</b> ${reasonStr}\n`;

            const adminOptions = {
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "🔨 BANNED AKUN",
                                callback_data: `adm_ban_${targetId}`,
                            },
                            {
                                text: "❌ Hapus Akun",
                                callback_data: `adm_del_${targetId}`,
                            },
                        ],
                        [
                            {
                                text: "📉 Matikan Premium",
                                callback_data: `adm_revoke_${targetId}`,
                            },
                        ],
                    ],
                },
            };

            bot.sendMessage(ownerId, adminMsg, adminOptions).catch((err) => {
                console.error(
                    "❌ Gagal mengirim notifikasi laporan ke Owner:",
                    err.message,
                );
            });
        }
    }

    if (action.startsWith("adm_")) {
        if (chatId.toString() !== process.env.OWNER_ID.toString()) {
            return bot.answerCallbackQuery(query.id, {
                text: "❌ Anda bukan Owner!",
                show_alert: true,
            });
        }

        const dataParts = action.split("_");
        const cmd = dataParts[1];
        const targetId = dataParts[2];

        if (cmd === "ban") {
            await supabase
                .from("users")
                .update({ is_banned: true })
                .eq("telegram_id", targetId);
            bot.sendMessage(
                chatId,
                `✅ *EKSEKUSI SUKSES*\nUser ID \`${targetId}\` telah di-BANNED secara permanen.`,
                { parse_mode: "Markdown" },
            );
            bot.sendMessage(
                targetId,
                "🚫 *AKUN ANDA DIBLOKIR (BANNED)* 🚫\n\nAnda telah melanggar pedoman komunitas kami. Semua fitur dinonaktifkan.\n\n_Hubungi Owner jika Anda ingin mengajukan banding untuk melepaskan ban._",
                { parse_mode: "Markdown" },
            );
        } else if (cmd === "del") {
            await supabase.from("users").delete().eq("telegram_id", targetId);
            bot.sendMessage(
                chatId,
                `✅ *EKSEKUSI SUKSES*\nUser ID \`${targetId}\` beserta seluruh datanya telah DIHAPUS dari Database.`,
                { parse_mode: "Markdown" },
            );
        } else if (cmd === "revoke") {
            await supabase
                .from("users")
                .update({ premium_until: null })
                .eq("telegram_id", targetId);
            bot.sendMessage(
                chatId,
                `✅ *EKSEKUSI SUKSES*\nStatus Premium untuk User ID \`${targetId}\` telah DICABUT.`,
                { parse_mode: "Markdown" },
            );
        }

        bot.editMessageReplyMarkup(
            { inline_keyboard: [] },
            { chat_id: chatId, message_id: query.message.message_id },
        );
    }

    // ── REGION SET HANDLER ──────────────────────────────────────
    if (action.startsWith('region_set_')) {
        const regionCode = action.replace('region_set_', '');
        if (!REGION_INFO[regionCode]) return;

        await supabase.from('users').update({ region: regionCode }).eq('telegram_id', chatId);
        const { invalidateUserCache } = require('./supabase');
        invalidateUserCache(chatId);

        const regionInfo = REGION_INFO[regionCode];
        await bot.answerCallbackQuery(query.id, {
            text: `✅ Region set to ${regionInfo.flag} ${regionInfo.name}!`,
            show_alert: false,
        }).catch(() => { });

        // Lanjut ke step 2: pilih gender (edit pesan yang sama)
        return bot.editMessageText(
            `✅ ${regionInfo.flag} <b>REGION TERSIMPAN!</b>\n<code>━━━━━━━━━━━━━━━━━━━━</code>\n\n` +
            `📌 <b>Step 2/3 — Pilih Gender</b>\n\n` +
            `Pilih jenis kelaminmu agar matchmaking lebih akurat.\n` +
            `<i>(Bisa di-skip, tidak wajib)</i>`,
            {
                chat_id: chatId,
                message_id: query.message.message_id,
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: '👦 Laki-laki', callback_data: 'onb_gender_m' },
                            { text: '👧 Perempuan', callback_data: 'onb_gender_f' },
                        ],
                        [{ text: '⏭️ Skip Gender', callback_data: 'onb_skip_gender' }],
                    ],
                },
            }
        ).catch(() => { });
    }

    if (action === 'region_skip') {
        // User skip → set region ke nilai khusus 'SKIPPED' agar tidak ditanya lagi
        // Atau bisa kita biarkan null tapi tandai via flag lain
        // Solusi: gunakan kolom region dengan nilai khusus 'GLOBAL' untuk skip
        await supabase.from('users').update({ region: 'GLOBAL' }).eq('telegram_id', chatId);
        const { invalidateUserCache } = require('./supabase');
        invalidateUserCache(chatId);

        await bot.answerCallbackQuery(query.id, {
            text: '⏭️ Skipped! You\'ll be matched randomly.',
            show_alert: false,
        }).catch(() => { });

        return bot.editMessageText(
            `⏭️ <b>REGION DILEWATI</b> — 🌍 Global Mode\n<code>━━━━━━━━━━━━━━━━━━━━</code>\n\n` +
            `📌 <b>Step 2/3 — Pilih Gender</b>\n\n` +
            `Pilih jenis kelaminmu agar matchmaking lebih akurat.\n` +
            `<i>(Bisa di-skip, tidak wajib)</i>`,
            {
                chat_id: chatId,
                message_id: query.message.message_id,
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: '👦 Laki-laki', callback_data: 'onb_gender_m' },
                            { text: '👧 Perempuan', callback_data: 'onb_gender_f' },
                        ],
                        [{ text: '⏭️ Skip Gender', callback_data: 'onb_skip_gender' }],
                    ],
                },
            }
        ).catch(() => { });
    }

    // ── ONBOARDING: Gender + Age steps ───────────────────────────────
    if (action === 'onb_gender_m' || action === 'onb_gender_f') {
        const gender = action === 'onb_gender_m' ? 'M' : 'F';
        await supabase.from('users').update({ gender }).eq('telegram_id', chatId);
        require('./supabase').invalidateUserCache(chatId);
        bot.answerCallbackQuery(query.id, { text: `✅ Gender tersimpan! ${gender === 'M' ? '👦' : '👧'}`, show_alert: false }).catch(() => { });
        ageRegistrationMode.set(chatId, 'register');
        return bot.editMessageText(
            `✅ <b>GENDER TERSIMPAN!</b> ${gender === 'M' ? '👦' : '👧'}\n<code>━━━━━━━━━━━━━━━━━━━━</code>\n\n` +
            `📌 <b>Step 3/3 — Masukkan Usia</b>\n\n` +
            `Ketik usiamu di chat (contoh: <b>18</b> atau <b>25</b>)\n\n` +
            `<i>Tekan Skip untuk langsung cari partner:</i>`,
            {
                chat_id: chatId,
                message_id: query.message.message_id,
                parse_mode: 'HTML',
                reply_markup: { inline_keyboard: [[{ text: '⏭️ Skip Usia — Langsung Cari Partner!', callback_data: 'onb_skip_age' }]] },
            }
        ).catch(() => { });
    }

    if (action === 'onb_skip_gender') {
        bot.answerCallbackQuery(query.id, { text: '⏭️ Gender dilewati', show_alert: false }).catch(() => { });
        ageRegistrationMode.set(chatId, 'register');
        return bot.editMessageText(
            `⏭️ <b>GENDER DILEWATI</b>\n<code>━━━━━━━━━━━━━━━━━━━━</code>\n\n` +
            `📌 <b>Step 3/3 — Masukkan Usia</b>\n\n` +
            `Ketik usiamu di chat (contoh: <b>18</b> atau <b>25</b>)\n\n` +
            `<i>Tekan Skip untuk langsung cari partner:</i>`,
            {
                chat_id: chatId,
                message_id: query.message.message_id,
                parse_mode: 'HTML',
                reply_markup: { inline_keyboard: [[{ text: '⏭️ Skip Usia — Langsung Cari Partner!', callback_data: 'onb_skip_age' }]] },
            }
        ).catch(() => { });
    }



    if (action === 'onb_skip_age') {
        // 1. Matikan mode pendaftaran usia
        ageRegistrationMode.delete(chatId);
        bot.answerCallbackQuery(query.id, { text: '🎉 Setup selesai! Memulai pencarian...', show_alert: false }).catch(() => { });

        // 2. Pesan selesai setup
        const skipCongratsText =
            `🎉 <b>SETUP SELESAI!</b> 🎉\n<code>━━━━━━━━━━━━━━━━━━━━</code>\n\n` +
            `✅ <b>Profil berhasil dibuat!</b>\n\n` +
            `🚀 Memulai pencarian partner sekarang...`;

        // 3. Edit pesan onboarding → dipakai ulang sebagai pesan SEARCHING
        // (startSearch akan meng-edit pesan yang sama, jadi tidak ada pesan baru).
        const onboardMsgId = query.message ? query.message.message_id : null;
        await safeEdit(chatId, onboardMsgId, skipCongratsText, { parse_mode: 'HTML' });

        // 4. Langsung lemparkan ke radar pencarian
        return startSearch(chatId, 'search_random', null, onboardMsgId);
    }

    if (action === 'region_menu') {
        // Buka dari profile settings
        bot.answerCallbackQuery(query.id).catch(() => { });
        bot.deleteMessage(chatId, query.message.message_id).catch(() => { });
        return sendRegionSetup(chatId, false);
    }
});

bot.onText(/\/stop/, async (msg) => {
    const chatId = msg.chat.id;
    if (await checkBan(chatId)) return;

    // Cegah /stop dan /next berjalan bersamaan (penyebab notifikasi dobel).
    if (!(await acquireLock('action', chatId))) return;

    try {
        if (activeChats.has(chatId)) {
            const partnerId = activeChats.get(chatId);
            await endChatAndSendFeedback(chatId, partnerId, false);
        } else {
            const wasSearching = isSearchActive(chatId);
            const wasInQueue = wasSearching || await isInQueue(chatId) || await isInRegionQueue(chatId);

            if (wasInQueue) {
                // Hentikan animasi pencarian, hapus pesan searching, bersihkan antrean
                await cancelSearch(chatId);

            let stopText = `🛑 <b>RADAR DIMATIKAN</b> 🛑\n`;
            stopText += `━━━━━━━━━━━━━━━━━━━━\n\n`;
            stopText += `📡 <i>Sistem matchmaking telah dihentikan sementara.</i>\n\n`;
            stopText += `Mungkin kamu butuh rehat sejenak, atau sekadar ingin mengatur napas dan menyiapkan topik obrolan yang lebih seru sebelum kembali menyelami lautan anonim kita? 🌊\n\n`;
            stopText += `Tenang saja! Ribuan teman ngobrol seru di luar sana masih setia menunggu kehadiranmu. Kalau kamu sudah siap kembali berpetualang, radar kami selalu aktif 24 jam non-stop untuk mencarikan partner terbaik. ⚡️\n\n`;
            stopText += `<i>Pilih langkahmu selanjutnya melalui tombol di bawah ini:</i>`;

            const stopOptions = {
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "🚀 Lanjut Cari Teman (Next)",
                                callback_data: "search_random",
                            },
                        ],
                        [
                            {
                                text: "🏠 Buka Menu Utama",
                                callback_data: "back_to_main",
                            },
                        ],
                    ],
                },
            };

            await pushStatus(chatId, stopText, stopOptions);
        } else {
            await pushStatus(chatId, "❌ Anda tidak sedang dalam sesi chat. Silakan mulai /search atau /next untuk mencari partner.", { parse_mode: "HTML" });
        }
        }
    } finally {
        await releaseLock('action', chatId);
    }
});

async function sendSettingsPage(chatId) {
    if (await checkBan(chatId)) return;

    const user = await getUser(chatId);
    if (!user) {
        return bot.sendMessage(chatId, "❌ Profil tidak ditemukan. Ketik /start untuk mendaftar.", { parse_mode: "HTML" });
    }

    const statusPrem = isPremium(user) ? "🌟 PREMIUM" : "⚪ REGULER";
    const premTime = getPremiumTimeLeft(user);
    const displayGender = user.gender === "M" ? "Laki-laki 👦" : user.gender === "F" ? "Perempuan 👧" : "Belum diatur ❓";
    const displayUsername = user.username && user.username !== "Anonim" ? `@${user.username}` : "<i>Tidak disetel</i>";
    const displayAge = user.age ? `${user.age} Tahun` : "<i>Belum diatur ❓</i>";
    const displayRegion = user.region ? (user.region === 'GLOBAL' ? '🌍 Global (Random Match)' : getRegionDisplay(user.region)) : '<i>Belum diatur (random global)</i>';

    const userRating = user.rating || 0;
    let ratingDisplay = `📊 <b>Reputasi (Rating):</b> ${userRating > 0 ? "+" : ""}${userRating} Poin\n`;
    if (userRating < 0) {
        ratingDisplay += `\n🚨 <b>WARNING: RATING ANDA SANGAT BURUK!</b> 🚨\n`;
    } else if (userRating >= 10) {
        ratingDisplay += `<i>✨ Mantap! Anda memiliki reputasi yang sangat baik di komunitas ini.</i>\n\n`;
    }

    let info = `🪪 <b>KARTU INFORMASI PRIBADI</b> 🪪\n━━━━━━━━━━━━━━━━━━━━\n\n`;
    info += `💠 <b>ID Telegram:</b> <tg-spoiler>${chatId}</tg-spoiler> <i>(Klik untuk melihat)</i>\n`;
    info += `👤 <b>Nama Panggilan:</b> ${user.first_name}\n`;
    info += `🔗 <b>Username:</b> ${displayUsername}\n`;
    info += `🚻 <b>Jenis Kelamin:</b> ${displayGender}\n`;
    info += `🎂 <b>Usia:</b> ${displayAge}\n`;
    info += `🌍 <b>Region:</b> ${displayRegion}\n\n`;
    info += ratingDisplay;
    info += `💰 <b>Sisa Token:</b> 🪙 ${user.tokens}\n`;
    info += `💎 <b>Status Akun:</b> ${statusPrem}\n`;
    info += `⏳ <b>Masa Aktif:</b> ${premTime}\n\n`;
    info += `━━━━━━━━━━━━━━━━━━━━\n`;
    info += `<i>🌍 <b>INFO REGION:</b> Jika Anda mengatur region, Anda akan dicocokkan dengan orang yang berasal dari region yang sama. Bahasa sistem adalah pengaturan terpisah.</i>\n\n`;
    info += `<i>Jaga kerahasiaan ID Telegram Anda dari orang yang tidak dikenal!</i>`;

    const Lp = getLang(chatId);
    const currentLangName = LANGS[userLang.get(chatId) || "id"].name;

    return bot.sendMessage(chatId, info, {
        parse_mode: "HTML",
        reply_markup: {
            inline_keyboard: [
                [
                    { text: Lp.btn_change_gender || "🚻 Ubah Gender", callback_data: "set_gender" },
                    { text: "🎂 Ubah Usia", callback_data: "set_age_manual" },
                ],
                [
                    { text: `🌍 Set Region (${user.region ? getRegionDisplay(user.region) : 'Not Set'})`, callback_data: "region_menu" },
                ],
                [
                    { text: `${Lp.btn_change_lang || "🌐 Bahasa Sistem"} (${currentLangName})`, callback_data: "lang_menu" },
                ],
                [
                    { text: "❌ Tutup Menu", callback_data: "close_info_msg" },
                ],
            ]
        }
    });
}

bot.onText(/\/settings/, async (msg) => {
    sendSettingsPage(msg.chat.id);
});

// --- COMMAND /STOP (TEKS) ---
// bot.onText(/\/stop2/, async (msg) => {
//     const chatId = msg.chat.id;
//     if (await checkBan(chatId)) return;

//     if (activeChats.has(chatId)) {
//         const partnerId = activeChats.get(chatId);
//         endChatAndSendFeedback(chatId, partnerId, false);
//     } else {

//         waitingList.general = waitingList.general.filter(u => u.id !== chatId);
//         waitingList.male = waitingList.male.filter(id => id !== chatId);
//         waitingList.female = waitingList.female.filter(id => id !== chatId);

//         bot.sendMessage(chatId, '✅ Pencarian dibatalkan.\n\n_Ketik /search untuk mencari teman lagi atau /start untuk kembali ke Menu Utama._', { parse_mode: 'Markdown' });
//     }
// });

bot.onText(/\/server/, async (msg) => {
    const chatId = msg.chat.id;
    if (await checkBan(chatId)) return;

    const isOwner = chatId.toString() === process.env.OWNER_ID.toString();

    const loadingMsg = await bot.sendMessage(
        chatId,
        `📡 <b>MENGINISIALISASI DIAGNOSTIK ULTRA...</b>\n${progressBar(0)}\n\n<i>Membangun koneksi ke core server...</i>`,
        { parse_mode: "HTML" },
    );

    const msgId = loadingMsg.message_id;

    const frames = [
        {
            text: `📡 <b>MENGECEK CORE SERVER...</b>\n${progressBar(10)}\n\n<i>Membaca uptime dan load average...</i>`,
        },
        {
            text: `⚙️ <b>MEMINDAI PROSESOR (CPU)...</b>\n${progressBar(20)}\n\n<i>Mengidentifikasi thread dan arsitektur...</i>`,
        },
        {
            text: `🧠 <b>MEMERIKSA MEMORI & HEAP...</b>\n${progressBar(30)}\n\n<i>Menghitung RAM dan penggunaan Node.js...</i>`,
        },
        {
            text: `🗄️ <b>MEMERIKSA STORAGE & DISK...</b>\n${progressBar(40)}\n\n<i>Mengambil kapasitas disk dan ruang kosong...</i>`,
        },
        {
            text: `🌀 <b>MENGANALISIS SWAP MEMORY...</b>\n${progressBar(50)}\n\n<i>Memeriksa paging dan virtual memory...</i>`,
        },
        {
            text: `🌐 <b>MEMERIKSA JARINGAN & IP...</b>\n${progressBar(60)}\n\n<i>Memindai interface jaringan aktif...</i>`,
        },
        {
            text: `🌍 <b>MENGUJI LATENSI INTERNET...</b>\n${progressBar(70)}\n\n<i>Mengirim ICMP Echo ke DNS Publik...</i>`,
        },
        {
            text: `🔌 <b>MEMVERIFIKASI DATABASE...</b>\n${progressBar(80)}\n\n<i>Melakukan ping query ke Supabase...</i>`,
        },
        {
            text: `💸 <b>MEMERIKSA PAYMENT GATEWAYS...</b>\n${progressBar(90)}\n\n<i>Validasi API Midtrans, Saweria & XTR...</i>`,
        },
        {
            text: `✅ <b>MENYUSUN LAPORAN ULTRA...</b>\n${progressBar(100)}\n\n<i>Menyiapkan ringkasan eksekutif...</i>`,
        },
    ];

    for (const frame of frames) {
        await bot
            .editMessageText(frame.text, {
                chat_id: chatId,
                message_id: msgId,
                parse_mode: "HTML",
            })
            .catch(() => { });
        await new Promise((res) => setTimeout(res, 600));
    }

    const appUptime = formatUptime(process.uptime());
    const sysUptime = formatUptime(os.uptime());

    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memPercent =
        totalMem > 0 ? Math.round((usedMem / totalMem) * 100) : 0;

    const nodeMem = process.memoryUsage();
    const rss = nodeMem.rss;
    const heapTotal = nodeMem.heapTotal;
    const heapUsed = nodeMem.heapUsed;
    const external = nodeMem.external;
    const arrayBuffers = nodeMem.arrayBuffers || 0;

    const cpus = os.cpus();
    const cpuModel = cpus?.[0]?.model?.trim() || "Unknown CPU";
    const cpuCores = cpus?.length || 0;
    const cpuLoadAvg = os.loadavg();
    const cpuLoad1m = cpuLoadAvg[0].toFixed(2);
    const cpuLoad5m = cpuLoadAvg[1].toFixed(2);
    const cpuLoad15m = cpuLoadAvg[2].toFixed(2);

    const diskInfo = getDiskInfo("/");
    const swapInfo = getSwapInfo();
    const netInfo = getNetworkInfo();
    const serverPing = getServerPing();

    const dbStart = Date.now();
    let dbError = null;
    try {
        await supabase.from("users").select("telegram_id").limit(1);
    } catch (err) {
        dbError = err;
    }
    const dbPing = Date.now() - dbStart;
    const dbStatus = dbError ? "❌ DISCONNECTED" : `✅ CONNECTED (${dbPing}ms)`;

    const platform = os.type();
    const release = os.release();
    const arch = os.arch();
    const hostname = os.hostname();
    const nodeVersion = process.version;
    const v8Version = process.versions.v8;
    const processId = process.pid;
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const midtransMode =
        process.env.MIDTRANS_IS_PRODUCTION === "true"
            ? "PRODUCTION"
            : "SANDBOX";
    const qrisActive = process.env.MIDTRANS_SERVER_KEY
        ? "✅ ACTIVE"
        : "⚠️ MISSING KEY";
    const saweriaActive = "✅ LISTENING (Webhook)";
    const telegramActive = process.env.TELEGRAM_TOKEN
        ? "✅ ACTIVE (Native API)"
        : "❌ ERROR";

    const diskText = diskInfo
        ? `💽 <b>Root:</b> ${formatBytes(diskInfo.used)} / ${formatBytes(diskInfo.total)} (${diskInfo.percent})\n` +
        `📁 <b>Free:</b> ${formatBytes(diskInfo.free)} | <b>FS:</b> ${diskInfo.filesystem}`
        : `💽 <b>Storage:</b> Tidak terbaca`;

    const swapText = swapInfo
        ? `🌀 <b>Swap:</b> ${formatBytes(swapInfo.used)} / ${formatBytes(swapInfo.total)}`
        : `🌀 <b>Swap:</b> Tidak tersedia`;

    const netText = netInfo.length
        ? netInfo
            .map(
                (n, idx) =>
                    `🌍 <b>ETH${idx}:</b> ${n.address} (MAC: ${n.mac})`,
            )
            .join("\n")
        : `🌍 <b>Network:</b> Tidak ada interface publik aktif`;

    let finalReport = "";

    if (isOwner) {
        finalReport =
            `👑 <b>ULTIMATE OWNER DIAGNOSTICS</b> 👑\n` +
            `━━━━━━━━━━━━━━━━━━━━\n\n` +
            `<b>[ 🕒 TIME & UPTIME ]</b>\n` +
            `🤖 <b>Bot Uptime:</b> ${appUptime}\n` +
            `💻 <b>Server Uptime:</b> ${sysUptime}\n` +
            `🌍 <b>Timezone:</b> ${timeZone}\n\n` +
            `<b>[ 🖥️ CPU & PROCESSING ]</b>\n` +
            `⚙️ <b>Model:</b> ${cpuModel}\n` +
            `🔩 <b>Cores:</b> ${cpuCores} Threads (${arch})\n` +
            `📈 <b>Load (1m/5m/15m):</b> ${cpuLoad1m} | ${cpuLoad5m} | ${cpuLoad15m}\n\n` +
            `<b>[ 🧠 RAM & MEMORY HEAP ]</b>\n` +
            `📊 <b>System RAM:</b> ${formatBytes(usedMem)} / ${formatBytes(totalMem)} (${memPercent}%)\n` +
            `📦 <b>Node RSS:</b> ${formatBytes(rss)}\n` +
            `🧪 <b>V8 Heap:</b> ${formatBytes(heapUsed)} / ${formatBytes(heapTotal)}\n` +
            `🔌 <b>Ext/Buffers:</b> ${formatBytes(external)} / ${formatBytes(arrayBuffers)}\n` +
            `${swapText}\n\n` +
            `<b>[ 💽 STORAGE & NETWORK ]</b>\n` +
            `${diskText}\n` +
            `📡 <b>Ping to Internet:</b> ${serverPing}\n` +
            `${netText}\n\n` +
            `<b>[ 🗄️ CONNECTIONS & GATEWAYS ]</b>\n` +
            `🐘 <b>Supabase DB:</b> ${dbStatus}\n` +
            `💳 <b>Midtrans (${midtransMode}):</b> ${qrisActive}\n` +
            `💎 <b>Saweria:</b> ${saweriaActive}\n` +
            `⭐️ <b>Telegram Stars:</b> ${telegramActive}\n\n` +
            `<b>[ 🧩 KERNEL & ENVIRONMENT ]</b>\n` +
            `🐧 <b>OS:</b> ${platform} ${release}\n` +
            `🆔 <b>Hostname/PID:</b> ${hostname} (PID: ${processId})\n` +
            `🟢 <b>Node/V8:</b> ${nodeVersion} / v${v8Version}\n\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `<i>Sistem termonitor dengan visibilitas 100%, Boss Raihan! 🚀</i>`;
    } else {
        const dbShort = dbError ? "❌ GANGGUAN" : "✅ STABIL";
        finalReport =
            `🌐 <b>SYSTEM DIAGNOSTICS REPORT</b> 🌐\n` +
            `━━━━━━━━━━━━━━━━━━━━\n\n` +
            `🟢 <b>Status Server:</b> ONLINE & OPTIMAL\n` +
            `⏱️ <b>Bot Uptime:</b> ${appUptime}\n` +
            `💾 <b>Koneksi Database:</b> ${dbShort}\n` +
            `📡 <b>Ping Internet:</b> ${serverPing}\n` +
            `🧠 <b>Beban Memori:</b> ${memPercent}%\n` +
            `📈 <b>Beban CPU:</b> ${cpuLoad1m} (Normal)\n\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `<i>Semua sistem beroperasi normal.</i>\n` +
            `<i>(Mode User: Visibilitas dibatasi untuk keamanan server).</i>`;
    }

    await bot
        .editMessageText(finalReport, {
            chat_id: chatId,
            message_id: msgId,
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "🔙 Tutup Laporan",
                            callback_data: "close_info_msg",
                        },
                    ],
                ],
            },
        })
        .catch(() => { });
});

bot.onText(/^\/(sendkoin|kirimkoin)/, async (msg) => {
    return openAtmMenu(msg.chat.id);
});



// /botol and /buybotol commands removed

// old pay command removed

bot.onText(/\/start(?:\s+(.+))?/, async (msg) => {
    const chatId = msg.chat.id;

    // Anti dobel: /start yang datang dua kali (double tap, dua proses, atau
    // proses lama yang masih jalan) hanya diproses SEKALI.
    if (!(await acquireLock('start', chatId, 15000))) return;

    try {
    const user = await getUser(chatId, msg);

    if (user.is_banned) {
        return bot.sendMessage(
            chatId,
            "🚫 <b>AKUN ANDA DIBLOKIR (BANNED)</b> 🚫\n\nAnda telah melanggar pedoman komunitas kami. Semua fitur dinonaktifkan.\n\n<i>Hubungi Owner jika Anda ingin mengajukan banding.</i>",
            { parse_mode: "HTML" },
        );
    }

    // User baru yang belum set region
    if (!user.region) {
        bot.sendMessage(chatId,
            `👋 <b>Halo, ${user.first_name}!</b> 🎉\n\nSelamat datang di <b>Anonymous Chat Expert</b>!\n<i>Setup profil singkat — semua langkah bisa di-skip!</i>`,
            { parse_mode: 'HTML', reply_markup: getMainKeyboard() }
        ).catch(() => { });
        return sendRegionSetup(chatId, true);
    }

    // Sudah punya sesi aktif → jangan mulai pencarian baru / kirim welcome lagi.
    if (activeChats.has(chatId)) {
        // Pakai pushStatus: kalau ada pesan status sebelumnya, di-EDIT
        // (tidak menambah pesan baru di chat).
        return pushStatus(
            chatId,
            "💬 <b>Kamu sedang dalam obrolan.</b>\n\nKetik /stop untuk mengakhiri, atau /next untuk mencari partner baru.",
            { parse_mode: 'HTML', reply_markup: getChatKeyboard() },
        );
    }

    // Sudah di radar → jangan kirim welcome + SEARCHING baru (ini yang bikin dobel).
    if (await isSearchActiveAnywhere(chatId)) {
        // Notifikasi status maksimal 1x per menit walau /start terkirim berulang
        const lastNotice = lastNoChatNotice.get(chatId) || 0;
        if (Date.now() - lastNotice < 60000) return;
        lastNoChatNotice.set(chatId, Date.now());
        return pushStatus(
            chatId,
            "⏳ <i>Kamu masih dalam pencarian partner. Tunggu sebentar ya...</i>\n\nKetik /stop untuk membatalkan.",
            { parse_mode: 'HTML', reply_markup: getMainKeyboard() },
        );
    }

    // Returning user
    const welcomeMsg =
        `⚡ <b>SYSTEM ONLINE: Selamat datang kembali, ${user.first_name}!</b> 👋\n` +
        `<code>━━━━━━━━━━━━━━━━━━━━━━</code>\n` +
        `<i>Koneksi ke Anonymous telah dipulihkan. Bersiaplah untuk menjelajahi jaringan global tanpa batas.</i>\n\n` +
        `📡 <b>Pencarian partner akan dimulai secara otomatis...</b>\n\n` +
        `🕹️ <b>[ COMMAND CENTER ]</b>\n` +
        `▪️ <b>🔍 Find Friend</b> : Tekan tombol di keyboard untuk mengulang radar pencarian.\n` +
        `▪️ <b>/menu</b> : Mengakses dashboard utama dan seluruh fitur bot.\n` +
        `▪️ <b>/rules</b> : Membaca pedoman dan aturan komunitas.\n\n` +
        `<i>"Keep your identity safe, respect your partner, and enjoy the conversation!"</i>`;

    // Pesan welcome ini dipakai sebagai SATU-SATUNYA pesan status:
    // di-edit jadi SEARCHING → WAITING → PARTNER FOUND, jadi chat tidak penuh.
    const welcomeMessage = await bot.sendMessage(chatId, welcomeMsg, {
        parse_mode: 'HTML',
        reply_markup: getMainKeyboard()
    }).catch(() => null);

    // Welcome ini langsung dipakai ulang (di-edit) sebagai pesan SEARCHING
    if (welcomeMessage) rememberStatusMsg(chatId, welcomeMessage.message_id);

    await startSearch(chatId, 'search_random', null, welcomeMessage ? welcomeMessage.message_id : null);
    } finally {
        await releaseLock('start', chatId);
    }
});

bot.onText(/\/menu/, async (msg) => {
    const chatId = msg.chat.id;
    if (await checkBan(chatId)) return;
    return sendMainMenu(chatId, null, null);
});




bot.onText(/\/reaction/, async (msg) => {
    const chatId = msg.chat.id;
    if (await checkBan(chatId)) return;

    const pid = activeChats.get(chatId);
    if (!pid) {
        return bot.sendMessage(
            chatId,
            "❌ <b>Kamu tidak sedang dalam obrolan!</b>\n\n<i>Ketik /search atau tekan tombol Cari Teman di Menu Utama terlebih dahulu.</i>",
            { parse_mode: "HTML" },
        );
    }

    const inlineKeyboard = [];
    for (let i = 0; i < REACTIONS.length; i += 4) {
        const row = REACTIONS.slice(i, i + 4).map((r) => ({
            text: r,
            callback_data: `react_send_${r}`,
        }));
        inlineKeyboard.push(row);
    }
    inlineKeyboard.push([{ text: "❌ Batal", callback_data: "react_cancel" }]);

    const reactText = `🎭 <b>KIRIM REAKSI KE PARTNER</b> 🎭\n━━━━━━━━━━━━━━━━━━━━\n\nEkspresikan perasaanmu tanpa kata-kata! Pilih reaksi yang paling pas untuk pesan partner-mu di bawah ini:`;

    bot.sendMessage(chatId, reactText, {
        parse_mode: "HTML",
        reply_markup: { inline_keyboard: inlineKeyboard },
    });
});

const cleanHTML = (str) => {
    if (!str) return "-";
    return str
        .toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
};

bot.onText(/\/ban (\d+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    if (chatId.toString() !== process.env.OWNER_ID.toString()) return; // Satpam Owner

    const targetId = match[1];
    const target = await getUser(targetId);

    if (!target) {
        return bot.sendMessage(
            chatId,
            `❌ User dengan ID <code>${targetId}</code> tidak ditemukan di database.`,
            { parse_mode: "HTML" },
        );
    }

    await supabase
        .from("users")
        .update({ is_banned: true })
        .eq("telegram_id", targetId);

    let adminMsg = `🔨 <b>EKSEKUSI BANNED SUKSES</b> 🔨\n\n`;
    adminMsg += `Data pengguna yang diblokir:\n`;
    adminMsg += `💠 <b>ID:</b> <code>${targetId}</code>\n`;
    adminMsg += `👤 <b>Nama:</b> ${cleanHTML(target.first_name)}\n`;
    adminMsg += `🔗 <b>Username:</b> @${cleanHTML(target.username)}\n\n`;
    adminMsg += `<i>Akses pengguna ini ke bot telah diputus secara permanen.</i>`;

    bot.sendMessage(chatId, adminMsg, { parse_mode: "HTML" });

    bot.sendMessage(
        targetId,
        "🚫 <b>AKUN ANDA DIBLOKIR (BANNED)</b> 🚫\n\nAnda telah melanggar pedoman komunitas kami. Semua fitur dinonaktifkan.\n\n<i>Hubungi Owner jika Anda ingin mengajukan banding untuk melepaskan ban.</i>",
        { parse_mode: "HTML" },
    ).catch(() => { });
});

bot.onText(/\/unban (\d+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    if (chatId.toString() !== process.env.OWNER_ID.toString()) return;

    const targetId = match[1];
    const target = await getUser(targetId);

    if (!target) {
        return bot.sendMessage(
            chatId,
            `❌ User dengan ID <code>${targetId}</code> tidak ditemukan di database.`,
            { parse_mode: "HTML" },
        );
    }

    await supabase
        .from("users")
        .update({ is_banned: false })
        .eq("telegram_id", targetId);

    let adminMsg = `✅ <b>EKSEKUSI UNBAN SUKSES</b> ✅\n\n`;
    adminMsg += `Data pengguna yang dipulihkan:\n`;
    adminMsg += `💠 <b>ID:</b> <code>${targetId}</code>\n`;
    adminMsg += `👤 <b>Nama:</b> ${cleanHTML(target.first_name)}\n`;
    adminMsg += `🔗 <b>Username:</b> @${cleanHTML(target.username)}\n\n`;
    adminMsg += `<i>Pengguna ini sekarang dapat menggunakan bot kembali.</i>`;

    bot.sendMessage(chatId, adminMsg, { parse_mode: "HTML" });

    bot.sendMessage(
        targetId,
        "✅ <b>AKUN DIPULIHKAN</b> ✅\n\nStatus Banned Anda telah dicabut oleh Owner. Silakan ketik /start untuk kembali ke Menu Utama dan mulai mencari teman!",
        { parse_mode: "HTML" },
    ).catch(() => { });
});

bot.onText(/\/unprem (\d+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    if (chatId.toString() !== process.env.OWNER_ID.toString()) return;

    const targetId = match[1];
    const target = await getUser(targetId);

    if (!target) {
        return bot.sendMessage(
            chatId,
            `❌ User dengan ID <code>${targetId}</code> tidak ditemukan di database.`,
            { parse_mode: "HTML" },
        );
    }
    await supabase
        .from("users")
        .update({ premium_until: null })
        .eq("telegram_id", targetId);

    let adminMsg = `📉 <b>CABUT PREMIUM SUKSES</b> 📉\n\n`;
    adminMsg += `Data pengguna yang diturunkan statusnya:\n`;
    adminMsg += `💠 <b>ID:</b> <code>${targetId}</code>\n`;
    adminMsg += `👤 <b>Nama:</b> ${cleanHTML(target.first_name)}\n`;
    adminMsg += `🔗 <b>Username:</b> @${cleanHTML(target.username)}\n\n`;
    adminMsg += `<i>Status VIP/Premium pengguna ini telah dinonaktifkan dan kembali menjadi Reguler.</i>`;

    bot.sendMessage(chatId, adminMsg, { parse_mode: "HTML" });

    bot.sendMessage(
        targetId,
        "📉 <b>STATUS PREMIUM BERAKHIR</b> 📉\n\nMasa aktif Premium/VIP Anda telah dicabut oleh sistem atau Owner. Anda sekarang kembali menjadi pengguna Reguler.\n\n<i>Ketik /vip untuk melihat paket berlangganan kembali.</i>",
        { parse_mode: "HTML" },
    ).catch(() => { });
});

bot.on("pre_checkout_query", (query) => {
    bot.answerPreCheckoutQuery(query.id, true).catch((err) => {
        console.error("[PRE_CHECKOUT] Gagal menjawab pre_checkout_query:", err);
    });
});

bot.on("successful_payment", async (msg) => {
    const chatId = msg.chat.id;
    const paymentInfo = msg.successful_payment;

    const payload = paymentInfo.invoice_payload;
    const providerChargeId = paymentInfo.provider_payment_charge_id;

    console.log(
        `⭐️ [STARS PAYMENT] Masuk sebesar ${paymentInfo.total_amount} ${paymentInfo.currency} dari ID: ${chatId} Payload: ${payload}`
    );

    // ── Anti dobel-proses: satu charge id hanya diproses sekali ──
    // (mis. event terkirim ulang setelah restart) supaya premium tidak dobel.
    try {
        const firstTime = await redis.set(`paid:${providerChargeId}`, '1', { NX: true, EX: 60 * 60 * 24 * 30 });
        if (firstTime === null) {
            console.log('[STARS PAYMENT] ⚠️ Charge id duplikat, dilewati:', providerChargeId);
            return;
        }
    } catch (e) {
        // Redis error → tetap proses pembayaran (jangan sampai user rugi)
        console.error('[STARS PAYMENT] Dedupe check error:', e.message);
    }

    if (paymentInfo.currency === "XTR" && payload.startsWith("prem_stars_")) {
        try {
            const parts = payload.split("_");
            const days = parseInt(parts[2]);

            const currentUser = await getUser(chatId);
            const newUntil = isPremium(currentUser)
                ? moment(currentUser.premium_until).add(days, "days")
                : moment().add(days, "days");

            await supabase
                .from("users")
                .update({ premium_until: newUntil.toDate() })
                .eq("telegram_id", chatId);

            require('./supabase').invalidateUserCache(chatId);

            const userData = await getUser(chatId);
            const usernameStr = userData.username ? `@${userData.username}` : "<i>Tidak disetel</i>";
            const dateStr = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });
            const trxId = `SUB-${Date.now().toString().slice(-6)}-${chatId.toString().slice(-3)}`;

            let planName = PREMIUM_PLANS[days] ? PREMIUM_PLANS[days].name : `${days} Hari`;

            const userReceipt =
                `✅ <b>PEMBAYARAN PREMIUM BERHASIL</b> ✅\n` +
                `━━━━━━━━━━━━━━━━━━━━━━\n\n` +
                `Terima kasih! Transaksi Telegram Stars kamu telah berhasil diproses secara instan oleh sistem.\n\n` +
                `🧾 <b>OFFICIAL DIGITAL RECEIPT (PRIVATE)</b>\n` +
                `🆔 <b>ID Transaksi:</b> <code>${trxId}</code>\n` +
                `📆 <b>Tanggal:</b> ${dateStr} WIB\n` +
                `👤 <b>Akun ID:</b> <code>${chatId}</code>\n` +
                `📦 <b>Paket Langganan:</b> ${planName}\n` +
                `⭐ <b>Stars Dibayar:</b> ${paymentInfo.total_amount} ⭐️\n\n` +
                `⏳ <b>Masa Aktif Fitur Hingga:</b>\n<b>${newUntil.format("DD MMM YYYY, HH:mm")} WIB</b>\n\n` +
                `━━━━━━━━━━━━━━━━━━━━━━\n` +
                `<i>Semua fitur eksklusifmu sudah aktif. Selamat menikmati privilese Premium/VIP! 🚀</i>\n\n` +
                `👉 <i>Ketik /start untuk memuat ulang profil.</i>`;

            bot.sendMessage(chatId, userReceipt, { parse_mode: "HTML" }).catch(() => { });

            const ownerId = process.env.OWNER_ID;
            if (ownerId && chatId.toString() !== ownerId.toString()) {
                const ownerSuccessMsg =
                    `💸 <b>[PREMIUM/VIP PURCHASE DETECTED]</b> 💸\n` +
                    `━━━━━━━━━━━━━━━━━━━━\n\n` +
                    `✅ <b>Status:</b> 🟢 STARS RECEIVED\n\n` +
                    `💠 <b>User ID:</b> <code>${chatId}</code>\n` +
                    `👤 <b>Nama:</b> ${userData.first_name}\n` +
                    `🔗 <b>Username:</b> ${usernameStr}\n` +
                    `⭐ <b>Stars Masuk:</b> +${paymentInfo.total_amount} ⭐️\n` +
                    `📦 <b>Paket Langganan:</b> ${planName}\n` +
                    `💳 <b>Charge ID:</b> <code>${providerChargeId}</code>\n\n` +
                    `📈 <b>System Log:</b> Premium user berhasil diupdate otomatis.\n` +
                    `━━━━━━━━━━━━━━━━━━━━\n` +
                    `<i>Ka-ching! Sultan dapat cuan Stars langsung dari Telegram! Lanjutkan Boss! 👑🔥</i>`;

                bot.sendMessage(ownerId, ownerSuccessMsg, { parse_mode: "HTML" }).catch(() => { });
            }

        } catch (error) {
            console.error("❌ Gagal update premium di Supabase setelah bayar Stars:", error);
            bot.sendMessage(
                chatId,
                "⚠️ <b>PEMBAYARAN DITERIMA TAPI GAGAL DISIMPAN</b>\n\nPembayaran Stars kamu sudah berhasil masuk, tapi sistem Database gagal mengupdate status Premium kamu. Harap segera <i>screenshot</i> pesan ini dan laporkan ke Admin/Owner untuk klaim manual.",
                { parse_mode: "HTML" }
            );
        }
    }
});

// --- COMMAND /VIP ---

async function sendVipMenu(chatId, messageIdToEdit = null) {
    if (await checkBan(chatId)) return;

    const user = await getUser(chatId);
    const L = getLang(chatId) || {};

    const title = L.prem_title || "💎 <b>UPGRADE KE PREMIUM ATAU VIP SULTAN</b> 💎";
    const desc = L.prem_desc || "🚀 <b>Jadilah Penguasa Komunitas!</b>\nBuka seluruh batasan dan nikmati fitur eksklusif berikut:\n\n" +
        "🎯 <b>Bebas Memilih Gender</b>: Cari partner spesifik pria atau wanita sesuai keinginanmu.\n" +
        "🕵️ <b>Akses Informasi Rahasia</b>: Mengintip identitas asli dan profil lengkap partner ngobrolmu tanpa batas!\n" +
        "🎖️ <b>Badge Eksklusif VIP</b>: Pamerkan lencana keren 👑 <b>[VIP SULTAN]</b> di sebelah namamu agar semua orang tahu status bergengsimu.\n" +
        "⚡ <b>Prioritas Matchmaking</b>: Menjadi prioritas di antrean perjodohan.\n\n" +
        "Jangan biarkan obrolanmu dibatasi. Jadilah member prioritas sekarang juga!";

    let activePremText = "";
    if (isPremium(user)) {
        activePremText = `\n✅ <b>Status:</b> Premium Aktif\n⏳ <b>Hingga:</b> ${getPremiumTimeLeft(user)}\n`;
    }

    const text = `${title}\n━━━━━━━━━━━━━━━━━━━━\n\n${desc}\n${activePremText}\n<i>Pilih paket langganan menggunakan Telegram Stars (⭐️) di bawah ini:</i>`;

    // Label tombol diambil dari bahasa user, tapi ANGKA HARGANYA selalu
    // disamakan dengan PREMIUM_PLANS supaya tidak ada tagihan yang beda.
    const planButton = (plan, fallback) => {
        const raw = L[`prem_btn_${plan.days}`] || fallback;
        return raw.replace(/\(\s*\d+\s*⭐\uFE0F?\s*\)/u, `(${plan.stars} ⭐️)`);
    };

    const options = {
        parse_mode: "HTML",
        reply_markup: {
            inline_keyboard: [
                [{ text: planButton(PREMIUM_PLANS[7], "🌟 1 Minggu (50 ⭐️)"), callback_data: "prem_stars_7" }],
                [{ text: planButton(PREMIUM_PLANS[30], "🌟 1 Bulan (75 ⭐️)"), callback_data: "prem_stars_30" }],
                [{ text: planButton(PREMIUM_PLANS[60], "🌟 2 Bulan (120 ⭐️)"), callback_data: "prem_stars_60" }],
                [{ text: planButton(PREMIUM_PLANS[90], "🌟 3 Bulan (175 ⭐️)"), callback_data: "prem_stars_90" }],
                [{ text: planButton(PREMIUM_PLANS[365], "👑 VIP 1 Tahun (350 ⭐️)"), callback_data: "prem_stars_365" }],
                [{ text: L.btn_back_main || "🔙 Kembali ke Menu Utama", callback_data: "back_to_main" }],
            ],
        },
    };

    if (messageIdToEdit) {
        options.chat_id = chatId;
        options.message_id = messageIdToEdit;
        bot.editMessageText(text, options).catch((err) => {
            bot.sendMessage(chatId, text, options).catch(() => { });
        });
    } else {
        bot.sendMessage(chatId, text, options).catch((err) => console.error("Error pada /vip:", err));
    }
}

bot.onText(/\/(vip|pay|premium)/, async (msg) => {
    sendVipMenu(msg.chat.id);
});

bot.onText(/\/search/, async (msg) => {
    const chatId = msg.chat.id;
    if (await checkBan(chatId)) return;
    startSearch(chatId, "search_random", null);
});

// Megaphone command removed

// ══════════════════════════════════════════════════════════════════
// 📢 BROADCAST ENGINE — dipakai /broadcast (owner) & /broadcastdeveloper
// ══════════════════════════════════════════════════════════════════
const BROADCAST_CONCURRENCY = 6;      // worker paralel (jumlah request bersamaan)
const BROADCAST_RATE_PER_SEC = 22;    // batas aman Telegram (±30 pesan/detik)
const DEV_BROADCAST_PIN = String(process.env.DEV_BROADCAST_PIN || "014400");
const DEV_BC_TTL = 5 * 60 * 1000;     // sesi PIN kedaluwarsa 5 menit
const devBcSessions = new Map();      // chatId → { step, text, tries, expiresAt }
let broadcastRunning = false;

const bcSleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Kalau admin tidak memakai tag HTML, escape < > & supaya tidak
// "can't parse entities" (penyebab broadcast gagal untuk SEMUA user).
function escapeIfNotHtml(text) {
    if (/<\/?(b|strong|i|em|u|s|strike|del|code|pre|a|blockquote|tg-spoiler)\b/i.test(text)) return text;
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Token bucket: menjaga laju kirim agar tidak kena rate limit Telegram.
function createRateLimiter(perSecond) {
    let tokens = perSecond;
    let last = Date.now();
    return async function take() {
        for (; ;) {
            const now = Date.now();
            tokens = Math.min(perSecond, tokens + ((now - last) / 1000) * perSecond);
            last = now;
            if (tokens >= 1) { tokens -= 1; return; }
            await bcSleep(Math.max(15, Math.ceil(((1 - tokens) * 1000) / perSecond)));
        }
    };
}

function buildBroadcastKeyboard() {
    return {
        inline_keyboard: [
            [{ text: "🏠 Buka Menu Utama", callback_data: "back_to_main" }],
            [{ text: "💎 Upgrade VIP / Premium", callback_data: "buy_premium" }],
            [
                {
                    text: "📣 Channel Official",
                    url: `https://t.me/${process.env.CHANNEL || "raihan_official0307"}`,
                },
                {
                    text: "👨‍💻 Chat Owner",
                    url: `https://t.me/${process.env.OWNER || "raihan_official0307"}`,
                },
            ],
        ],
    };
}

/**
 * kind = "announcement" → /broadcast owner (boleh menyebut Developer)
 * kind = "info"         → /broadcastdeveloper (tampil seperti broadcast biasa)
 */
function buildBroadcastTemplate(messageText, kind = "announcement") {
    const body = escapeIfNotHtml(String(messageText || "").trim()).slice(0, 3500);

    if (kind === "announcement") {
        return (
            `🔔 <b>PENGUMUMAN RESMI SERVER</b> 🔔\n` +
            `<code>━━━━━━━━━━━━━━━━━━━━</code>\n\n` +
            `<i>Halo Pengguna Setia Anonymous Chat! 👋</i>\n\n` +
            `Ada informasi penting langsung dari Developer untuk kamu nih:\n\n` +
            `💬 <b>Pesan Utama:</b>\n` +
            `${body}\n\n` +
            `<code>━━━━━━━━━━━━━━━━━━━━</code>\n` +
            `<i>Terima kasih telah menjaga komunitas ini tetap aman, asyik, dan menyenangkan. Jangan pernah lelah mencari teman baru atau bahkan jodohmu di sini! 🚀</i>`
        );
    }

    // Tampilan broadcast biasa (tanpa embel-embel "dari Developer")
    return (
        `📢 <b>INFO TERBARU</b> 📢\n` +
        `<code>━━━━━━━━━━━━━━━━━━━━</code>\n\n` +
        `<i>Halo Pengguna Anonymous Chat! 👋</i>\n\n` +
        `💬 <b>Pesan:</b>\n` +
        `${body}\n\n` +
        `<code>━━━━━━━━━━━━━━━━━━━━</code>\n` +
        `<i>Terima kasih sudah menjadi bagian dari komunitas kami. Tetap jaga etika & keamanan ya! 🚀</i>`
    );
}

/**
 * Kirim siaran ke SEMUA user di database (termasuk yang sedang di sesi chat).
 * Menggunakan edit pesan status sebagai progress bar, jadi chat owner tetap rapi.
 */
async function runBroadcast(adminChatId, messageText, { kind = "announcement" } = {}) {
    if (broadcastRunning) {
        return bot.sendMessage(
            adminChatId,
            "⚠️ <b>Broadcast lain sedang berjalan.</b>\nTunggu sampai selesai dulu ya.",
            { parse_mode: "HTML" },
        ).catch(() => { });
    }

    if (!String(messageText || "").trim()) {
        return bot.sendMessage(adminChatId, "❌ Isi pesan broadcast kosong.", { parse_mode: "HTML" }).catch(() => { });
    }

    broadcastRunning = true;

    const statusMsg = await bot.sendMessage(
        adminChatId,
        "⏳ <b>MENGAMBIL DAFTAR PENGGUNA...</b>\n\n<i>Data user banyak, tunggu beberapa detik ya.</i>",
        { parse_mode: "HTML" },
    ).catch(() => null);

    let progressTimer = null;

    try {
        const userIds = await getAllUserIds();

        if (!userIds.length) {
            const t = "❌ <b>Broadcast dibatalkan:</b> database kosong / gagal dibaca.";
            if (statusMsg) await safeEdit(adminChatId, statusMsg.message_id, t, { parse_mode: "HTML" });
            else bot.sendMessage(adminChatId, t, { parse_mode: "HTML" }).catch(() => { });
            return;
        }

        const template = buildBroadcastTemplate(messageText, kind);
        const options = {
            parse_mode: "HTML",
            disable_web_page_preview: true,
            reply_markup: buildBroadcastKeyboard(),
        };

        let ok = 0, fail = 0, blocked = 0, done = 0, cursor = 0;
        const startedAt = Date.now();
        const take = createRateLimiter(BROADCAST_RATE_PER_SEC);

        // Progress bar via edit pesan status (setiap 3 detik)
        if (statusMsg) {
            progressTimer = setInterval(() => {
                const pct = Math.min(100, Math.floor((done / userIds.length) * 100));
                const elapsed = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
                const speed = Math.round(done / elapsed) || 0;
                const eta = speed > 0 ? Math.max(0, Math.round((userIds.length - done) / speed)) : 0;
                const txt =
                    `📡 <b>BROADCAST BERJALAN...</b>\n` +
                    `<code>━━━━━━━━━━━━━━━━━━━━</code>\n\n` +
                    `${progressBar(pct)}\n` +
                    `<b>${done}</b> / <b>${userIds.length}</b> (${pct}%)\n\n` +
                    `✅ Terkirim: <b>${ok}</b>\n` +
                    `🚫 Blokir bot: <b>${blocked}</b>\n` +
                    `❌ Gagal lain: <b>${fail}</b>\n\n` +
                    `⚡ Kecepatan: <b>${speed}</b> pesan/detik\n` +
                    `⏳ Sisa waktu: <b>±${eta > 60 ? Math.ceil(eta / 60) + " menit" : eta + " detik"}</b>\n\n` +
                    `<i>Jangan tutup / restart bot sampai selesai.</i>`;
                safeEdit(adminChatId, statusMsg.message_id, txt, { parse_mode: "HTML" });
            }, 3000);
            if (progressTimer.unref) progressTimer.unref();
        }

        const sendOne = async (targetId) => {
            try {
                await bot.sendMessage(targetId, template, options);
                ok++;
                return;
            } catch (err) {
                const code = err && err.response && err.response.statusCode;
                const body = (err && err.response && err.response.body) || {};
                const desc = body.description || "";

                if (code === 429) {
                    // Rate limit → tunggu sesuai retry_after lalu kirim sekali lagi
                    const wait = (body.parameters && body.parameters.retry_after) || 2;
                    await bcSleep(wait * 1000);
                    try {
                        await bot.sendMessage(targetId, template, options);
                        ok++;
                    } catch (e2) {
                        fail++;
                    }
                } else if (code === 403) {
                    blocked++; // user memblokir bot / belum pernah start
                } else if (/parse entities/i.test(desc)) {
                    // Fallback: kirim tanpa HTML agar tetap sampai
                    try {
                        await bot.sendMessage(targetId, template.replace(/<[^>]+>/g, ""), {
                            disable_web_page_preview: true,
                            reply_markup: options.reply_markup,
                        });
                        ok++;
                    } catch (e2) {
                        fail++;
                    }
                } else {
                    fail++;
                    if (fail <= 3) console.error("[BROADCAST] gagal ke", targetId, "-", desc || err.message);
                }
            } finally {
                done++;
            }
        };

        const worker = async () => {
            for (; ;) {
                const idx = cursor++;
                if (idx >= userIds.length) return;
                await take();
                await sendOne(userIds[idx]);
            }
        };

        await Promise.all(Array.from({ length: BROADCAST_CONCURRENCY }, worker));

        // Simpan pengumuman terakhir → tampil di menu "Pengumuman Terbaru"
        latestBroadcastMsg = String(messageText).trim().slice(0, 900);
        redis.set("broadcast:latest", latestBroadcastMsg).catch(() => { });

        const dur = Math.round((Date.now() - startedAt) / 1000);
        const report =
            `✅ <b>BROADCAST SELESAI</b>\n` +
            `<code>━━━━━━━━━━━━━━━━━━━━</code>\n\n` +
            `🎯 Total Target: <b>${userIds.length}</b> user\n` +
            `✅ Berhasil Terkirim: <b>${ok}</b>\n` +
            `🚫 Blokir Bot: <b>${blocked}</b>\n` +
            `❌ Gagal Lain: <b>${fail}</b>\n` +
            `⏱️ Durasi: <b>${dur > 60 ? Math.floor(dur / 60) + " menit " + (dur % 60) + " detik" : dur + " detik"}</b>\n\n` +
            `<i>Pengumuman juga sudah tersimpan di menu 📢 Pengumuman.</i> 🫡`;

        if (statusMsg) {
            if (!(await safeEdit(adminChatId, statusMsg.message_id, report, { parse_mode: "HTML" }))) {
                bot.sendMessage(adminChatId, report, { parse_mode: "HTML" }).catch(() => { });
            }
        } else {
            bot.sendMessage(adminChatId, report, { parse_mode: "HTML" }).catch(() => { });
        }
    } catch (err) {
        console.error("[BROADCAST] fatal error:", err);
        const t = `❌ <b>Broadcast gagal:</b>\n<code>${(err && err.message) || "unknown error"}</code>`;
        if (statusMsg) await safeEdit(adminChatId, statusMsg.message_id, t, { parse_mode: "HTML" });
        else bot.sendMessage(adminChatId, t, { parse_mode: "HTML" }).catch(() => { });
    } finally {
        if (progressTimer) clearInterval(progressTimer);
        broadcastRunning = false;
    }
}

// Preview + konfirmasi sebelum kirim (khusus /broadcastdeveloper)
function showDevBroadcastConfirm(chatId, text) {
    return bot.sendMessage(
        chatId,
        `🔍 <b>PREVIEW BROADCAST</b>\n` +
        `<code>━━━━━━━━━━━━━━━━━━━━</code>\n\n` +
        `${buildBroadcastTemplate(text, "info")}\n\n` +
        `<code>━━━━━━━━━━━━━━━━━━━━</code>\n` +
        `🎯 Target: <b>SELURUH USER</b> (termasuk yang sedang chat)\n\n` +
        `<i>Kirim sekarang?</i>`,
        {
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: [
                    [{ text: "🚀 Kirim Sekarang", callback_data: "devbc_send" }],
                    [
                        { text: "✏️ Tulis Ulang", callback_data: "devbc_rewrite" },
                        { text: "❌ Batal", callback_data: "devbc_cancel" },
                    ],
                ],
            },
        },
    ).catch(() => { });
}

// Muat pengumuman terakhir dari Redis (biar tetap tampil setelah restart)
(async () => {
    try {
        const saved = await redis.get("broadcast:latest");
        if (saved) latestBroadcastMsg = saved;
    } catch (e) { }
})();

// Bersihkan sesi PIN developer yang kedaluwarsa
setInterval(() => {
    const now = Date.now();
    for (const [id, s] of devBcSessions) {
        if (!s || now > s.expiresAt) devBcSessions.delete(id);
    }
}, 60 * 1000).unref?.();

// ── /broadcast — KHUSUS OWNER ─────────────────────────────────────
bot.onText(/^\/broadcast(?:@\w+)?$/, async (msg) => {
    const chatId = msg.chat.id;
    if (!process.env.OWNER_ID || chatId.toString() !== process.env.OWNER_ID.toString()) return;
    return bot.sendMessage(
        chatId,
        "ℹ️ <b>Format:</b>\n<code>/broadcast [pesan kamu]</code>\n\n<b>Contoh:</b>\n<code>/broadcast Besok maintenance jam 12 malam ya!</code>",
        { parse_mode: "HTML" },
    ).catch(() => { });
});

bot.onText(/^\/broadcast(?:@\w+)?\s+([\s\S]+)/, async (msg, match) => {
    const chatId = msg.chat.id;

    if (!process.env.OWNER_ID || chatId.toString() !== process.env.OWNER_ID.toString()) {
        return bot.sendMessage(
            chatId,
            "❌ <b>Akses Ditolak!</b> Anda bukan Owner.",
            { parse_mode: "HTML" },
        ).catch(() => { });
    }

    return runBroadcast(chatId, match[1], { kind: "announcement" });
});

// ── /broadcastdeveloper — berbasis PIN, tampil seperti broadcast biasa ──
// Tidak didaftarkan di menu mana pun & tidak muncul di /help.
bot.onText(/^\/broadcastdeveloper(?:@\w+)?(?:\s+([\s\S]+))?$/i, async (msg, match) => {
    const chatId = msg.chat.id;

    if (msg.chat.type !== "private") {
        return bot.sendMessage(chatId, "🔒 Perintah ini hanya bisa dipakai di chat pribadi bot.").catch(() => { });
    }

    const presetText = match && match[1] ? match[1].trim() : null;

    devBcSessions.set(chatId, {
        step: "pin",
        text: presetText,
        tries: 0,
        expiresAt: Date.now() + DEV_BC_TTL,
    });

    // Hapus jejak command-nya (stealth)
    bot.deleteMessage(chatId, msg.message_id).catch(() => { });

    return bot.sendMessage(
        chatId,
        `🔐 <b>AKSES DEVELOPER</b>\n` +
        `<code>━━━━━━━━━━━━━━━━━━━━</code>\n\n` +
        `Masukkan <b>PIN Developer</b> untuk melanjutkan.\n\n` +
        (presetText ? `📝 <i>Pesan yang akan dikirim sudah tersimpan. Tinggal verifikasi PIN.</i>\n\n` : "") +
        `<i>Ketik /batal untuk membatalkan.</i>`,
        { parse_mode: "HTML" },
    ).catch(() => { });
});

// Handler input PIN / isi pesan (didaftarkan SEBELUM handler pesan biasa,
// dan handler pesan biasa sudah diberi guard agar tidak meneruskan teks ini).
bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const sess = devBcSessions.get(chatId);
    if (!sess) return;

    if (msg.chat.type !== "private" || Date.now() > sess.expiresAt) {
        devBcSessions.delete(chatId);
        return;
    }

    const raw = typeof msg.text === "string" ? msg.text.trim() : "";
    if (!raw) return;

    if (raw.toLowerCase() === "/batal") {
        devBcSessions.delete(chatId);
        return bot.sendMessage(chatId, "❌ <b>Broadcast Developer dibatalkan.</b>", { parse_mode: "HTML" }).catch(() => { });
    }

    if (sess.step === "pin") {
        // Jangan pernah biarkan PIN tertinggal di chat
        bot.deleteMessage(chatId, msg.message_id).catch(() => { });

        if (raw !== DEV_BROADCAST_PIN) {
            sess.tries += 1;
            if (sess.tries >= 3) {
                devBcSessions.delete(chatId);
                return bot.sendMessage(
                    chatId,
                    "⛔ <b>PIN salah 3 kali.</b> Akses ditutup. Jalankan /broadcastdeveloper lagi kalau perlu.",
                    { parse_mode: "HTML" },
                ).catch(() => { });
            }
            sess.expiresAt = Date.now() + DEV_BC_TTL;
            return bot.sendMessage(
                chatId,
                `❌ <b>PIN salah.</b>\nSisa percobaan: <b>${3 - sess.tries}</b>\n\n<i>Ketik /batal untuk keluar.</i>`,
                { parse_mode: "HTML" },
            ).catch(() => { });
        }

        // PIN BENAR
        if (sess.text) {
            sess.step = "confirm";
            sess.expiresAt = Date.now() + DEV_BC_TTL;
            return showDevBroadcastConfirm(chatId, sess.text);
        }

        sess.step = "text";
        sess.expiresAt = Date.now() + DEV_BC_TTL;
        return bot.sendMessage(
            chatId,
            `✅ <b>PIN VERIFIED</b>\n` +
            `<code>━━━━━━━━━━━━━━━━━━━━</code>\n\n` +
            `Sekarang kirim <b>isi pesan broadcast</b>.\n\n` +
            `Boleh multi-baris, dan boleh pakai format HTML dasar:\n` +
            `<code>&lt;b&gt;tebal&lt;/b&gt;</code>, <code>&lt;i&gt;miring&lt;/i&gt;</code>, <code>&lt;code&gt;kode&lt;/code&gt;</code>\n\n` +
            `<i>Ketik /batal untuk membatalkan.</i>`,
            { parse_mode: "HTML" },
        ).catch(() => { });
    }

    if (sess.step === "text") {
        if (raw.length < 2) {
            return bot.sendMessage(chatId, "❌ Pesan terlalu pendek. Kirim minimal 2 karakter.", { parse_mode: "HTML" }).catch(() => { });
        }
        sess.text = raw.slice(0, 3500);
        sess.step = "confirm";
        sess.expiresAt = Date.now() + DEV_BC_TTL;
        return showDevBroadcastConfirm(chatId, sess.text);
    }
});

bot.onText(/\/next/, async (msg) => {
    const chatId = msg.chat.id;
    if (await checkBan(chatId)) return;

    // Anti-spam /next ekstrim
    const now = Date.now();
    let spamData = nextSpamMap.get(chatId) || { count: 0, firstTime: now, lastTime: now };

    // Reset if more than 5 minutes since first /next in this burst
    if (now - spamData.firstTime > 5 * 60 * 1000) {
        spamData = { count: 1, firstTime: now, lastTime: now };
    } else {
        spamData.count++;
        spamData.lastTime = now;
    }
    nextSpamMap.set(chatId, spamData);

    if (spamData.count > 150) {
        // Memicu captcha dan hentikan proses
        nextSpamMap.delete(chatId); // reset setelah dipicu
        if (activeChats.has(chatId)) {
            const partnerId = activeChats.get(chatId);
            await endChatAndSendFeedback(chatId, partnerId, true);
        }
        await removeFromAllQueues(chatId);
        await removeFromRegionQueues(chatId);
        return showCaptcha(chatId, "search_random");
    }

    // Satu /next diproses pada satu waktu.
    // Tanpa lock ini, dua /next yang datang bersamaan akan sama-sama lolos
    // pengecekan isSearchActive() dan mengirim 2x pesan SEARCHING (spam).
    if (!(await acquireLock('action', chatId))) return;

    try {
        // Sudah di radar: jangan buat pesan SEARCHING baru & jangan hapus antrean.
        if (!activeChats.has(chatId) && isSearchActive(chatId)) return;

        if (activeChats.has(chatId)) {
            const partnerId = activeChats.get(chatId);
            await endChatAndSendFeedback(chatId, partnerId, true);
        }

        // Setelah sesi berakhir, pastikan sisa antrean lama benar-benar hilang
        // supaya user tidak pernah kembali ke sesi/partner sebelumnya.
        await cancelSearch(chatId);

        if (isSearchActive(chatId)) return;
        await startSearch(chatId, "search_random", null);
    } finally {
        await releaseLock('action', chatId);
    }
});

bot.onText(/\/rules/, async (msg) => {
    const chatId = msg.chat.id;
    if (await checkBan(chatId)) return;

    const communityRules =
        `⚖️ <b>COMMUNITY GUIDELINES & RULES</b>\n` +
        `<code>━━━━━━━━━━━━━━━━━━━━━━</code>\n` +
        `<i>Please read carefully to ensure a safe environment for everyone.</i>\n\n` +
        `<b>1. Respect Your Partner:</b> Use polite language. Harassment, hate speech, and discrimination will not be tolerated.\n` +
        `<b>2. No Spam or Promotions:</b> Sending spam, using bots, or unauthorized advertising/links is strictly prohibited.\n` +
        `<b>3. Zero Tolerance for Violence:</b> Any threats, sharing of illegal content, or acts of violence will result in an immediate permanent ban.\n` +
        `<b>4. Rating & Reporting System:</b> You can rate or report your partner after the conversation ends.\n\n` +
        `🚨 <b>ENFORCEMENT:</b>\n` +
        `Every report goes directly to our Admin team. If a report is investigated and proven valid, the offending user will be <b>PERMANENTLY BANNED</b> by the admin without warning.\n\n` +
        `<i>By using this bot, you agree to these rules.</i>\n\n` +
        `<code>━━━━━━━━━━━━━━━━━━━━━━</code>\n` +
        `⚖️ <b>PEDOMAN & ATURAN KOMUNITAS</b>\n` +
        `<code>━━━━━━━━━━━━━━━━━━━━━━</code>\n` +
        `<i>Harap baca dengan saksama untuk memastikan lingkungan yang aman bagi semua.</i>\n\n` +
        `<b>1. Hormati Partner Anda:</b> Gunakan bahasa yang sopan. Pelecehan, ujaran kebencian, dan diskriminasi tidak akan ditoleransi.\n` +
        `<b>2. Dilarang Spam atau Promosi:</b> Mengirim spam, menggunakan bot, atau menyebarkan iklan/tautan tanpa izin dilarang keras.\n` +
        `<b>3. Toleransi Nol untuk Kekerasan:</b> Segala bentuk ancaman, penyebaran konten ilegal, atau tindak kekerasan akan berujung pada pemblokiran permanen.\n` +
        `<b>4. Sistem Rating & Laporan:</b> Anda dapat menilai atau melaporkan partner Anda setelah obrolan selesai.\n\n` +
        `🚨 <b>PENINDAKAN PELANGGARAN:</b>\n` +
        `Setiap laporan akan masuk langsung ke tim Admin. Jika laporan divalidasi dan terbukti bersalah, pengguna yang melanggar akan di-<b>BANNED PERMANEN</b> oleh admin tanpa peringatan.\n\n` +
        `<i>Dengan menggunakan bot ini, Anda menyetujui semua aturan di atas.</i>`;

    bot.sendMessage(chatId, communityRules, { parse_mode: "HTML" }).catch(() => { });
});


async function checkBan(chatId) {
    const user = await getUser(chatId);
    if (user && user.is_banned) {
        bot.sendMessage(
            chatId,
            "🚫 *AKUN ANDA DIBLOKIR (BANNED)* 🚫\n\nAnda telah melanggar pedoman komunitas kami. Semua fitur dinonaktifkan.\n\n_Hubungi Owner jika Anda ingin mengajukan banding untuk melepaskan ban._",
            { parse_mode: "Markdown" },
        );
        return true;
    }
    return false;
}





const KATA_LIST = [
    "KUCING", "ANJING", "BURUNG", "IKAN", "HARIMAU", "GAJAH", "KUDA", "SAPI", "AYAM", "BEBEK",
    "MANGGA", "APEL", "PISANG", "JERUK", "SEMANGKA", "DURIAN", "NANAS", "PEPAYA", "RAMBUTAN",
    "SEKOLAH", "RUMAH", "MOBIL", "MOTOR", "KOMPUTER", "TELEVISI", "BUKU", "PENSIL", "MEJA",
    "INDONESIA", "JAKARTA", "SURABAYA", "BANDUNG", "BALI", "CINTA", "SAYANG", "RINDU",
    "BAHAGIA", "SEDIH", "MARAH", "SENANG", "POLISI", "DOKTER", "GURU", "DOSEN", "MAHASISWA",
    "PANTAI", "GUNUNG", "SUNGAI", "HUTAN", "LAUT", "BINTANG", "BULAN", "MATAHARI", "LANGIT",
    "KELINCI", "KELELAWAR", "MONYET", "PANDA", "KOALA", "PINGUIN", "LUMBA", "HIU", "KURA", "KUDA",
    "LOMBOK", "MEDAN", "SEMARANG", "MALANG", "YOGYA", "SOLO", "MAKASSAR", "MANADO", "PAPUA",
    "KAPAL", "KERETA", "PESAWAT", "SEPEDA", "BUSWAY", "TAKSI", "OJEK", "BECAK", "TRAKTOR",
    "MAKAN", "MINUM", "TIDUR", "BERLARI", "BERENANG", "MELOMPAT", "MENULIS", "MEMBACA",
    "MEMASAK", "BERNYANYI", "BERDANSA", "BEROLAHRAGA", "BERMAIN", "BELAJAR", "BEKERJA",
    "COKLAT", "KOPI", "TEH", "SUSU", "JAMU", "SIRUP", "SODA", "JUICE", "MADU", "SANTAN",
    "NASI", "SOTO", "BAKSO", "RENDANG", "SATAY", "GADO", "PECEL", "RAWON", "OPOR", "GUDEG",
    "MERAH", "BIRU", "HIJAU", "KUNING", "UNGU", "ORANYE", "HITAM", "PUTIH", "COKLAT", "MERAH",
    "PANAS", "DINGIN", "GELAP", "TERANG", "BESAR", "KECIL", "TINGGI", "PENDEK", "CEPAT", "LAMBAT",
    "KASIH", "HARAP", "MIMPI", "IMPIAN", "TAKDIR", "KISAH", "CERITA", "LAGU", "MUSIK", "SUARA",
    "JANTUNG", "PARU", "GINJAL", "OTAK", "MATA", "TELINGA", "HIDUNG", "MULUT", "TANGAN", "KAKI",
    "AWAN", "HUJAN", "PETIR", "ANGIN", "BADAI", "KABUT", "EMBUN", "PELANGI", "SALJU", "TORNADO",
    "ATLAS", "GLOBE", "PETA", "KOMPAS", "TELESKOP", "MIKROSKOP", "KAMERA", "RADIO", "RADAR",
    "ROBOT", "ANDROID", "SERVER", "JARINGAN", "PROGRAM", "KODING", "SISTEM", "APLIKASI", "DATA",
    "OLIMPIK", "SEPAKBOLA", "BASKET", "VOLI", "TENIS", "BADMINTON", "RENANG", "TINJU", "GOLF",
    "SERULING", "GITAR", "PIANO", "BIOLA", "DRUM", "HARMONIKA", "ANGKLUNG", "GAMELAN", "TEROMPET",
    "MUSEUM", "GALERI", "STADION", "MALL", "PASAR", "MESJID", "GEREJA", "KUIL", "PURA", "VIHARA",
    "NAGA", "UNICORN", "PERI", "DEWA", "HANTU", "JIN", "PENYIHIR", "KSATRIA", "PUTRI", "RAKSASA",
    "KRISTAL", "BERLIAN", "RUBI", "SAFIR", "ZAMRUD", "EMAS", "PERAK", "PLATINA", "BESI", "BAJA",
    "SELATAN", "UTARA", "TIMUR", "BARAT", "TENGAH", "POJOK", "SUDUT", "TEPI", "PINGGIR", "PUSAT",
    "JANUARI", "FEBRUARI", "MARET", "APRIL", "MEI", "JUNI", "JULI", "AGUSTUS", "SEPTEMBER", "OKTOBER",
    "SENIN", "SELASA", "RABU", "KAMIS", "JUMAT", "SABTU", "MINGGU",
    "PULAU", "BENUA", "SAMUDERA", "SELAT", "TELUK", "TANJUNG", "DELTA", "LEMBAH", "JURANG", "NGARAI",
    "LAPTOP", "TABLET", "HEADSET", "SPEAKER", "PRINTER", "SCANNER", "MODEM", "ROUTER", "HARDDISK",
    "PIZZA", "BURGER", "HOTDOG", "SANDWICH", "PASTA", "SUSHI", "RAMEN", "KEBAB", "TACO", "WAFFLE",
    "TAMAN", "KEBUN", "SAWAH", "LADANG", "PADANG", "STEPA", "SAVANA", "RAWA", "DANAU", "KOLAM",
    "PENSIL", "PULPEN", "SPIDOL", "PENGHAPUS", "PENGGARIS", "GUNTING", "CUTTER", "LEM", "STAPLER",
    "KEHIDUPAN", "KEMATIAN", "KELAHIRAN", "PERNIKAHAN", "PERSAHABATAN", "KEBERANIAN", "KEJUJURAN",
];

function scrambleWord(word) {
    const arr = word.split("");
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    const scrambled = arr.join("");
    return scrambled === word ? scrambleWord(word) : scrambled;
}

function getRPSWinner(myChoice, theirChoice) {
    if (myChoice === theirChoice) return "draw";
    if (
        (myChoice === "batu" && theirChoice === "gunting") ||
        (myChoice === "gunting" && theirChoice === "kertas") ||
        (myChoice === "kertas" && theirChoice === "batu")
    ) return "win";
    return "lose";
}

async function showCaptcha(chatId, action, queryId) {
    if (queryId) {
        await bot.answerCallbackQuery(queryId, { text: "🔐 Sistem keamanan diaktifkan..." }).catch(() => { });
    }

    const failData = captchaFailMap.get(chatId);
    if (failData && failData.blockedUntil && Date.now() < failData.blockedUntil) {
        const sisaDetik = Math.ceil((failData.blockedUntil - Date.now()) / 1000);
        return bot.sendMessage(chatId,
            `🚫 <b>AKSES DIBLOKIR SEMENTARA</b>\n━━━━━━━━━━━━━━━━━━━━\n\n⛔ Kamu gagal verifikasi terlalu banyak kali.\n\n⏳ Coba lagi dalam <b>${sisaDetik} detik</b>.`,
            { parse_mode: "HTML" }
        );
    }

    const animFrames = [
        `🛡️ <b>SISTEM KEAMANAN AKTIF</b>\n<code>━━━━━━━━━━━━━━━━━━━━</code>\n\n🔎 <i>Menginisialisasi protokol keamanan...</i>\n\n<code>[░░░░░░░░░░░░░░░░░░░░]   0%</code>`,
        `🛡️ <b>SISTEM KEAMANAN AKTIF</b>\n<code>━━━━━━━━━━━━━━━━━━━━</code>\n\n🔍 <i>Memindai pola perilaku...</i>\n\n<code>[▓▓▓▓░░░░░░░░░░░░░░░░]  20%</code>`,
        `🛡️ <b>SISTEM KEAMANAN AKTIF</b>\n<code>━━━━━━━━━━━━━━━━━━━━</code>\n\n🧠 <i>Menganalisis sidik digital...</i>\n\n<code>[▓▓▓▓▓▓▓▓░░░░░░░░░░░░]  40%</code>`,
        `🛡️ <b>SISTEM KEAMANAN AKTIF</b>\n<code>━━━━━━━━━━━━━━━━━━━━</code>\n\n⚡ <i>Memeriksa enkripsi identitas...</i>\n\n<code>[▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░]  60%</code>`,
        `🛡️ <b>SISTEM KEAMANAN AKTIF</b>\n<code>━━━━━━━━━━━━━━━━━━━━</code>\n\n🔒 <i>Memverifikasi lapisan akhir...</i>\n\n<code>[▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░]  80%</code>`,
        `🛡️ <b>SISTEM KEAMANAN AKTIF</b>\n<code>━━━━━━━━━━━━━━━━━━━━</code>\n\n✅ <i>Pemindaian selesai!</i>\n\n<code>[▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓] 100%</code>`,
        `🚨 <b>POTENSI BOT TERDETEKSI!</b>\n<code>━━━━━━━━━━━━━━━━━━━━</code>\n\n⚠️ <i>Sistem mendeteksi aktivitas mencurigakan.\nBuktikan kamu bukan robot untuk melanjutkan!</i>\n\n<code>[▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓] 100%</code>`,
    ];

    let sentMsg;
    try {
        sentMsg = await bot.sendMessage(chatId, animFrames[0], { parse_mode: "HTML" });
    } catch (e) { return; }

    const delays = [700, 700, 700, 700, 700, 600];
    for (let i = 1; i < animFrames.length; i++) {
        await new Promise(r => setTimeout(r, delays[i - 1]));
        await bot.editMessageText(animFrames[i], {
            chat_id: chatId,
            message_id: sentMsg.message_id,
            parse_mode: "HTML",
        }).catch(() => { });
    }

    await new Promise(r => setTimeout(r, 700));

    const L = getLang(chatId);
    const cap = generateCaptcha();
    let questionText;
    if (cap.type === "code") {
        questionText = `${L.captcha_code_q || "🤖 Pilih kode yang SAMA PERSIS dengan teks di bawah ini:"}\n\n<code>【 ${cap.question} 】</code>`;
    } else if (cap.type === "emoji") {
        questionText = `🎯 <b>Tebak pola emoji berikut!</b>\n\nUrutan: <b>${cap.question}</b>\n\n<i>Emoji apa yang seharusnya menggantikan ❓?</i>`;
    } else {
        questionText = `${L.captcha_math_q || "🧮 Selesaikan soal ini:"}\n\n<b>  ${cap.question} = ❓</b>`;
    }

    const btns = cap.options.map((opt, i) => ({
        text: `${opt}`,
        callback_data: `captcha_${i}`,
    }));

    const failInfo = captchaFailMap.get(chatId);
    const attempts = failInfo ? failInfo.count : 0;
    const attemptsBar = attempts > 0 ? `\n\n⚠️ <i>Percobaan gagal: ${attempts}/3</i>` : "";

    await bot.editMessageText(
        `🔐 <b>${L.captcha_title || "VERIFIKASI KEAMANAN"}</b>\n<code>━━━━━━━━━━━━━━━━━━━━</code>\n\n${questionText}${attemptsBar}\n\n⏱️ <i>Pilih jawaban yang benar dalam 60 detik!</i>`,
        {
            chat_id: chatId,
            message_id: sentMsg.message_id,
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: [btns.slice(0, 3), btns.slice(3, 5)],
            },
        }
    ).catch(async () => {
        sentMsg = await bot.sendMessage(chatId,
            `🔐 <b>${L.captcha_title || "VERIFIKASI KEAMANAN"}</b>\n<code>━━━━━━━━━━━━━━━━━━━━</code>\n\n${questionText}${attemptsBar}\n\n⏱️ <i>Pilih jawaban yang benar dalam 60 detik!</i>`,
            { parse_mode: "HTML", reply_markup: { inline_keyboard: [btns.slice(0, 3), btns.slice(3, 5)] } }
        ).catch(() => null);
        if (!sentMsg) return;
    });

    captchaMap.set(chatId, {
        answer: cap.answer,
        options: cap.options,
        action,
        queryId,
        msgId: sentMsg.message_id,
        expires: Date.now() + 60000,
    });
}

async function startSearch(chatId, action = "search_random", queryId = null, existingMsgId = null, opts = {}) {
    // opts.force        → dipakai radar internal (user sudah dalam pencarian)
    // opts.silent       → jangan edit pesan status kalau belum dapat partner
    // opts.allowFallback → izinkan fallback ke user tanpa gender (default: ya)
    const force = !!opts.force;
    const silent = !!opts.silent;
    const allowFallback = opts.allowFallback !== false;

    // Satu proses pencarian per user pada satu waktu.
    // Tanpa ini, dua request yang datang berdekatan (mis. /next + tombol Next)
    // bisa sama-sama mengirim pesan SEARCHING dan membuat dua sesi sekaligus.
    if (!(await acquireLock('search', chatId, 30000))) {
        if (queryId) {
            await bot.answerCallbackQuery(queryId, { text: "⏳ Pencarian sedang diproses...", show_alert: false }).catch(() => { });
        }
        return;
    }

    try {
    const now = Date.now();

    // ── Spam detection: 100x dalam 5 menit → CAPTCHA ──────────────
    const rate = searchRateMap.get(chatId) || { count: 0, resetAt: now + 300000 };
    if (now > rate.resetAt) { rate.count = 0; rate.resetAt = now + 300000; }
    if (!force) rate.count++; // retry radar tidak dihitung spam
    searchRateMap.set(chatId, rate);
    if (rate.count > 100) {
        // reset supaya tidak terjadi loop captcha tanpa henti
        rate.count = 0;
        searchRateMap.set(chatId, rate);
        return showCaptcha(chatId, action, queryId);
    }

    let user = await getUser(chatId);
    if (!user) {
        const { data } = await supabase.from('users').select('*').eq('telegram_id', chatId).maybeSingle();
        user = data;
    }
    if (!user) {
        const errMsg = "❌ Profil tidak ditemukan. Ketik /start untuk mendaftar.";
        return queryId
            ? bot.answerCallbackQuery(queryId, { text: errMsg, show_alert: true })
            : bot.sendMessage(chatId, errMsg);
    }
    if (await checkBan(chatId)) return;
    const isOwner = chatId.toString() === process.env.OWNER_ID.toString();

    if (activeChats.has(chatId)) {
        const msg = "❌ You're already in a chat! Type /stop to end it.";
        return queryId
            ? bot.answerCallbackQuery(queryId, { text: msg, show_alert: true })
            : pushStatus(chatId, msg, { reply_markup: getChatKeyboard() });
    }

    // Jangan kirim pesan SEARCHING baru jika user sudah berada di radar.
    // Ini mencegah notifikasi berulang saat /next ditekan berkali-kali.
    // Dicek juga ke Redis supaya proses lain (mis. proses lama yang belum mati)
    // tidak ikut mengirim pesan SEARCHING kedua.
    if (!force && await isSearchActiveAnywhere(chatId)) {
        const msg = "⏳ Kamu masih mencari partner. Tekan /stop untuk membatalkan.";
        return queryId
            ? bot.answerCallbackQuery(queryId, { text: msg, show_alert: false }).catch(() => { })
            : undefined;
    }

    if (
        (action === "search_male" || action === "search_female" || action.startsWith("search_age_")) &&
        !isPremium(user)
    ) {
        const msg =
            "🔒 Fitur pencarian spesifik ini eksklusif untuk pengguna 🌟 PREMIUM. Ketik /vip untuk upgrade!";
        return queryId
            ? bot.answerCallbackQuery(queryId, { text: msg, show_alert: true }).catch(() => { })
            : bot.sendMessage(chatId, msg);
    }

    if (action.startsWith("search_age_") && (!user.age || isNaN(Number(user.age)))) {
        ageRegistrationMode.set(chatId, "register");
        const msg = "🎂 Usia kamu belum diatur. Ketik usia kamu dalam angka (contoh: 18) terlebih dahulu.";
        return queryId
            ? bot.answerCallbackQuery(queryId, { text: msg, show_alert: true }).catch(() => { })
            : bot.sendMessage(chatId, msg, { parse_mode: "HTML" });
    }

    // ══════════════════════════════════════════════════════════
    // FASE 1: Kirim "SEARCHING" → animasi "WAITING" → cari match
    // ══════════════════════════════════════════════════════════
    const userRegion = user.region && user.region !== 'GLOBAL' ? user.region : null;
    const regionLabel = userRegion ? getRegionDisplay(userRegion) : '🌍 Global';

    const searchingText =
        `🔍 <b>SEARCHING FOR A PARTNER...</b>\n<code>━━━━━━━━━━━━━━━━━━━━</code>\n\n` +
        `📡 <i>Scanning the network...</i>\n\n` +
        `🌐 Region: <b>${regionLabel}</b>\n\n` +
        `⚡ <i>Matchmaking engine aktif...</i>`;

    let searchMsg = null;
    try {
        // Hanya satu proses yang boleh mengirim pesan SEARCHING untuk user ini.
        if (!force && !(await reserveSearchSlot(chatId))) return;

        let searchMsgId = null;

        if (force) {
            // Retry dari radar: pakai pesan status yang sudah ada, tanpa edit ulang.
            searchMsgId = existingMsgId || searchMsgMap.get(chatId) || await getRemoteSearchMsgId(chatId) || null;
        } else {
            // Kalau tidak ada pesan eksplisit, pakai pesan status terakhir user
            // (mis. "RADAR DIMATIKAN" dari /stop, reminder /start, dll) →
            // pesan itu DI-EDIT jadi SEARCHING, bukan kirim pesan baru.
            if (!existingMsgId) existingMsgId = takeStatusMsgId(chatId);

            if (existingMsgId) {
                // Pakai pesan yang sudah ada (mis. pesan welcome /start) → di-EDIT,
                // jadi tidak ada pesan tambahan di chat. Pesan ini nanti juga yang
                // di-edit menjadi PARTNER FOUND.
                if (await safeEdit(chatId, existingMsgId, searchingText, { parse_mode: 'HTML', reply_markup: getMainKeyboard() })) {
                    searchMsgId = existingMsgId;
                } else {
                    // Edit gagal → hapus pesan lama agar tidak ada 2 pesan status.
                    bot.deleteMessage(chatId, existingMsgId).catch(() => { });
                }
            }
        }

        if (!searchMsgId) {
            const sent = await bot.sendMessage(chatId, searchingText, { parse_mode: 'HTML', reply_markup: getMainKeyboard() });
            searchMsgId = sent.message_id;
        }

        searchMsg = { message_id: searchMsgId };
        searchMsgMap.set(chatId, searchMsgId);
        // Pesan SEARCHING ini sekarang jadi pesan status user
        rememberStatusMsg(chatId, searchMsgId);
        searchStartedAt.set(chatId, Date.now());
        await publishSearchState(chatId, searchMsgId);
    } catch (e) {
        await clearRemoteSearchState(chatId);
        return;
    }

    // ── Animated waiting frames (digunakan saat user masuk queue) ──
    const waitFrames = [
        `⏳ <b>WAITING FOR A MATCH...</b>\n<code>━━━━━━━━━━━━━━━━━━━━</code>\n\n📡 <i>You're in the queue. Hang tight!</i>\n\n🌐 Region: <b>${regionLabel}</b>\n\n🛑 /stop untuk batal`,
        `⏳ <b>WAITING FOR A MATCH...</b>\n<code>━━━━━━━━━━━━━━━━━━━━</code>\n\n📡 <code>●○○</code> <i>Scanning network...</i>\n\n🌐 Region: <b>${regionLabel}</b>\n\n🛑 /stop untuk batal`,
        `⏳ <b>WAITING FOR A MATCH...</b>\n<code>━━━━━━━━━━━━━━━━━━━━</code>\n\n📡 <code>●●○</code> <i>Analyzing profiles...</i>\n\n🌐 Region: <b>${regionLabel}</b>\n\n🛑 /stop untuk batal`,
        `⏳ <b>WAITING FOR A MATCH...</b>\n<code>━━━━━━━━━━━━━━━━━━━━</code>\n\n📡 <code>●●●</code> <i>Almost there...</i>\n\n🌐 Region: <b>${regionLabel}</b>\n\n🛑 /stop untuk batal`,
    ];
    let waitFrameIdx = 0;
    let searchPhase = 'searching';
    let animInterval = null;

    clearSearchAnim(chatId);
    // Transition cepat: SEARCHING → WAITING (1.5 detik)
    // Mode force (retry radar) tidak perlu animasi/pesan ulang.
    if (!force) {
        const phaseTimer = setTimeout(() => {
            if (searchPhase !== 'searching') return;
            searchPhase = 'waiting';
            bot.editMessageText(waitFrames[0], {
                chat_id: chatId,
                message_id: searchMsg.message_id,
                parse_mode: 'HTML',
            }).catch(() => { });
            animInterval = setInterval(async () => {
                if (searchPhase !== 'waiting') return;
                waitFrameIdx = (waitFrameIdx + 1) % waitFrames.length;
                await bot.editMessageText(waitFrames[waitFrameIdx], {
                    chat_id: chatId,
                    message_id: searchMsg.message_id,
                    parse_mode: 'HTML',
                }).catch(() => { });
            }, 4000);
            const anim = searchAnimMap.get(chatId);
            if (anim) anim.interval = animInterval;
        }, 1500);
        searchAnimMap.set(chatId, { timer: phaseTimer, interval: null });
    }

    // ══════════════════════════════════════════════════════════
    // FASE 2: MATCHING ENGINE — gunakan queue.js functions
    // ══════════════════════════════════════════════════════════
    let partnerId = null;
    let partnerSearchMsgId = null; // searchMsgId dari partner yang didequeue
    let matchedCandidate = null;

    // Bersihkan user yang sudah tidak valid (mis. sudah punya sesi aktif)
    await pruneQueue(waitingList.general);
    await pruneQueue(waitingList.ageList);

    // ── AGE-BASED SEARCH (target = usia asli kandidat) ──
    if (action.startsWith("search_age_")) {
        const range = getAgeRange(action, user.age);

        if (!range) {
            clearSearchAnim(chatId);
            searchMsgMap.delete(chatId);
            searchStartedAt.delete(chatId);
            bot.deleteMessage(chatId, searchMsg.message_id).catch(() => { });
            return bot.sendMessage(
                chatId,
                `❌ <b>RENTANG USIA TIDAK TERSEDIA</b>\n<code>━━━━━━━━━━━━━━━━━━━━</code>\n\nTidak ada rentang usia valid untuk pilihan ini. Coba opsi lain atau perbarui usiamu di /settings.`,
                { parse_mode: 'HTML', reply_markup: getMainKeyboard() }
            ).catch(() => { });
        }

        matchedCandidate = await takeAgeMatch(chatId, user, range.minAge, range.maxAge);

        if (!matchedCandidate) {
            searchPhase = 'waiting';
            clearSearchAnim(chatId);
            const rangeLabel = range.minAge === range.maxAge
                ? `${range.minAge}`
                : `${range.minAge}-${range.maxAge}`;

            if (!silent) {
                bot.editMessageText(
                    `⏳ <b>WAITING FOR A MATCH...</b>\n<code>━━━━━━━━━━━━━━━━━━━━</code>\n\n📡 <code>●●●</code> <i>Mencari partner dengan usia tepat...</i>\n\n<b>Age Range:</b> ${rangeLabel} tahun\n<b>Region:</b> ${regionLabel}\n\n<i>Kamu akan dihubungkan otomatis saat ada yang cocok!</i>\n\n🛑 /stop untuk batal`,
                    { chat_id: chatId, message_id: searchMsg.message_id, parse_mode: 'HTML' }
                ).catch(() => { });
            }

            await removeFromAllQueues(chatId);
            await removeFromRegionQueues(chatId);
            await enqueue('age', chatId, {
                gender: user.gender,
                age: user.age,
                minAge: range.minAge,
                maxAge: range.maxAge,
                searchMsgId: searchMsg.message_id,
                joinedAt: Date.now(),
            });
            return;
        }

        // ── RANDOM / GENDER SEARCH ──
    } else {
        const targetGender = action === "search_male"
            ? "M"
            : action === "search_female"
                ? "F"
                : null;

        matchedCandidate = await takeGeneralMatch(chatId, user, targetGender, { allowFallback });

        if (!matchedCandidate) {
            searchPhase = 'waiting';
            clearSearchAnim(chatId);

            const targetLabel = targetGender === "M"
                ? "👨 Male"
                : targetGender === "F"
                    ? "👩 Female"
                    : null;

            const strictUntil = targetGender ? Date.now() + GENDER_STRICT_MS : null;

            const queueNote = targetLabel
                ? `🎯 <b>Target:</b> ${targetLabel}\n` +
                  (strictUntil
                      ? `<i>Hanya dicocokkan dengan gender ${targetLabel} asli. Jika tidak ada yang online, radar otomatis beralih ke user yang belum mengatur gender setelah ±${Math.round(GENDER_STRICT_MS / 1000)} detik.</i>`
                      : `<i>Jika target belum online, kamu akan dihubungkan ke user yang belum mengatur gender.</i>`)
                : userRegion
                    ? `🌐 <b>Region:</b> ${regionLabel}\n⚡ <i>Priority matching: You'll be matched with someone from the same region first!</i>`
                    : `🌍 <b>Mode:</b> Global Random Match\n<i>💡 Set a region in your Profile /settings to be matched with people from a specific area.</i>`;

            if (!silent) {
                bot.editMessageText(
                    `⏳ <b>WAITING FOR A MATCH...</b>\n<code>━━━━━━━━━━━━━━━━━━━━</code>\n\n📡 <i>You're in the queue. Hang tight!</i>\n\n${queueNote}\n\n<i>You'll be connected automatically when someone joins!</i>\n\n<code>━━━━━━━━━━━━━━━━━━━━</code>\n🛑 /stop untuk batal`,
                    { chat_id: chatId, message_id: searchMsg.message_id, parse_mode: 'HTML' }
                ).catch(() => { });
            }

            await removeFromAllQueues(chatId);
            await removeFromRegionQueues(chatId);
            await enqueue('general', chatId, {
                gender: user.gender,
                age: user.age,
                region: userRegion || null,
                targetGender,
                strictUntil,
                searchMsgId: searchMsg.message_id,
                joinedAt: Date.now(),
            });
            return;
        }
    }

    if (matchedCandidate) {
        partnerId = matchedCandidate.id;
        partnerSearchMsgId = matchedCandidate.searchMsgId;
    }

    // ══════════════════════════════════════════════════════════
    // FASE 3: MATCH FOUND — hapus pesan searching, kirim PARTNER FOUND
    // ══════════════════════════════════════════════════════════
    if (partnerId && partnerId !== chatId) {
        const myMsgId = searchMsgMap.get(chatId) || await getRemoteSearchMsgId(chatId) || searchMsg.message_id;
        const partnerMsgId = partnerSearchMsgId || searchMsgMap.get(partnerId) || await getRemoteSearchMsgId(partnerId);

        // Bersihkan kedua user dari semua queues (sudah dilakukan di atas via removeFromAllQueues)
        await removeFromAllQueues(chatId);
        await removeFromRegionQueues(chatId);
        await removeFromAllQueues(partnerId);
        await removeFromRegionQueues(partnerId);

        activeChats.set(chatId, partnerId);
        activeChats.set(partnerId, chatId);
        markPairCooldown(chatId, partnerId);
        ageRegistrationMode.delete(chatId);
        ageRegistrationMode.delete(partnerId);
        searchStartedAt.delete(chatId);
        searchStartedAt.delete(partnerId);
        await clearRemoteSearchState(chatId);
        await clearRemoteSearchState(partnerId);

        const now = Date.now();
        lastMsgTimeMap.set(chatId, now);
        lastMsgTimeMap.set(partnerId, now);
        ghostingWarnedMap.delete(chatId);
        ghostingWarnedMap.delete(partnerId);

        createSession(chatId, partnerId).then(session => {
            if (session && session.id) {
                sessionIdMap.set(chatId, session.id);
                sessionIdMap.set(partnerId, session.id);
            }
        }).catch(() => { });

        const La = getLang(chatId);
        const Lb2 = getLang(partnerId);

        const partnerUser = await getUser(partnerId);
        const partnerIsVip = isPremium(partnerUser);
        const myIsVip = isPremium(user);

        const partnerRegion = partnerUser.region && partnerUser.region !== 'GLOBAL' ? partnerUser.region : null;
        const sameRegion = userRegion && partnerRegion && userRegion === partnerRegion;
        const regionMatchTag = sameRegion
            ? `🌍 <b>Region Match:</b> ${getRegionDisplay(userRegion)} — <i>Same region!</i>\n`
            : '';

        const partnerStatusLabel = partnerIsVip
            ? "👑 <b>[VIP SULTAN]</b>"
            : "👤 <b>[REGULAR]</b>";
        const myStatusLabel = myIsVip
            ? "👑 <b>[VIP SULTAN]</b>"
            : "👤 <b>[REGULAR]</b>";

        const partnerStatusMsg = partnerIsVip
            ? `🎉 <b>CONGRATULATIONS!</b> You are connected with a high-class partner!\n\n` +
            `╔═════════════╗\n` +
            `  ${partnerStatusLabel}\n` +
            `╚═════════════╝\n\n` +
            `${regionMatchTag}` +
            `✨ <i>You are extremely lucky! Your partner is an exclusive <b>VIP SULTAN</b> user. Enjoy a high-quality conversation!</i>\n\n`
            : `✅ <b>Partner found!</b>\n\n` +
            `${partnerStatusLabel}\n` +
            `${regionMatchTag}\n` +
            `<i>You are now connected. Go ahead and say hello to your partner!</i>\n\n`;

        const myStatusMsg = myIsVip
            ? `🎉 <b>CONGRATULATIONS!</b> You are connected with a high-class partner!\n\n` +
            `╔══════════════╗\n` +
            `  ${myStatusLabel}\n` +
            `╚══════════════╝\n\n` +
            `${regionMatchTag}` +
            `✨ <i>You are extremely lucky! Your partner is an exclusive <b>VIP SULTAN</b> user. Enjoy a high-quality conversation!</i>\n\n`
            : `✅ <b>Partner found!</b>\n\n` +
            `${myStatusLabel}\n` +
            `${regionMatchTag}\n` +
            `<i>You are now connected. Go ahead and say hello to your partner!</i>\n\n`;

        const chatHints =
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `🔄 /next — Find a new partner\n` +
            `🛑 /stop — End conversation`;

        const matchOptA = {
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: [
                    [{ text: La.btn_view_partner, callback_data: "view_partner_info" }],
                    [{ text: La.btn_share_username, callback_data: "share_my_username" }],
                ],
            },
        };

        const matchOptB = {
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: [
                    [{ text: Lb2.btn_view_partner, callback_data: "view_partner_info" }],
                    [{ text: Lb2.btn_share_username, callback_data: "share_my_username" }],
                ],
            },
        };

        // Keyboard chat dipasang langsung lewat EDIT di bawah (reply keyboard
        // bersifat chat-level), jadi tidak perlu pesan "Keyboard Cepat Aktif" lagi.

        // ══════════════════════════════════════════════════════════
        // MATCH FOUND! Hapus pesan searching/waiting, kirim PARTNER FOUND
        // ══════════════════════════════════════════════════════════
        searchPhase = 'matched';
        clearSearchAnim(chatId);
        clearSearchAnim(partnerId);

        // 1. Teks Dinamis Untuk Kamu (User A)
        const myMatchNote = userRegion
            ? `🌐 <b>Region:</b> ${regionLabel}\n⚡ <i>Priority matching success!</i>`
            : `🌍 <b>Mode:</b> Global Random Match\n<i>💡 Set a region in your Profile /settings to be matched with people from a specific area.</i>`;

        const myConnectingText = `🎯 <b>PARTNER FOUND!</b> 🎉\n<code>━━━━━━━━━━━━━━━━━━━━</code>\n\n${myMatchNote}\n\n🔗 <i>Establishing encrypted anonymous connection...</i>\n\n⚡ <b>Connecting...</b>`;

        // 2. Teks Dinamis Untuk Partnermu (User B)
        const partnerRegionLabel = partnerRegion ? getRegionDisplay(partnerRegion) : '🌍 Global';
        const partnerMatchNote = partnerRegion
            ? `🌐 <b>Region:</b> ${partnerRegionLabel}\n⚡ <i>Priority matching success!</i>`
            : `🌍 <b>Mode:</b> Global Random Match\n<i>💡 Set a region in your Profile /settings to be matched with people from a specific area.</i>`;

        const partnerConnectingText = `🎯 <b>PARTNER FOUND!</b> 🎉\n<code>━━━━━━━━━━━━━━━━━━━━</code>\n\n${partnerMatchNote}\n\n🔗 <i>Establishing encrypted anonymous connection...</i>\n\n⚡ <b>Connecting...</b>`;

        // ── Anti-spam: pesan SEARCHING/WAITING di-EDIT jadi PARTNER FOUND ──
        // Tidak ada pesan baru di sini, jadi tidak ada notifikasi dobel.
        searchMsgMap.delete(chatId);
        searchMsgMap.delete(partnerId);

        // Cek sesi masih valid (bisa saja user sudah /stop atau /next duluan)
        const pairStillActive = () =>
            activeChats.get(chatId) === partnerId &&
            activeChats.get(partnerId) === chatId;

        // Edit pesan SEARCHING/WAITING → PARTNER FOUND (tanpa pesan baru).
        // Pesan baru hanya dikirim kalau edit gagal (mis. pesan sudah dihapus).
        async function showMatchStatus(targetId, targetMsgId, text, replyMarkup) {
            const extra = { parse_mode: 'HTML', ...(replyMarkup ? { reply_markup: replyMarkup } : {}) };
            if (targetMsgId && await safeEdit(targetId, targetMsgId, text, extra)) {
                return targetMsgId;
            }
            // Edit gagal total → kirim SATU pesan baru lalu hapus pesan lama,
            // supaya chat tetap hanya punya satu pesan status (tidak menumpuk).
            if (targetMsgId) bot.deleteMessage(targetId, targetMsgId).catch(() => { });
            const sent = await bot.sendMessage(targetId, text, extra).catch(() => null);
            return sent && sent.message_id ? sent.message_id : null;
        }

        // Fungsi final: edit ke status lengkap. Kalau gagal → hapus pesan lama
        // lalu kirim sekali saja (tidak pernah mengirim dobel).
        const applyFinalStatus = async (targetId, msgId, text, opts) => {
            if (msgId && await safeEdit(targetId, msgId, text, opts)) return;
            if (msgId) bot.deleteMessage(targetId, msgId).catch(() => { });
            bot.sendMessage(targetId, text, opts).catch(() => { });
        };

        // Edit #1: status "PARTNER FOUND! Connecting..." + pasang keyboard chat
        const myConnectingMsgId = await showMatchStatus(chatId, myMsgId, myConnectingText, getChatKeyboard());
        const partnerConnectingMsgId = await showMatchStatus(partnerId, partnerMsgId, partnerConnectingText, getChatKeyboard());

        // Pesan "PARTNER FOUND" ini disimpan sebagai banner sesi.
        // Saat sesi berakhir (/stop, /next, partner kabur), banner ini yang
        // di-EDIT menjadi notifikasi berakhir — bukan kirim pesan baru.
        if (myConnectingMsgId) {
            sessionStatusMsgMap.set(chatId, myConnectingMsgId);
            rememberStatusMsg(chatId, myConnectingMsgId);
        }
        if (partnerConnectingMsgId) {
            sessionStatusMsgMap.set(partnerId, partnerConnectingMsgId);
            rememberStatusMsg(partnerId, partnerConnectingMsgId);
        }

        setTimeout(() => {
            // Jika sesi sudah berakhir (mis. user sempat /next atau /stop),
            // jangan ubah/tambah pesan apa pun agar user tidak "kembali" ke sesi lama.
            if (!pairStillActive()) return;

            // Edit #2: status lengkap + tombol inline (tetap di pesan yang sama)
            applyFinalStatus(chatId, myConnectingMsgId, partnerStatusMsg + "\n\n" + chatHints, { parse_mode: "HTML", ...matchOptA });
            applyFinalStatus(partnerId, partnerConnectingMsgId, myStatusMsg + "\n\n" + chatHints, { parse_mode: "HTML", ...matchOptB });
        }, 2500);
    }
    } finally {
        await releaseLock('search', chatId);
    }
}

async function endChatAndSendFeedback(chatId, partnerId, isNext = false) {
    // Idempotent: satu sesi hanya boleh diakhiri SEKALI.
    // Tanpa ini, /next + /stop yang berdekatan bisa mengirim notifikasi dobel.
    const pKey = pairKey(chatId, partnerId);
    if (endingPairs.has(pKey)) return;
    endingPairs.add(pKey);
    setTimeout(() => endingPairs.delete(pKey), 8000).unref?.();

    activeChats.delete(chatId);
    activeChats.delete(partnerId);
    chatMessageMap.delete(chatId);
    chatMessageMap.delete(partnerId);

    rpsMap.delete(chatId); rpsMap.delete(partnerId);
    scrambleMap.delete(chatId); scrambleMap.delete(partnerId);
    guessMap.delete(chatId); guessMap.delete(partnerId);

    lastMsgTimeMap.delete(chatId); lastMsgTimeMap.delete(partnerId);
    ghostingWarnedMap.delete(chatId); ghostingWarnedMap.delete(partnerId);

    const sessionId = sessionIdMap.get(chatId) || sessionIdMap.get(partnerId);
    if (sessionId) {
        closeSession(sessionId).catch(() => { });
        sessionIdMap.delete(chatId);
        sessionIdMap.delete(partnerId);
    }

    const LA = getLang(chatId);
    const LB = getLang(partnerId);

    const msgSender = isNext ? LA.chat_next : LA.chat_ended;
    const msgPartner = LB.partner_left;

    // Hanya user yang menekan /next yang mencari partner baru.
    // Partner cukup diberi tahu sesi berakhir, tanpa auto-search.
    //
    // Anti-spam: notifikasi + tombol feedback digabung jadi SATU pesan
    // (sebelumnya 2 pesan). Saat /next, "Mencari partner baru..." tidak dikirim
    // karena pesan SEARCHING sudah mewakilinya.
    const myFeedbackKb = {
        inline_keyboard: [
            [{ text: "👍 Like", callback_data: `fb_like_${partnerId}` }, { text: "👎 Dislike", callback_data: `fb_dislike_${partnerId}` }],
            [{ text: "🔞 Vulgar", callback_data: `fb_vulgar_${partnerId}` }, { text: "⚠️ Laporkan", callback_data: `fb_report_${partnerId}` }],
        ],
    };
    const partnerFeedbackKb = {
        inline_keyboard: [
            [{ text: "👍 Like", callback_data: `fb_like_${chatId}` }, { text: "👎 Dislike", callback_data: `fb_dislike_${chatId}` }],
            [{ text: "🔞 Vulgar", callback_data: `fb_vulgar_${chatId}` }, { text: "⚠️ Laporkan", callback_data: `fb_report_${chatId}` }],
        ],
    };

    const myText = isNext ? LA.feedback_prompt : `${msgSender}\n\n${LA.feedback_prompt}`;
    const partnerText = `${msgPartner}\n\n${LB.feedback_prompt}`;

    // Kirim notifikasi berakhir + tombol feedback dengan cara PALING HEMAT:
    // 1) edit banner "PARTNER FOUND" sesi ini (tidak ada pesan baru sama sekali)
    // 2) kalau tidak ada banner, edit pesan status terakhir
    // 3) terakhir baru kirim pesan baru
    const deliverSessionEnd = async (uid, text, kb, asNext) => {
        const opts = { parse_mode: "Markdown", reply_markup: kb };
        const banner = sessionStatusMsgMap.get(uid);
        sessionStatusMsgMap.delete(uid);

        if (banner && await safeEdit(uid, banner, text, opts)) {
            // Untuk /next: feedback JANGAN dipakai ulang untuk SEARCHING,
            // biar tombol feedback tetap bisa ditekan.
            if (asNext) forgetStatusMsg(uid, banner);
            else rememberStatusMsg(uid, banner);
            return;
        }

        if (asNext) {
            const sent = await bot.sendMessage(uid, text, opts).catch(() => null);
            if (sent && sent.message_id) forgetStatusMsg(uid, sent.message_id);
            return;
        }

        // Bukan /next → boleh edit pesan status terakhir (mis. reminder /start)
        const prev = statusMsgMap.get(uid);
        if (prev && prev.id !== banner && await safeEdit(uid, prev.id, text, opts)) {
            statusMsgMap.set(uid, { id: prev.id, at: Date.now() });
            return;
        }

        const sent = await bot.sendMessage(uid, text, opts).catch(() => null);
        if (sent && sent.message_id) rememberStatusMsg(uid, sent.message_id);
    };

    await deliverSessionEnd(chatId, myText, myFeedbackKb, isNext);
    await deliverSessionEnd(partnerId, partnerText, partnerFeedbackKb, false);

    clearSearchAnim(chatId);
    clearSearchAnim(partnerId);
    searchMsgMap.delete(chatId);
    searchStartedAt.delete(chatId);
    searchMsgMap.delete(partnerId);
    searchStartedAt.delete(partnerId);
    await clearRemoteSearchState(chatId);
    await clearRemoteSearchState(partnerId);
}

bot.on("message", async (msg) => {
    const chatId = msg.chat.id;

    // Sedang di sesi /broadcastdeveloper (input PIN / isi pesan) →
    // JANGAN diteruskan ke partner chat.
    if (devBcSessions.has(chatId)) return;

    // Abaikan semua command slash KECUALI /batal saat mode input usia aktif
    if (msg.text && msg.text.startsWith("/")) {
        const isBatal = msg.text.trim().toLowerCase() === "/batal";
        const inAgeMode = ageRegistrationMode.has(chatId);
        if (!isBatal || !inAgeMode) return;
    }

    if (msg.text) {
        const txt = msg.text.trim();

        if (txt === "🔄 Next Partner") {
            if (!activeChats.has(chatId) && isSearchActive(chatId)) return;
            if (!(await acquireLock('action', chatId))) return;
            try {
                if (activeChats.has(chatId)) {
                    const pid = activeChats.get(chatId);
                    await endChatAndSendFeedback(chatId, pid, true);
                }
                await cancelSearch(chatId);
                if (!isSearchActive(chatId)) {
                    await startSearch(chatId, "search_random", null);
                }
            } finally {
                await releaseLock('action', chatId);
            }
            return;
        }

        if (txt === "🔍 Find Friend") {
            if (activeChats.has(chatId)) {
                return pushStatus(
                    chatId,
                    "❌ You're already in a chat! Type /stop to end it first.",
                    { reply_markup: getChatKeyboard() },
                );
            }
            if (await checkBan(chatId)) return;
            startSearch(chatId, "search_random", null);
            return;
        }

        if (txt === "🏠 Main Menu") {
            if (await checkBan(chatId)) return;
            sendMainMenu(chatId, null, null);
            return;
        }

        if (txt === "💎 Upgrade VIP") {
            return sendVipMenu(chatId);
        }

        if (txt === "🌐 Ganti Bahasa" || txt === "🌐 Change Language" || txt === "🌐 Change Settings") {
            return sendSettingsPage(chatId);
        }

        if (txt === "🛑 Stop Chat") {
            if (!(await acquireLock('action', chatId))) return;
            try {
                if (activeChats.has(chatId)) {
                    const pid = activeChats.get(chatId);
                    await endChatAndSendFeedback(chatId, pid, false);
                } else {
                    // Bersihkan animasi + pesan searching + antrean (termasuk Redis)
                    await cancelSearch(chatId);
                let stopText = `🛑 <b>RADAR DIMATIKAN</b> 🛑\n`;
                stopText += `<code>━━━━━━━━━━━━━━━━━━━━</code>\n\n`;
                stopText += `📡 <i>Pencarian dibatalkan. Sistem matchmaking telah dihentikan sementara.</i>\n\n`;
                stopText += `Istirahat sejenak? Ribuan teman ngobrol seru masih standby 24/7 menunggumu di dalam jaringan.\n\n`;
                stopText += `💡 <i>Ketik /search atau /next kapan saja untuk menyalakan ulang radar, atau gunakan tombol di bawah:</i>`;

                const stopOptions = {
                    parse_mode: "HTML",
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    text: "🚀 Lanjut Cari Teman (Next)",
                                    callback_data: "search_random",
                                },
                            ],
                            [
                                {
                                    text: "🏠 Buka Menu Utama",
                                    callback_data: "back_to_main",
                                },
                            ],
                        ],
                    },
                };

                await pushStatus(chatId, stopText, stopOptions);
                }
            } finally {
                await releaseLock('action', chatId);
            }
            return;
        }



        if (txt === "👤 Info Partner") {
            const pid = activeChats.get(chatId);
            if (!pid)
                return bot.sendMessage(
                    chatId,
                    "❌ Kamu tidak sedang dalam obrolan!",
                );

            const u = await getUser(chatId);
            const prem = isPremium(u);

            const hasUnlocked = unlockedPartnerInfo.get(chatId) === pid;

            if (!prem && !hasUnlocked) {
                return bot.sendMessage(
                    chatId,
                    "🔒 <b>INFO TERKUNCI!</b>\n\nInfo lengkap partner adalah fitur eksklusif pengguna <b>VIP/Premium</b> atau buka akses satu kali pakai koin.\n\n👇 <i>Klik tombol di bawah untuk membuka brankas info!</i>",
                    {
                        parse_mode: "HTML",
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    {
                                        text: "🔓 Buka Info (Bayar/Upgrade)",
                                        callback_data: "view_partner_info",
                                    },
                                ],
                            ],
                        },
                    },
                );
            }

            const partnerData = await getUser(pid);

            const pName = partnerData.first_name || "Anonim";
            const pGender =
                partnerData.gender === "M"
                    ? "Laki-laki 👦"
                    : partnerData.gender === "F"
                        ? "Perempuan 👧"
                        : "Rahasia ❓";
            const pAge = partnerData.age
                ? `${partnerData.age} Tahun`
                : "Belum diatur ❓";
            const pRating = partnerData.rating || 0;
            const pStatus = isPremium(partnerData)
                ? "👑 VIP SULTAN"
                : "⚪ REGULER";

            const infoText =
                `🕵️‍♂️ <b>DATA RAHASIA LAWAN BICARA</b> 🕵️‍♀️\n` +
                `━━━━━━━━━━━━━━━━━━━━\n\n` +
                `💠 <b>ID:</b> <code>${partnerData.telegram_id}</code>\n` +
                `👤 <b>Nama:</b> ${pName}\n` +
                `🚻 <b>Gender:</b> ${pGender}\n` +
                `🎂 <b>Usia:</b> ${pAge}\n\n` +
                `📊 <b>Reputasi (Rating):</b> ${pRating > 0 ? "+" : ""}${pRating} Poin\n` +
                `🌟 <b>Status Akun:</b> ${pStatus}\n\n` +
                `━━━━━━━━━━━━━━━━━━━━\n` +
                `<i>Sistem Enkripsi Anonymous Chat Expert</i>`;

            return bot.sendMessage(chatId, infoText, { parse_mode: "HTML" });
        }

        if (txt === "🚻 Search by Gender") {
            const uGender = await getUser(chatId);
            const isPrem = isPremium(uGender);

            const genderMenuTxt =
                `🚻 <b>SEARCH BY GENDER</b> 🚻\n━━━━━━━━━━━━━━━━━━━━\n\n` +
                `Fitur ini memungkinkan Anda untuk memilih mencari lawan bicara secara spesifik berdasarkan jenis kelamin Laki-laki atau Perempuan.\n\n` +
                `👑 <b>Syarat Akses:</b> Fitur ini eksklusif untuk pengguna VIP/Premium.\n` +
                `Status Anda: ${isPrem ? "✅ <b>VIP</b>" : "❌ <b>Reguler</b>"}\n\n` +
                `<i>Pilih jenis kelamin partner yang ingin dicari:</i>`;

            return bot.sendMessage(chatId, genderMenuTxt, {
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: "👨 Pria (Male)", callback_data: "chat_gender_male" },
                            { text: "👩 Wanita (Female)", callback_data: "chat_gender_female" }
                        ]
                    ]
                }
            });
        }

        if (txt === "🎯 Cari Sesuai Usia" || txt === "🎯 Search by Age") {
            const uAge = await getUser(chatId);
            if (!uAge.age) {
                ageRegistrationMode.set(chatId, 'register');
                return bot.sendMessage(
                    chatId,
                    "⚠️ <b>USIA BELUM DIATUR!</b>\nSilakan ketik usia kamu dalam bentuk angka (Contoh: 18) di chat ini sekarang:",
                    { parse_mode: "HTML" },
                );
            }

            const isPrem = isPremium(uAge);

            if (!isPrem) {
                return bot.sendMessage(
                    chatId,
                    "🔒 <b>FITUR PREMIUM!</b>\n\nPencarian spesifik berdasarkan usia eksklusif untuk pengguna <b>VIP/Premium</b>.\n\n👇 <i>Upgrade akunmu sekarang untuk membuka semua fitur eksklusif tanpa batas!</i>",
                    {
                        parse_mode: "HTML",
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    {
                                        text: "🌟 Upgrade Premium / VIP Sekarang!",
                                        callback_data: "buy_premium",
                                    },
                                ],
                            ],
                        },
                    },
                );
            }

            const ageMenuTxt =
                `🎯 <b>RADAR USIA SPESIFIK</b> 🎯\n━━━━━━━━━━━━━━━━━━━━\n\n` +
                `Usia kamu saat ini: <b>${uAge.age} Tahun</b>\n` +
                `Pilih kriteria rentang usia target yang ingin kamu temukan.\n\n` +
                `✅ <b>Status:</b> Premium (Gratis)\n\n` +
                `Developer By: Raihan_official0307\n` +
                `<i>Pilih opsi di bawah ini untuk memulai pencarian:</i>`;

            return bot.sendMessage(chatId, ageMenuTxt, {
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: `🎯 Sama (Usia ${uAge.age})`,
                                callback_data: `search_age_exact`,
                            },
                        ],
                        [
                            {
                                text: `⬆️ Lebih Tua (${uAge.age + 1} - ${Math.min(99, uAge.age + 5)})`,
                                callback_data: `search_age_older`,
                            },
                        ],
                        [
                            {
                                text: `⬇️ Lebih Muda (${Math.max(12, uAge.age - 5)} - ${uAge.age - 1})`,
                                callback_data: `search_age_younger`,
                            },
                        ],
                        [{ text: "🔙 Batal", callback_data: "back_to_main" }],
                    ],
                },
            });
        }

        // Megaphone and Global Megaphone handlers removed


        if (txt === "💌 Kenalkan Diri") {
            const pid = activeChats.get(chatId);
            if (!pid)
                return bot.sendMessage(
                    chatId,
                    "❌ Kamu tidak sedang dalam obrolan!",
                );
            const u = await getUser(chatId);
            const uname = u.username
                ? `@${u.username}`
                : "(username tersembunyi)";
            const introMsg =
                `💌 <b>ADA YANG INGIN BERKENALAN!</b>\n\n` +
                `Partner-mu menyapa dan mengajak kenalan:\n\n` +
                `<i>"Hai! Aku penasaran sama kamu. Cari aku di Telegram: ${uname}"</i>\n\n` +
                `<i>Klik username di atas jika kamu tertarik untuk lanjut ngobrol di luar sini!</i>`;
            bot.sendMessage(
                chatId,
                `✅ Perkenalanmu berhasil dikirim ke partner!`,
            );
            bot.sendMessage(pid, introMsg, { parse_mode: "HTML" });
            return;
        }

        if (txt === "🎰 Main Slot") {
            const pid = activeChats.get(chatId);
            if (!pid)
                return bot.sendMessage(
                    chatId,
                    "❌ Kamu tidak sedang dalam obrolan!",
                );

            const initMsg =
                `🎰 <b>MESIN SLOT CHAT!</b> 🎰\n\n` +
                `┌─────────────┐\n` +
                `│  ❓  │  ❓  │  ❓  │\n` +
                `└─────────────┘\n\n` +
                `<i>Siap menguji kekompakan kalian? Tekan tombol SPIN di bawah!</i>`;

            return bot.sendMessage(chatId, initMsg, {
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "🔄 SPIN SEKARANG!",
                                callback_data: "spin_slot",
                            },
                        ],
                    ],
                },
            });
        }

        if (txt === "🪨 Batu Gunting Kertas") {
            const pid = activeChats.get(chatId);
            if (!pid)
                return bot.sendMessage(chatId, "❌ Kamu tidak sedang dalam obrolan! Cari partner dulu.");
            if (rpsMap.has(chatId) && rpsMap.get(chatId).choice) {
                return bot.sendMessage(chatId, "⏳ <i>Kamu sudah memilih! Menunggu partner...</i>", { parse_mode: "HTML" });
            }
            return bot.sendMessage(chatId,
                `🪨✂️📄 <b>BATU GUNTING KERTAS!</b>\n━━━━━━━━━━━━━━━━━━━━\n\nUji nasibmu! Pilih gerakanmu, jangan sampai partner tahu! 🤫\n\n<i>Pilih salah satu tombol di bawah:</i>`,
                {
                    parse_mode: "HTML",
                    reply_markup: {
                        inline_keyboard: [[
                            { text: "🪨 Batu", callback_data: "rps_pick_batu" },
                            { text: "✂️ Gunting", callback_data: "rps_pick_gunting" },
                            { text: "📄 Kertas", callback_data: "rps_pick_kertas" },
                        ]]
                    }
                }
            );
        }

        if (txt === "🔤 Tebak Kata") {
            const pid = activeChats.get(chatId);
            if (!pid)
                return bot.sendMessage(chatId, "❌ Kamu tidak sedang dalam obrolan! Cari partner dulu.");
            if (scrambleMap.has(chatId) || scrambleMap.has(pid)) {
                return bot.sendMessage(chatId, "⏳ <i>Game Tebak Kata sedang berlangsung! Tebak kata yang ada dulu.</i>", { parse_mode: "HTML" });
            }
            const word = KATA_LIST[Math.floor(Math.random() * KATA_LIST.length)];
            const scrambled = scrambleWord(word);
            scrambleMap.set(chatId, { word, pid });
            scrambleMap.set(pid, { word, pid: chatId });
            const scrambleMsg =
                `🔤 <b>TEBAK KATA!</b>\n━━━━━━━━━━━━━━━━━━━━\n\nKata teracak:\n\n<code>${scrambled}</code>\n\n<i>Siapa yang bisa menebak kata aslinya pertama? Ketik jawabanmu sekarang!</i>`;
            bot.sendMessage(chatId, scrambleMsg, {
                parse_mode: "HTML",
                reply_markup: { inline_keyboard: [[{ text: "⏭️ Skip Kata Ini", callback_data: "scramble_skip" }]] }
            });
            bot.sendMessage(pid, scrambleMsg, {
                parse_mode: "HTML",
                reply_markup: { inline_keyboard: [[{ text: "⏭️ Skip Kata Ini", callback_data: "scramble_skip" }]] }
            });
            return;
        }

        if (txt === "🎯 Tebak Angka") {
            const pid = activeChats.get(chatId);
            if (!pid)
                return bot.sendMessage(chatId, "❌ Kamu tidak sedang dalam obrolan! Cari partner dulu.");
            if (guessMap.has(chatId) || guessMap.has(pid)) {
                return bot.sendMessage(chatId, "⏳ <i>Game Tebak Angka sedang berlangsung! Tebak angkanya dulu.</i>", { parse_mode: "HTML" });
            }
            const number = Math.floor(Math.random() * 100) + 1;
            guessMap.set(chatId, { number, pid });
            guessMap.set(pid, { number, pid: chatId });
            const guessMsg =
                `🎯 <b>TEBAK ANGKA!</b>\n━━━━━━━━━━━━━━━━━━━━\n\nAku sedang memikirkan sebuah angka antara <b>1 - 100</b>.\n\n<i>Siapa yang bisa menebaknya pertama? Ketik tebakan angkamu sekarang!</i>\n\n💡 Bot akan memberikan petunjuk: terlalu tinggi atau terlalu rendah.`;
            bot.sendMessage(chatId, guessMsg, {
                parse_mode: "HTML",
                reply_markup: { inline_keyboard: [[{ text: "🏳️ Menyerah (Lihat Jawaban)", callback_data: "guess_giveup" }]] }
            });
            bot.sendMessage(pid, guessMsg, {
                parse_mode: "HTML",
                reply_markup: { inline_keyboard: [[{ text: "🏳️ Menyerah (Lihat Jawaban)", callback_data: "guess_giveup" }]] }
            });
            return;
        }

        if (
            txt.includes("Quiz") ||
            txt.includes("Kuiz") ||
            txt.includes("مسابقة") ||
            txt.includes("问答")
        ) {
            const pid = activeChats.get(chatId);
            if (!pid)
                return bot.sendMessage(
                    chatId,
                    "❌ <b>Kamu tidak sedang dalam obrolan!</b>",
                    { parse_mode: "HTML" },
                );

            if (activeQuizzes.has(chatId) || activeQuizzes.has(pid)) {
                return bot.sendMessage(
                    chatId,
                    "⏳ <i>Kuis sedang berlangsung, selesaikan dulu!</i>",
                    { parse_mode: "HTML" },
                );
            }

            const userLangCode = userLang.get(chatId) || "id";

            const rawQuiz =
                QUIZ_LIST[Math.floor(Math.random() * QUIZ_LIST.length)];
            const quiz = rawQuiz[userLangCode] || rawQuiz["id"];
            const shuffled = [...quiz.choices].sort(() => Math.random() - 0.5);
            const correctIndex = shuffled.indexOf(quiz.a);
            const labels = ["A", "B", "C", "D"];

            let baseText = `❓ <b>QUIZ CEPAT!</b>\n━━━━━━━━━━━━━━━━━━━━\n\n`;
            baseText += `<b>${quiz.q}</b>\n\n`;
            shuffled.forEach((c, i) => {
                baseText += `<b>${labels[i]}.</b> ${c}\n`;
            });
            const kb = [
                [
                    { text: "A", callback_data: `qzans_${chatId}_0` },
                    { text: "B", callback_data: `qzans_${chatId}_1` },
                ],
                [
                    { text: "C", callback_data: `qzans_${chatId}_2` },
                    { text: "D", callback_data: `qzans_${chatId}_3` },
                ],
            ];

            const initialText = `${baseText}\n⏳ <b>Sisa Waktu:</b> 15 detik`;
            Promise.all([
                bot.sendMessage(chatId, initialText, {
                    parse_mode: "HTML",
                    reply_markup: { inline_keyboard: kb },
                }),
                bot.sendMessage(pid, initialText, {
                    parse_mode: "HTML",
                    reply_markup: { inline_keyboard: kb },
                }),
            ]).then(([msgA, msgB]) => {
                const qSession = {
                    baseText,
                    msgIdA: msgA.message_id,
                    msgIdB: msgB.message_id,
                    pid: pid,
                    correctAnswer: correctIndex,
                    correctText: quiz.a,
                    timeLeft: 15,
                    answered: false,
                };

                activeQuizzes.set(chatId, qSession);
                activeQuizzes.set(pid, chatId);
                const timer = setInterval(() => {
                    qSession.timeLeft -= 3;
                    if (qSession.answered) {
                        clearInterval(timer);
                        return;
                    }
                    if (qSession.timeLeft <= 0) {
                        clearInterval(timer);
                        activeQuizzes.delete(chatId);
                        activeQuizzes.delete(pid);

                        const timeoutMsg = `${baseText}\n\n⏰ <b>WAKTU HABIS!</b>\nTidak ada yang berhasil menjawab. Jawaban yang benar adalah: <b>${quiz.a}</b>`;
                        bot.editMessageText(timeoutMsg, {
                            chat_id: chatId,
                            message_id: qSession.msgIdA,
                            parse_mode: "HTML",
                        }).catch(() => { });
                        bot.editMessageText(timeoutMsg, {
                            chat_id: pid,
                            message_id: qSession.msgIdB,
                            parse_mode: "HTML",
                        }).catch(() => { });
                    } else {
                        const updateMsg = `${baseText}\n⏳ <b>Sisa Waktu:</b> ${qSession.timeLeft} detik`;
                        bot.editMessageText(updateMsg, {
                            chat_id: chatId,
                            message_id: qSession.msgIdA,
                            parse_mode: "HTML",
                            reply_markup: { inline_keyboard: kb },
                        }).catch(() => { });
                        bot.editMessageText(updateMsg, {
                            chat_id: pid,
                            message_id: qSession.msgIdB,
                            parse_mode: "HTML",
                            reply_markup: { inline_keyboard: kb },
                        }).catch(() => { });
                    }
                }, 3000);
            });
            return;
        }

        if (ageRegistrationMode.has(chatId) && msg.text && !activeChats.has(chatId)) {
            const modeStatus = ageRegistrationMode.get(chatId);

            // Handle /batal untuk semua mode
            if (msg.text.trim().toLowerCase() === "/batal") {
                ageRegistrationMode.delete(chatId);
                if (modeStatus === "update") {
                    bot.sendMessage(chatId, "✅ <b>Dibatalkan.</b> Usia kamu tidak jadi diubah.", { parse_mode: "HTML" });
                    return sendMainMenu(chatId, null, await getUser(chatId));
                } else {
                    bot.sendMessage(chatId, "✅ <b>Input usia dilewati.</b> Kamu bisa mengaturnya kapan saja di /settings.", { parse_mode: "HTML" });
                    return sendMainMenu(chatId, null, await getUser(chatId));
                }
            }

            const age = parseInt(msg.text.trim());

            if (isNaN(age) || age < 12 || age > 99) {
                return bot.sendMessage(
                    chatId,
                    "❌ Usia tidak valid! Mohon ketik angka yang benar (Contoh: <b>18</b>).\n\n<i>Atau ketik /batal untuk membatalkan.</i>",
                    { parse_mode: "HTML" }
                );
            }

            // Hapus mode SEBELUM operasi DB agar tidak stuck jika error
            ageRegistrationMode.delete(chatId);

            try {
                await supabase.from("users").update({ age: age }).eq("telegram_id", chatId);
                require('./supabase').invalidateUserCache(chatId);
            } catch (dbErr) {
                console.error('[AgeInput] DB update error:', dbErr.message);
            }

            if (modeStatus === "register") {
                const L = getLang(chatId) || {};
                const congratsTemplate = L.age_congrats || `🎉 <b>SETUP SELESAI!</b> 🎉\n<code>━━━━━━━━━━━━━━━━━━━━</code>\n\n✅ <b>Profil berhasil dibuat!</b>\n🎂 Usia: <b>{age} tahun</b> tersimpan!\n\n🚀 Memulai pencarian partner sekarang...`;
                const ageCongratsText = congratsTemplate.replace("{age}", age);

                const congratsMsg = await bot.sendMessage(chatId, ageCongratsText, { parse_mode: "HTML" }).catch(() => null);
                // Pesan congrats dipakai ulang menjadi SEARCHING (di-edit),
                // jadi tidak ada pesan status tambahan.
                return startSearch(chatId, "search_random", null, congratsMsg ? congratsMsg.message_id : null);

            } else if (modeStatus === "update") {
                // Untuk user yang sekadar update umur dari menu Settings
                bot.sendMessage(
                    chatId,
                    `✅ <b>BERHASIL!</b>\nData usia kamu telah diperbarui menjadi <b>${age} Tahun</b>.`,
                    { parse_mode: "HTML" },
                );
                return sendMainMenu(chatId, null, await getUser(chatId));

            } else {
                // Fallback aman jika terjadi sesuatu di luar skenario
                return startSearch(chatId, "search_random", null);
            }
        }

        if (txt === "🏠 Menu Utama" || txt === "🪪 Profil Saya" || txt === "🪪 My Profile") {
            const u = await getUser(chatId);
            return sendMainMenu(chatId, null, u);
        }
        if (txt === "🔍 Cari Teman" || txt === "🔍 Find Friend") {
            return startSearch(chatId, "search_random", null);
        }
        if (txt === "🍾 Pesan Botol") {
            const uBot = await getUser(chatId);
            const Lb = getLang(chatId);
            const premBot = isPremium(uBot);
            const usage = bottleUsageInfo(chatId);
            const limitLine = premBot
                ? `🔓 <b>Limit:</b> ∞ Tidak Terbatas (Premium)\n`
                : `📊 <b>Limit Hari Ini:</b> ${usage.used}/${usage.limit}` +
                (usage.extra > 0 ? ` | ➕ ${usage.extra} extra\n` : `\n`);
            return bot.sendMessage(
                chatId,
                Lb.bottle_menu + `\n\n${limitLine}`,
                {
                    parse_mode: "HTML",
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    text: Lb.btn_write_bottle,
                                    callback_data: "do_bottle",
                                },
                            ],
                            [
                                {
                                    text: "🛒 Beli Botol (2 Koin/botol)",
                                    callback_data: "buy_bottle",
                                },
                            ],
                            [
                                {
                                    text: Lb.btn_back,
                                    callback_data: "back_to_main",
                                },
                            ],
                        ],
                    },
                },
            );
        }





        if (txt === "💎 Upgrade VIP") {
            return sendVipMenu(chatId);
        }
        if (txt === "🎫 Redeem Kode" || txt === "🎫 Redeem Code") {
            return bot.sendMessage(
                chatId,
                `🎫 <b>REDEEM KODE</b>\n\nPunya kode hadiah? Kirim dengan format:\n<code>/redeem KODEKAMU</code>`,
                { parse_mode: "HTML" },
            );
        }
        if (txt === "🌐 Ganti Bahasa" || txt === "🌐 Change Language" || txt === "🌐 Change Settings") {
            return sendSettingsPage(chatId);
        }
        if (txt === "📋 Semua Fitur" || txt === "📋 All Features") {
            const featText =
                `📋 <b>SEMUA FITUR &amp; PANDUAN</b>\n━━━━━━━━━━━━━━━━━━━━\n\n` +
                `🔍 <b>Cari Teman</b> — Cocok secara acak\n` +
                `🔄 <b>Next Partner</b> — Ganti partner langsung\n` +
                `🛑 <b>Stop Chat</b> — Akhiri obrolan\n` +
                `💬 <b>Reply Pesan</b> — Reply pesan partner = muncul kutipan\n` +

                `💎 <b>Upgrade VIP</b> — Fitur eksklusif VIP Sultan\n` +
                `🌐 <b>Change Settings</b> — Profil, bahasa & region\n\n` +
                `━━━━━━━━━━━━━━━━━━━━\n` +
                `<i>💡 Semua fitur menjaga privasi & keamananmu sepenuhnya!</i>`;
            return bot.sendMessage(chatId, featText, { parse_mode: "HTML" });
        }
    }

    // bottleMode removed

    const now = Date.now();
    let tracker = spamMap.get(chatId) || {
        count: 0,
        lastTime: now,
        strikes: 0,
        freezeUntil: 0,
    };

    if (now < tracker.freezeUntil) {
        return;
    }

    if (now - tracker.lastTime < 1500) {
        tracker.count++;
    } else {
        tracker.count = 1;
    }
    tracker.lastTime = now;
    spamMap.set(chatId, tracker);

    if (tracker.count >= 5) {
        tracker.strikes++;
        tracker.count = 0;

        if (tracker.strikes >= 3) {
            await supabase
                .from("users")
                .update({ is_banned: true })
                .eq("telegram_id", chatId);
            bot.sendMessage(
                chatId,
                "🚫 <b>BANNED PERMANEN</b> 🚫\n\nAkunmu otomatis diblokir oleh sistem karena melakukan spamming berulang kali (3x Strike).",
                { parse_mode: "HTML" },
            );
            if (activeChats.has(chatId)) {
                const partnerId = activeChats.get(chatId);
                endChatAndSendFeedback(chatId, partnerId, false);
            }
            return;
        } else {
            tracker.freezeUntil = now + 30000;
            spamMap.set(chatId, tracker);

            bot.sendMessage(
                chatId,
                `❄️ <b>AKUN DIBEKUKAN SEMENTARA (STRIKE ${tracker.strikes}/3)</b> ❄️\n\nKamu mengirim pesan dengan tidak wajar. Akunmu dibekukan selama 30 detik!\n<i>Peringatan: Jangan terlalu sering spam atau akunmu akan otomatis terbanned.</i>`,
                { parse_mode: "HTML" },
            );

            if (activeChats.has(chatId)) {
                const partnerId = activeChats.get(chatId);
                bot.sendMessage(
                    partnerId,
                    `❄️ <i>Teman obrolanmu sedang dibekukan oleh sistem selama 30 detik karena terdeteksi melakukan tindakan spamming. Harap bersabar...</i>`,
                    { parse_mode: "HTML" },
                );
            }
            return;
        }
    }

    if (activeChats.has(chatId)) {
        const partnerId = activeChats.get(chatId);

        // Validasi pasangan: kalau mapping sudah tidak simetris, berarti sesi ini
        // sudah berakhir dan pesan tidak boleh dikirim ke partner lama.
        if (activeChats.get(partnerId) !== chatId) {
            activeChats.delete(chatId);
            if (!isSearchActive(chatId)) {
                bot.sendMessage(
                    chatId,
                    "⚠️ <i>Sesi obrolan sebelumnya sudah berakhir.</i>\n\nKetik /next atau tekan 🔍 Find Friend untuk mencari partner baru.",
                    { parse_mode: "HTML", reply_markup: getMainKeyboard() },
                ).catch(() => { });
            }
            return;
        }

        const user = await getUser(chatId);
        const prem = isPremium(user);

        if (msg.text) {
            const nowFlood = Date.now();
            const flood = msgFloodMap.get(chatId) || { count: 0, resetAt: nowFlood + 3000, blockUntil: 0 };

            if (nowFlood < flood.blockUntil) {
                return; // Masih dalam masa penahanan 10 detik
            }

            if (nowFlood > flood.resetAt) {
                flood.count = 0;
                flood.resetAt = nowFlood + 3000;
            }
            flood.count++;

            if (flood.count > 8) {
                flood.blockUntil = nowFlood + 10000; // Tahan 10 detik
                msgFloodMap.set(chatId, flood);
                const L = getLang(chatId) || {};
                const floodMsg = L.flood_warning || "🤫 Sssttt! Kamu mengetik terlalu cepat. Pesanmu ditahan selama 10 detik agar partner-mu bisa membaca dengan santai.";
                bot.sendMessage(chatId, floodMsg, { parse_mode: "HTML" });
                return;
            }
            msgFloodMap.set(chatId, flood);
        }

        if (msg.text && scrambleMap.has(chatId)) {
            const gameData = scrambleMap.get(chatId);
            const guess = msg.text.trim().toUpperCase();
            if (guess === gameData.word) {
                scrambleMap.delete(chatId);
                scrambleMap.delete(gameData.pid);
                const winMsg = `🎉 <b>BENAR!</b> Selamat, kamu berhasil menebak kata <b>${gameData.word}</b>!`;
                const loseMsg = `😮 <b>Aduh!</b> Partnermu berhasil menebak kata <b>${gameData.word}</b> sebelum kamu!`;
                bot.sendMessage(chatId, winMsg, { parse_mode: "HTML" });
                bot.sendMessage(gameData.pid, loseMsg, { parse_mode: "HTML" });
                return;
            } else {
                bot.sendMessage(chatId, `❌ Bukan itu! Coba lagi...`, { parse_mode: "HTML" });
                return;
            }
        }

        if (msg.text && guessMap.has(chatId)) {
            const gameData = guessMap.get(chatId);
            const guess = parseInt(msg.text.trim());
            if (!isNaN(guess)) {
                if (guess === gameData.number) {
                    guessMap.delete(chatId);
                    guessMap.delete(gameData.pid);
                    const winMsg = `🎯 <b>BENAR!</b> Selamat! Angkanya memang <b>${gameData.number}</b>! Kamu yang pertama menebak! 🏆`;
                    const loseMsg = `😮 <b>Aduh!</b> Partnermu berhasil menebak angka <b>${gameData.number}</b> lebih dulu!`;
                    bot.sendMessage(chatId, winMsg, { parse_mode: "HTML" });
                    bot.sendMessage(gameData.pid, loseMsg, { parse_mode: "HTML" });
                } else if (guess < gameData.number) {
                    bot.sendMessage(chatId, `📈 <b>${guess}</b> terlalu kecil! Coba lebih tinggi.`, { parse_mode: "HTML" });
                } else {
                    bot.sendMessage(chatId, `📉 <b>${guess}</b> terlalu besar! Coba lebih rendah.`, { parse_mode: "HTML" });
                }
                return;
            }
        }

        if (msg.text) {
            let textToSend = msg.text;
            let isCensored = false;
            let rejectReason = "";

            const isOwner =
                chatId.toString() === process.env.OWNER_ID.toString();
            const lowerText = textToSend.toLowerCase();

            // Anti URL / Username
            const hasUrlOrUsername = /(https?:\/\/[^\s]+|@[a-zA-Z0-9_]+)/i.test(textToSend);
            if (hasUrlOrUsername && !isOwner) {
                const now = Date.now();
                let violation = urlViolationMap.get(chatId) || { count: 0, lastPartnerId: null, banUntil: 0 };

                if (now < violation.banUntil) {
                    bot.sendMessage(chatId, "🚫 <b>AKSES DITOLAK</b>\n\nKamu telah diban dari mengirim Link/Username selama 24 jam karena terdeteksi melakukan promosi/spam. Kamu tetap bisa chat biasa.", { parse_mode: "HTML" });
                    return; // Drop message
                }

                if (violation.lastPartnerId !== partnerId) {
                    violation.count++;
                    violation.lastPartnerId = partnerId;

                    if (violation.count >= 4) {
                        violation.banUntil = now + 24 * 60 * 60 * 1000; // 1 day
                        urlViolationMap.set(chatId, violation);
                        bot.sendMessage(chatId, "🚫 <b>BANNED FITUR LINK (24 JAM)</b>\n\nKamu terdeteksi melakukan spam Link/Username ke banyak pengguna secara beruntun. Hak kamu untuk mengirim link dicabut selama 1 hari (24 jam)!", { parse_mode: "HTML" });
                        return; // Drop message
                    } else {
                        urlViolationMap.set(chatId, violation);
                        bot.sendMessage(chatId, `⚠️ <b>PERINGATAN SPAM LINK (${violation.count}/4)</b>\n\nPesan kamu ditangguhkan! Tolong jangan spam Link/Username ke banyak percakapan atau kamu akan dibanned dari mengirim link/username selama 1 hari!`, { parse_mode: "HTML" });
                        return; // Drop message
                    }
                }
            }

            for (const word of badWords) {
                if (lowerText.includes(word)) {
                    isCensored = true;
                    rejectReason = "kata kasar";
                    break;
                }
            }
            if (isCensored) {
                bot.sendMessage(chatId, "⚠️ <i>Pesanmu disensor karena mengandung kata yang dilarang!</i>", { parse_mode: "HTML" });
                textToSend = "🤬 <i>[Pesan disensor]</i>";
            }

            let quotePrefix = "";
            if (msg.reply_to_message) {
                const replyId = msg.reply_to_message.message_id;
                const myMsgMap = chatMessageMap.get(chatId);
                if (myMsgMap && myMsgMap.has(replyId)) {
                    const original = myMsgMap.get(replyId);
                    const shortQuote =
                        original.text.length > 80
                            ? original.text.substring(0, 80) + "..."
                            : original.text;
                    quotePrefix = `💬 <blockquote>${shortQuote}</blockquote>\n`;
                }
            }

            lastMsgTimeMap.set(chatId, Date.now());
            ghostingWarnedMap.delete(chatId);

            // ── Typing Animation: placeholder → edit ke pesan asli ──────
            const Lp = getLang(partnerId);
            const typingText = Lp.partner_typing || '✍️ <i>Partner sedang mengetik...</i>';

            // 1. Kirim placeholder typing
            let placeholderMsg = null;
            try {
                placeholderMsg = await bot.sendMessage(partnerId, typingText, { parse_mode: 'HTML' });
            } catch (e) { /* ignore */ }

            // 2. Tunggu sebentar untuk efek natural
            await new Promise(r => setTimeout(r, 700));

            // 3. Siapkan konten akhir
            const finalContent = prem
                ? `${quotePrefix}👑 <b>[VIP SULTAN]</b>\n<blockquote><i>${textToSend}</i></blockquote>`
                : `${quotePrefix}👤 <b>[REGULER]</b>\n${textToSend}`;

            // 4. Edit placeholder → pesan asli (animasi "mengetik → terkirim")
            let sentMsg;
            if (placeholderMsg) {
                try {
                    sentMsg = await bot.editMessageText(finalContent, {
                        chat_id: partnerId,
                        message_id: placeholderMsg.message_id,
                        parse_mode: 'HTML',
                    });
                } catch (e) {
                    // Fallback jika edit gagal
                    bot.deleteMessage(partnerId, placeholderMsg.message_id).catch(() => { });
                    sentMsg = await bot.sendMessage(partnerId, finalContent, { parse_mode: 'HTML' });
                }
            } else {
                sentMsg = await bot.sendMessage(partnerId, finalContent, { parse_mode: 'HTML' });
            }

            // 5. Simpan mapping untuk fitur reply-quote
            if (!chatMessageMap.has(partnerId)) chatMessageMap.set(partnerId, new Map());
            if (sentMsg && sentMsg.message_id) {
                chatMessageMap.get(partnerId).set(sentMsg.message_id, {
                    text: textToSend,
                    label: prem ? 'VIP' : 'REG',
                });
            }
        } else {
            if (prem) {
                bot.sendMessage(
                    partnerId,
                    `👑 <b>Partner [VIP SULTAN] Anda mengirimkan media</b>`,
                    { parse_mode: "HTML" },
                );
            } else {
                bot.sendMessage(
                    partnerId,
                    `👤 <b>Partner [REGULER] Anda mengirimkan media</b>`,
                    { parse_mode: "HTML" },
                );
            }

            bot.copyMessage(partnerId, chatId, msg.message_id).catch((err) => {
                bot.sendMessage(
                    chatId,
                    "❌ Gagal mengirim file/media ke partner.",
                );
            });
        }
    } else {
        // Anti-spam: kalau user sedang menunggu partner, diamkan saja.
        // Notifikasi "tidak dalam obrolan" maksimal 1x per menit.
        if (isSearchActive(chatId)) return;
        if (await isInQueue(chatId) || await isInRegionQueue(chatId)) return;
        const lastNotice = lastNoChatNotice.get(chatId) || 0;
        if (Date.now() - lastNotice < 60000) return;
        lastNoChatNotice.set(chatId, Date.now());

        // Notifikasi "tidak dalam obrolan" → edit pesan status terakhir bila ada
        await pushStatus(
            chatId,
            "❌ Anda tidak sedang dalam obrolan. Ketik /start untuk menu utama.",
        );
    }
});



setInterval(() => {
    const now = Date.now();
    const THIRTY_MIN = 30 * 60 * 1000;
    const checked = new Set();
    for (const [chatId, partnerId] of activeChats) {
        if (checked.has(chatId) || checked.has(partnerId)) continue;
        checked.add(chatId);
        checked.add(partnerId);
        const lastA = lastMsgTimeMap.get(chatId) || 0;
        const lastB = lastMsgTimeMap.get(partnerId) || 0;
        const lastActivity = Math.max(lastA, lastB);
        if (now - lastActivity > THIRTY_MIN && !ghostingWarnedMap.get(chatId)) {
            // Pastikan sesi masih valid sebelum kirim notifikasi (anti notif nyasar)
            if (activeChats.get(chatId) !== partnerId || activeChats.get(partnerId) !== chatId) continue;
            ghostingWarnedMap.set(chatId, true);
            ghostingWarnedMap.set(partnerId, true);
            const inactiveId = lastA <= lastB ? chatId : partnerId;
            const activeId = lastA <= lastB ? partnerId : chatId;
            bot.sendMessage(activeId,
                `👻 <b>ANTI-GHOSTING ALERT</b>\n<code>━━━━━━━━━━━━━━━━━━━━</code>\n\n⚠️ Partner kamu tidak mengirim pesan selama <b>30 menit</b>.\n\nMau cari partner baru yang lebih aktif?`,
                {
                    parse_mode: "HTML",
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: "🔍 Ya, Cari Partner Baru", callback_data: "antighost_newchat" }],
                            [{ text: "⏳ Tidak, Saya Masih Menunggu", callback_data: "antighost_wait" }],
                        ],
                    },
                }
            ).catch(() => { });
            bot.sendMessage(inactiveId,
                `👻 <b>HEY! Kamu masih di sini?</b>\n<code>━━━━━━━━━━━━━━━━━━━━</code>\n\n😢 Kamu tidak mengirim pesan selama <b>30 menit</b>.\nPartnermu sedang menunggumu — segera balas sebelum mereka pergi!`,
                { parse_mode: "HTML" }
            ).catch(() => { });
        }
    }
}, 5 * 60 * 1000);

// Fallback Radar Usia: Jika sudah > 30 menit, pindah ke random global
setInterval(async () => {
    const now = Date.now();
    for (let i = waitingList.ageList.length - 1; i >= 0; i--) {
        const u = waitingList.ageList[i];
        if (!u || now - (u.joinedAt || now) <= 30 * 60 * 1000) continue;

        // Jangan pindahkan user yang sudah tidak mencari (sudah /stop, /next,
        // atau sudah dapat partner). Ini yang bikin user "balik ke sesi lama".
        if (activeChats.has(u.id) || !isSearchActive(u.id)) continue;

        // Hapus dari ageList via queue function
        await removeFromQueue('age', u.id);

        // Cek ulang setelah await: user bisa saja /stop atau ter-match di sela ini.
        if (activeChats.has(u.id) || !isSearchActive(u.id)) continue;

        // Masukkan ke general queue
        await enqueue('general', u.id, {
            gender: u.gender,
            age: u.age,
            region: u.region || null,
            targetGender: null,
            searchMsgId: u.searchMsgId,
            joinedAt: Date.now()
        });

        bot.sendMessage(u.id,
            `⏳ <b>INFO RADAR USIA</b> ⏳\n<code>━━━━━━━━━━━━━━━━━━━━</code>\n\nMaaf, radar tidak dapat menemukan partner dengan usia yang kamu inginkan selama lebih dari 30 menit.\n\n🔄 <i>Pencarianmu kini telah dialihkan ke mode <b>Global Random Match</b> untuk mempercepat menemukan teman obrolan!</i>`,
            { parse_mode: "HTML" }
        ).catch(() => { });
    }
}, 60000);

// ── Radar Gender ─────────────────────────────────────────────────
// Selama masa tunggu ketat, user hanya bisa dapat gender asli yang dicari.
// Setelah masa itu habis, radar mencoba lagi (ketat dulu) lalu fallback ke
// user yang BELUM mengatur gender — tidak pernah ke gender lain.
setInterval(async () => {
    const now = Date.now();
    for (const item of [...waitingList.general]) {
        if (!item || !item.targetGender) continue;
        if (!item.strictUntil || now < item.strictUntil) continue;
        if (activeChats.has(item.id) || !isSearchActive(item.id)) continue;

        const action = item.targetGender === "M" ? "search_male" : "search_female";
        await startSearch(item.id, action, null, item.searchMsgId || null, {
            force: true,
            silent: true,
            allowFallback: true,
        });
    }
}, 5000).unref?.();

const URL_WEBVIEW_KAMU = process.env.DEV_DOMAIN
    ? `https://${process.env.DEV_DOMAIN}/`
    : "http://localhost:3000/";

setInterval(() => {
    const httpClient = URL_WEBVIEW_KAMU.startsWith("https") ? https : http;
    httpClient
        .get(URL_WEBVIEW_KAMU, (res) => {
            console.log(
                `[Anti-Sleep] Ping internal sukses. Status: ${res.statusCode}`,
            );
        })
        .on("error", (err) => {
            console.log(`[Anti-Sleep] Ping error: ${err.message}`);
        });
}, 280000);

const PORT = process.env.PORT || 3000;

// ── Start polling hanya setelah semua handler terpasang & kita jadi owner ──
(async () => {
    const owned = await claimPollingOwnership();
    if (!owned) {
        console.error('[Bot] ❌ Tidak bisa menjadi polling owner — instance lain masih berjalan. Proses berhenti.');
        process.exit(1);
    }
    bot.startPolling();
    console.log('[Bot] ✅ Polling Telegram dimulai (single owner).');
})();

app.listen(PORT, () => {
    const reset = "\x1b[0m";
    const bold = "\x1b[1m";
    const cyan = "\x1b[36m";
    const green = "\x1b[32m";
    const yellow = "\x1b[33m";
    const magenta = "\x1b[35m";
    const blue = "\x1b[34m";

    const startTimeStr = new Date(APP_START_TIME).toLocaleString("id-ID", {
        timeZone: "Asia/Jakarta",
    });

    console.clear();
    console.log(
        cyan +
        bold +
        "==================================================" +
        reset,
    );
    console.log(
        magenta +
        bold +
        "       🚀 ANONYMOUS CHAT EXPERT STARTED! 🚀      " +
        reset,
    );
    console.log(
        cyan +
        bold +
        "==================================================" +
        reset,
    );

    console.log(green + `[✓] SYSTEM      : ${reset}Bot is Online and Polling`);
    console.log(green + `[✓] DEVELOPER   : ${reset}Bot By Raihan_official0307`);
    console.log(green + `[✓] START TIME  : ${reset}${startTimeStr} WIB`);
    console.log(
        green +
        `[✓] WEBHOOK     : ${reset}Listening on PORT ${bold}${cyan}${PORT}${reset}`,
    );

    const dbStatus = process.env.SUPABASE_URL
        ? `${green}Connected${reset}`
        : `${yellow}Missing URL${reset}`;
    const midtransMode =
        process.env.MIDTRANS_IS_PRODUCTION === "true"
            ? `${magenta}PRODUCTION${reset}`
            : `${yellow}SANDBOX${reset}`;
    const redisStatus = process.env.REDIS_URL
        ? `${green}Enabled (${process.env.REDIS_URL.replace(/:[^:@]+@/, ':****@')})${reset}`
        : `${yellow}In-Memory Fallback (set REDIS_URL untuk Redis)${reset}`;
    const nodeMode = process.env.NODE_ENV === 'production'
        ? `${magenta}PRODUCTION${reset}`
        : `${green}DEVELOPMENT${reset}`;

    console.log(blue + `[i] DATABASE    : ${reset}Supabase (${dbStatus})`);
    console.log(blue + `[i] REDIS       : ${reset}${redisStatus}`);
    console.log(blue + `[i] NODE ENV    : ${reset}${nodeMode}`);
    console.log(
        blue + `[i] OWNER ID    : ${reset}${process.env.OWNER_ID || "Not Set"}`,
    );

    console.log(
        cyan +
        bold +
        "==================================================" +
        reset,
    );
    console.log(
        yellow + "⏳ Waiting for incoming messages or transactions..." + reset,
    );
});
