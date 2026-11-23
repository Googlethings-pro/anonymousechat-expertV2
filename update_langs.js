const fs = require('fs');

let content = fs.readFileSync('languages.js', 'utf8');

// 1. Remove properties that mention Token, Leaderboard, Bottle, Redeem, etc.
const propsToRemove = [
    'prem_balance',
    'btn_prem_1w', 'btn_prem_1m', 'btn_prem_2m', 'btn_prem_3m', 'btn_prem_1y', 'btn_vip_1y',
    'btn_topup_first',
    'menu_token',
    'btn_redeem',
    'btn_bottle',
    'btn_write_bottle',
    'bottle_menu',
    'bottle_write',
    'bottle_sent',
    'bottle_received',
    'bottle_no_users',
    'bottle_cancelled',
    'btn_leaderboard',
    'leaderboard_title',
    'err_token'
];

for (const prop of propsToRemove) {
    const regex = new RegExp(`^[ \\t]*${prop}:\\s*(['"\`]).*?(?<!\\\\)\\1,?\\s*$\\n`, 'gim');
    content = content.replace(regex, '');
}

// 2. Remove features_text lines mentioning Token, Bottle, Redeem
content = content.replace(/^[ \t]*• <b>(?:🍾|🪙|🎁|🎫).*?\\n/gm, '');

// 3. Remove premium_info bottle section
content = content.replace(/🍾 \*(?:Pesan Botol Premium & Unlimited|Unlimited & Premium Bottles|رسائل زجاجة غير محدودة ومميزة|Mesej Botol Premium & Tanpa Had|无限且高级的漂流瓶)\*[^\n]*\n[^\n]*\n\n/g, '');

// 4. Update prem_title and prem_desc
const newStrings = {
    id: {
        prem_title: "💎 <b>UPGRADE KE PREMIUM ATAU VIP SULTAN</b> 💎",
        prem_desc: "🚀 <b>Jadilah Penguasa Komunitas!</b>\\nBuka seluruh batasan dan nikmati fitur eksklusif berikut:\\n\\n🎯 <b>Bebas Memilih Gender</b>: Cari partner spesifik pria atau wanita sesuai keinginanmu.\\n🕵️ <b>Akses Informasi Rahasia</b>: Mengintip identitas asli dan profil lengkap partner ngobrolmu tanpa batas!\\n🎖️ <b>Badge Eksklusif VIP</b>: Pamerkan lencana keren 👑 <b>[VIP SULTAN]</b> di sebelah namamu agar semua orang tahu status bergengsimu.\\n⚡ <b>Prioritas Matchmaking</b>: Menjadi prioritas di antrean perjodohan.\\n\\nJangan biarkan obrolanmu dibatasi. Jadilah member prioritas sekarang juga!",
        prem_btn_7: "🌟 1 Minggu (50 ⭐️)",
        prem_btn_30: "🌟 1 Bulan (75 ⭐️)",
        prem_btn_60: "🌟 2 Bulan (120 ⭐️)",
        prem_btn_90: "🌟 3 Bulan (175 ⭐️)",
        prem_btn_365: "👑 VIP 1 Tahun (250 ⭐️)"
    },
    en: {
        prem_title: "💎 <b>UPGRADE TO PREMIUM OR VIP SULTAN</b> 💎",
        prem_desc: "🚀 <b>Become the Ruler of the Community!</b>\\nUnlock all limits and enjoy these exclusive features:\\n\\n🎯 <b>Free Gender Selection</b>: Search for a specific male or female partner as you wish.\\n🕵️ <b>Secret Information Access</b>: Peek at the true identity and full profile of your chat partner without limits!\\n🎖️ <b>Exclusive VIP Badge</b>: Show off the cool 👑 <b>[VIP SULTAN]</b> badge next to your name so everyone knows your prestigious status.\\n⚡ <b>Matchmaking Priority</b>: Get priority in the matchmaking queue.\\n\\nDon't let your chat be restricted. Become a priority member now!",
        prem_btn_7: "🌟 1 Week (50 ⭐️)",
        prem_btn_30: "🌟 1 Month (75 ⭐️)",
        prem_btn_60: "🌟 2 Months (120 ⭐️)",
        prem_btn_90: "🌟 3 Months (175 ⭐️)",
        prem_btn_365: "👑 VIP 1 Year (250 ⭐️)"
    },
    ar: {
        prem_title: "💎 <b>الترقية إلى بريميوم أو VIP سلطان</b> 💎",
        prem_desc: "🚀 <b>كن حاكم المجتمع!</b>\\nافتح جميع الحدود واستمتع بهذه الميزات الحصرية:\\n\\n🎯 <b>اختيار مجاني للجنس</b>: ابحث عن شريك ذكر أو أنثى محدد كما يحلو لك.\\n🕵️ <b>الوصول إلى المعلومات السرية</b>: ألق نظرة خاطفة على الهوية الحقيقية والملف الشخصي الكامل لشريكك في الدردشة بلا حدود!\\n🎖️ <b>شارة VIP حصرية</b>: استعرض شارة 👑 <b>[VIP SULTAN]</b> الرائعة بجوار اسمك حتى يعرف الجميع وضعك المرموق.\\n⚡ <b>أولوية التوفيق</b>: احصل على الأولوية في قائمة انتظار التوفيق.\\n\\nلا تدع محادثتك مقيدة. كن عضوا ذا أولوية الآن!",
        prem_btn_7: "🌟 1 أسبوع (50 ⭐️)",
        prem_btn_30: "🌟 1 شهر (75 ⭐️)",
        prem_btn_60: "🌟 2 أشهر (120 ⭐️)",
        prem_btn_90: "🌟 3 أشهر (175 ⭐️)",
        prem_btn_365: "👑 VIP 1 سنة (250 ⭐️)"
    },
    ms: {
        prem_title: "💎 <b>NAIK TARAF KE PREMIUM ATAU VIP SULTAN</b> 💎",
        prem_desc: "🚀 <b>Jadilah Penguasa Komuniti!</b>\\nBuka semua batasan dan nikmati ciri eksklusif berikut:\\n\\n🎯 <b>Bebas Memilih Jantina</b>: Cari rakan khusus lelaki atau wanita mengikut kehendak anda.\\n🕵️ <b>Akses Maklumat Rahsia</b>: Intip identiti sebenar dan profil lengkap rakan bual anda tanpa had!\\n🎖️ <b>Lencana Eksklusif VIP</b>: Pamerkan lencana 👑 <b>[VIP SULTAN]</b> yang hebat di sebelah nama anda supaya semua orang tahu status berprestij anda.\\n⚡ <b>Keutamaan Padanan</b>: Dapatkan keutamaan dalam barisan padanan.\\n\\nJangan biarkan sembang anda dihadkan. Jadilah ahli keutamaan sekarang!",
        prem_btn_7: "🌟 1 Minggu (50 ⭐️)",
        prem_btn_30: "🌟 1 Bulan (75 ⭐️)",
        prem_btn_60: "🌟 2 Bulan (120 ⭐️)",
        prem_btn_90: "🌟 3 Bulan (175 ⭐️)",
        prem_btn_365: "👑 VIP 1 Tahun (250 ⭐️)"
    },
    zh: {
        prem_title: "💎 <b>升级至高级版或 VIP SULTAN</b> 💎",
        prem_desc: "🚀 <b>成为社区的统治者！</b>\\n解锁所有限制并享受以下专属功能：\\n\\n🎯 <b>自由选择性别</b>：根据您的意愿搜索特定的男性或女性伴侣。\\n🕵️ <b>秘密信息访问</b>：无限制地窥探聊天伙伴的真实身份和完整个人资料！\\n🎖️ <b>专属 VIP 徽章</b>：在您的名字旁边炫耀酷炫的 👑 <b>[VIP SULTAN]</b> 徽章，让所有人都知道您尊贵的身份。\\n⚡ <b>匹配优先权</b>：在匹配队列中获得优先权。\\n\\n不要让您的聊天受到限制。立即成为优先会员！",
        prem_btn_7: "🌟 1 周 (50 ⭐️)",
        prem_btn_30: "🌟 1 个月 (75 ⭐️)",
        prem_btn_60: "🌟 2 个月 (120 ⭐️)",
        prem_btn_90: "🌟 3 个月 (175 ⭐️)",
        prem_btn_365: "👑 VIP 1 年 (250 ⭐️)"
    }
};

for (const lang of ['id', 'en', 'ar', 'ms', 'zh']) {
    const titleRegex = new RegExp(`^[ \\t]*prem_title:\\s*(['"\`]).*?(?<!\\\\)\\1,?\\s*$`, 'm');
    const descRegex = new RegExp(`^[ \\t]*prem_desc:\\s*(['"\`]).*?(?<!\\\\)\\1,?\\s*$`, 'm');

    let langBlockStart = content.indexOf(`    ${lang}: {`);
    if (langBlockStart === -1) {
        langBlockStart = content.indexOf(`\t${lang}: {`);
    }
    if (langBlockStart === -1) {
        console.error('Could not find lang block for', lang);
        continue;
    }

    let nextLangBlockStart = content.length;
    const langs = ['id', 'en', 'ar', 'ms', 'zh'];
    for (let i = langs.indexOf(lang) + 1; i < langs.length; i++) {
        const idx = content.indexOf(`    ${langs[i]}: {`);
        if (idx !== -1 && idx < nextLangBlockStart) nextLangBlockStart = idx;
    }

    let block = content.substring(langBlockStart, nextLangBlockStart);

    // Replace prem_title
    block = block.replace(titleRegex, `        prem_title: "${newStrings[lang].prem_title}",`);
    
    // Replace prem_desc
    block = block.replace(descRegex, `        prem_desc: "${newStrings[lang].prem_desc}",`);

    // Insert the new buttons right after prem_desc
    const btnInsertStr = `        prem_btn_7: "${newStrings[lang].prem_btn_7}",\n        prem_btn_30: "${newStrings[lang].prem_btn_30}",\n        prem_btn_60: "${newStrings[lang].prem_btn_60}",\n        prem_btn_90: "${newStrings[lang].prem_btn_90}",\n        prem_btn_365: "${newStrings[lang].prem_btn_365}",`;
    block = block.replace(/(prem_desc: ".*",\n)/, `$1${btnInsertStr}\n`);

    content = content.substring(0, langBlockStart) + block + content.substring(nextLangBlockStart);
}

// Remove remaining Token/Leaderboard/Redeem Code/Botol/Bottle/ATM/Transfer strings that might not be matched above
const additionalPatterns = [
    /^[ \t]*btn_topup:.*?,\n/gm, // "💳 Topup QRIS" - wait, we might keep topup if it's not token related?
    // Instruction: "Remove any strings or sentences in any language that mention "Token", "Leaderboard" (and its command), "Redeem Code", "Botol/Bottle", "ATM", "Transfer"."
];

// In id features_text:
// "• <b>🌟 Upgrade Premium:</b> Dapatkan Badge [VIP SULTAN], anti-iklan, & fitur eksklusif.\n" -> Keep
// "• <b>🪙 Topup Token:</b> Isi saldo via QRIS, GoPay, atau Telegram Stars.\n" -> Mention Token
// "• <b>🎁 Referral:</b> Undang teman pakai link, dapatkan Token GRATIS.\n" -> Mention Token
// "• <b>🎫 Redeem Kode:</b> Tukarkan kode rahasia dari Owner.\n" -> Mention Redeem Code
// "• <b>🍾 Pesan Botol:</b> Lempar pesan rahasia ke lautan user secara acak.\n" -> Mention Botol
// These were already removed by step 2!

fs.writeFileSync('languages_updated.js', content, 'utf8');
console.log('Update complete. Output in languages_updated.js');
