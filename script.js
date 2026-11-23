const fs = require('fs');
let code = fs.readFileSync('languages.js', 'utf8');

// The new VIP strings
const vipStrings = {
    id: {
        prem_title: "💎 <b>UPGRADE KE PREMIUM ATAU VIP SULTAN</b> 💎",
        prem_desc: "🚀 <b>Jadilah Penguasa Komunitas!</b>\nBuka seluruh batasan dan nikmati fitur eksklusif berikut:\n\n🎯 <b>Bebas Memilih Gender</b>: Cari partner spesifik pria atau wanita sesuai keinginanmu.\n🕵️ <b>Akses Informasi Rahasia</b>: Mengintip identitas asli dan profil lengkap partner ngobrolmu tanpa batas!\n🎖️ <b>Badge Eksklusif VIP</b>: Pamerkan lencana keren 👑 <b>[VIP SULTAN]</b> di sebelah namamu agar semua orang tahu status bergengsimu.\n⚡ <b>Prioritas Matchmaking</b>: Menjadi prioritas di antrean perjodohan.\n\nJangan biarkan obrolanmu dibatasi. Jadilah member prioritas sekarang juga!",
        prem_btn_7: "🌟 1 Minggu (50 ⭐️)",
        prem_btn_30: "🌟 1 Bulan (75 ⭐️)",
        prem_btn_60: "🌟 2 Bulan (120 ⭐️)",
        prem_btn_90: "🌟 3 Bulan (175 ⭐️)",
        prem_btn_365: "👑 VIP 1 Tahun (250 ⭐️)"
    },
    en: {
        prem_title: "💎 <b>UPGRADE TO PREMIUM OR VIP SULTAN</b> 💎",
        prem_desc: "🚀 <b>Become the Ruler of the Community!</b>\nUnlock all limits and enjoy these exclusive features:\n\n🎯 <b>Free Gender Choice</b>: Search for a specific male or female partner as you wish.\n🕵️ <b>Secret Info Access</b>: Peek at your partner's true identity and full profile without limits!\n🎖️ <b>Exclusive VIP Badge</b>: Show off the cool 👑 <b>[VIP SULTAN]</b> badge next to your name so everyone knows your prestigious status.\n⚡ <b>Matchmaking Priority</b>: Be prioritized in the matchmaking queue.\n\nDon't let your chats be restricted. Become a priority member now!",
        prem_btn_7: "🌟 1 Week (50 ⭐️)",
        prem_btn_30: "🌟 1 Month (75 ⭐️)",
        prem_btn_60: "🌟 2 Months (120 ⭐️)",
        prem_btn_90: "🌟 3 Months (175 ⭐️)",
        prem_btn_365: "👑 VIP 1 Year (250 ⭐️)"
    },
    ar: {
        prem_title: "💎 <b>الترقية إلى بريميوم أو VIP سلطان</b> 💎",
        prem_desc: "🚀 <b>كن حاكم المجتمع!</b>\nافتح جميع الحدود واستمتع بهذه الميزات الحصرية:\n\n🎯 <b>اختيار حر للجنس</b>: ابحث عن شريك ذكر أو أنثى حسب رغبتك.\n🕵️ <b>الوصول إلى المعلومات السرية</b>: اختلس النظر إلى هوية شريكك الحقيقية وملفه الشخصي الكامل بلا حدود!\n🎖️ <b>شارة VIP حصرية</b>: اعرض الشارة الرائعة 👑 <b>[VIP سلطان]</b> بجوار اسمك ليعرف الجميع مكانتك المرموقة.\n⚡ <b>أولوية المطابقة</b>: احصل على الأولوية في طابور المطابقة.\n\nلا تدع محادثاتك مقيدة. كن عضوًا ذا أولوية الآن!",
        prem_btn_7: "🌟 1 أسبوع (50 ⭐️)",
        prem_btn_30: "🌟 1 شهر (75 ⭐️)",
        prem_btn_60: "🌟 2 أشهر (120 ⭐️)",
        prem_btn_90: "🌟 3 أشهر (175 ⭐️)",
        prem_btn_365: "👑 VIP 1 سنة (250 ⭐️)"
    },
    ms: {
        prem_title: "💎 <b>NAIK TARAF KE PREMIUM ATAU VIP SULTAN</b> 💎",
        prem_desc: "🚀 <b>Jadilah Penguasa Komuniti!</b>\nBuka semua had dan nikmati ciri eksklusif berikut:\n\n🎯 <b>Bebas Memilih Jantina</b>: Cari rakan kongsi lelaki atau wanita secara khusus mengikut kehendak anda.\n🕵️ <b>Akses Maklumat Rahsia</b>: Intip identiti sebenar dan profil penuh rakan sembang anda tanpa had!\n🎖️ <b>Lencana Eksklusif VIP</b>: Pamerkan lencana hebat 👑 <b>[VIP SULTAN]</b> di sebelah nama anda supaya semua orang tahu status prestij anda.\n⚡ <b>Keutamaan Padanan</b>: Diberi keutamaan dalam barisan padanan.\n\nJangan biarkan sembang anda dihadkan. Jadilah ahli keutamaan sekarang juga!",
        prem_btn_7: "🌟 1 Minggu (50 ⭐️)",
        prem_btn_30: "🌟 1 Bulan (75 ⭐️)",
        prem_btn_60: "🌟 2 Bulan (120 ⭐️)",
        prem_btn_90: "🌟 3 Bulan (175 ⭐️)",
        prem_btn_365: "👑 VIP 1 Tahun (250 ⭐️)"
    },
    zh: {
        prem_title: "💎 <b>升级至高级版或 VIP SULTAN</b> 💎",
        prem_desc: "🚀 <b>成为社区的统治者！</b>\n解锁所有限制并享受以下专属功能：\n\n🎯 <b>自由选择性别</b>：随心所欲寻找特定的男性或女性聊天伙伴。\n🕵️ <b>获取机密信息</b>：无限制地偷看你聊天伙伴的真实身份和完整个人资料！\n🎖️ <b>VIP专属徽章</b>：在你的名字旁边展示炫酷的 👑 <b>[VIP SULTAN]</b> 徽章，让每个人都知道你尊贵的身份。\n⚡ <b>优先匹配</b>：在匹配队列中获得优先权。\n\n不要让你的聊天受到限制。现在就成为优先会员吧！",
        prem_btn_7: "🌟 1 周 (50 ⭐️)",
        prem_btn_30: "🌟 1 个月 (75 ⭐️)",
        prem_btn_60: "🌟 2 个月 (120 ⭐️)",
        prem_btn_90: "🌟 3 个月 (175 ⭐️)",
        prem_btn_365: "👑 VIP 1 年 (250 ⭐️)"
    }
};

const langs = ['id', 'en', 'ar', 'ms', 'zh'];

for (const lang of langs) {
    const langObj = vipStrings[lang];
    
    // Replace prem_title
    const titleRegex = new RegExp(`(prem_title:\\s*)(['"\`].*?['"\`])`);
    code = code.replace(titleRegex, (match, p1) => {
        return p1 + JSON.stringify(langObj.prem_title);
    });

    // Replace prem_desc
    const descRegex = new RegExp(`(prem_desc:\\s*)(['"\`][\\s\\S]*?['"\`])`);
    code = code.replace(descRegex, (match, p1) => {
        return p1 + JSON.stringify(langObj.prem_desc);
    });

    // We will add the buttons after prem_vip_info if it exists, or just after prem_desc.
    const vipInfoRegex = new RegExp(`(prem_vip_info:\\s*['"\`][\\s\\S]*?['"\`],)`);
    const newBtns = `
        prem_btn_7: ${JSON.stringify(langObj.prem_btn_7)},
        prem_btn_30: ${JSON.stringify(langObj.prem_btn_30)},
        prem_btn_60: ${JSON.stringify(langObj.prem_btn_60)},
        prem_btn_90: ${JSON.stringify(langObj.prem_btn_90)},
        prem_btn_365: ${JSON.stringify(langObj.prem_btn_365)},`;
    
    // Since code is just a string, we might match multiple times if we just replace the regex.
    // So we should slice the string or match per language block.
}

// Actually it's safer to match within each language block.
let newCode = "";
let currentIndex = 0;
for (const lang of langs) {
    const startRegex = new RegExp(`^[ \\t]*${lang}:\\s*\\{`, 'm');
    const match = startRegex.exec(code.slice(currentIndex));
    if (match) {
        // Find next language block or end of file
        let nextIndex = code.length;
        const nextMatchIndex = code.slice(currentIndex + match.index + match[0].length).search(/^[ \t]*[a-z]{2}:\s*\{/m);
        if (nextMatchIndex !== -1) {
            nextIndex = currentIndex + match.index + match[0].length + nextMatchIndex;
        }

        let block = code.slice(currentIndex + match.index, nextIndex);
        
        // Remove old Token buttons
        block = block.replace(/^[ \t]*btn_prem_1[wmy].*\n/gm, '');
        block = block.replace(/^[ \t]*btn_prem_[23]m.*\n/gm, '');
        block = block.replace(/^[ \t]*btn_vip_1y.*\n/gm, '');
        block = block.replace(/^[ \t]*prem_balance.*\n/gm, '');
        block = block.replace(/^[ \t]*btn_topup_first.*\n/gm, '');
        block = block.replace(/^[ \t]*menu_token.*\n/gm, '');
        block = block.replace(/^[ \t]*btn_redeem.*\n/gm, '');
        block = block.replace(/^[ \t]*btn_bottle.*\n/gm, '');
        block = block.replace(/^[ \t]*btn_write_bottle.*\n/gm, '');
        block = block.replace(/^[ \t]*bottle_menu.*\n/gm, '');
        block = block.replace(/^[ \t]*bottle_write.*\n/gm, '');
        block = block.replace(/^[ \t]*bottle_sent.*\n/gm, '');
        block = block.replace(/^[ \t]*bottle_received.*\n/gm, '');
        block = block.replace(/^[ \t]*bottle_no_users.*\n/gm, '');
        block = block.replace(/^[ \t]*bottle_cancelled.*\n/gm, '');
        block = block.replace(/^[ \t]*btn_leaderboard.*\n/gm, '');
        block = block.replace(/^[ \t]*leaderboard_title.*\n/gm, '');
        block = block.replace(/^[ \t]*err_token.*\n/gm, '');
        block = block.replace(/^[ \t]*btn_referral.*\n/gm, '');
        
        // Remove token/bottle references in features_text
        block = block.replace(/•\s*<b[^>]*>.*Botol.*<\/b>:.*\n/gi, '');
        block = block.replace(/•\s*<b[^>]*>.*Bottle.*<\/b>:.*\n/gi, '');
        block = block.replace(/•\s*<b[^>]*>.*زجاجة.*<\/b>:.*\n/gi, '');
        block = block.replace(/•\s*<b[^>]*>.*漂流瓶.*<\/b>:.*\n/gi, '');

        block = block.replace(/•\s*<b[^>]*>.*Token.*<\/b>:.*\n/gi, '');
        block = block.replace(/•\s*<b[^>]*>.*Topup.*<\/b>:.*\n/gi, '');
        block = block.replace(/•\s*<b[^>]*>.*Referral.*<\/b>:.*\n/gi, '');
        block = block.replace(/•\s*<b[^>]*>.*Redeem.*<\/b>:.*\n/gi, '');
        
        // English specific
        block = block.replace(/•\s*<b[^>]*>.*Invite.*<\/b>:.*\n/gi, '');
        // Arabic specific
        block = block.replace(/•\s*<b[^>]*>.*رموز.*<\/b>:.*\n/gi, '');
        block = block.replace(/•\s*<b[^>]*>.*شحن.*<\/b>:.*\n/gi, '');
        block = block.replace(/•\s*<b[^>]*>.*دعوة.*<\/b>:.*\n/gi, '');
        block = block.replace(/•\s*<b[^>]*>.*استبدال.*<\/b>:.*\n/gi, '');
        // Chinese specific
        block = block.replace(/•\s*<b[^>]*>.*代币.*<\/b>:.*\n/gi, '');
        block = block.replace(/•\s*<b[^>]*>.*充值.*<\/b>:.*\n/gi, '');
        block = block.replace(/•\s*<b[^>]*>.*邀请.*<\/b>:.*\n/gi, '');
        block = block.replace(/•\s*<b[^>]*>.*兑换.*<\/b>:.*\n/gi, '');

        // Remove token/bottle references in premium_info
        block = block.replace(/.*Botol Premium.*\n.*\n/gi, '');
        block = block.replace(/.*Premium Bottles.*\n.*\n/gi, '');
        block = block.replace(/.*رسائل زجاجة.*\n.*\n/gi, '');
        block = block.replace(/.*漂流瓶.*\n.*\n/gi, '');

        // Modify prem_title and prem_desc
        const langObj = vipStrings[lang];
        block = block.replace(/(prem_title:\s*)(['"\`].*?['"\`])/, (m, p1) => p1 + JSON.stringify(langObj.prem_title));
        block = block.replace(/(prem_desc:\s*)(['"\`][\s\S]*?['"\`])/, (m, p1) => p1 + JSON.stringify(langObj.prem_desc));

        // Add the new buttons
        const newBtns = `
        prem_btn_7: ${JSON.stringify(langObj.prem_btn_7)},
        prem_btn_30: ${JSON.stringify(langObj.prem_btn_30)},
        prem_btn_60: ${JSON.stringify(langObj.prem_btn_60)},
        prem_btn_90: ${JSON.stringify(langObj.prem_btn_90)},
        prem_btn_365: ${JSON.stringify(langObj.prem_btn_365)},`;
        
        block = block.replace(/(prem_desc:\s*".*",)/, `$1${newBtns}`);

        newCode += code.slice(currentIndex, currentIndex + match.index) + block;
        currentIndex = nextIndex;
    }
}
newCode += code.slice(currentIndex);

fs.writeFileSync('languages_updated.js', newCode, 'utf8');
console.log("Updated!");
