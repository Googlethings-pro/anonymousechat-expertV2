const fs = require('fs');

let code = fs.readFileSync('languages.js', 'utf8');

// Helper to add or replace a string in a language block
function updateLang(lang, key, value) {
    const blockRegex = new RegExp(`(${lang}:\\s*\\{[\\s\\S]*?\\n)(\\s*)([a-zA-Z0-9_]+):`);
    
    // Check if key already exists
    const keyRegex = new RegExp(`(${lang}:\\s*\\{[\\s\\S]*?)${key}:\\s*(?:\`[\\s\\S]*?\`|"[\\s\\S]*?"|'[\\s\\S]*?'),?`);
    if (keyRegex.test(code)) {
        // Replace it
        code = code.replace(keyRegex, `$1${key}: \`${value}\`,`);
    } else {
        // Add it after the first property
        code = code.replace(blockRegex, `$1$2${key}: \`${value}\`,\n$2$3:`);
    }
}

// Translations
const translations = {
    id: {
        prem_btn_365: "👑 VIP 1 Tahun (350 ⭐️)",
        flood_warning: "🤫 Sssttt! Kamu mengetik terlalu cepat. Pesanmu ditahan selama 10 detik agar partner-mu bisa membaca dengan santai.",
        age_congrats: "🎉 <b>SETUP SELESAI!</b> 🎉\\n<code>━━━━━━━━━━━━━━━━━━━━</code>\\n\\n✅ <b>Profil berhasil dibuat!</b>\\n🎂 Usia: <b>{age} tahun</b> tersimpan!\\n\\n🚀 Memulai pencarian partner sekarang...",
    },
    en: {
        prem_btn_365: "👑 VIP 1 Year (350 ⭐️)",
        flood_warning: "🤫 Shh! You're typing too fast. Your message is held for 10 seconds so your partner can read it.",
        age_congrats: "🎉 <b>SETUP COMPLETE!</b> 🎉\\n<code>━━━━━━━━━━━━━━━━━━━━</code>\\n\\n✅ <b>Profile created!</b>\\n🎂 Age: <b>{age} years</b> saved!\\n\\n🚀 Starting to search for a partner now...",
    },
    my: {
        prem_btn_365: "👑 VIP 1 Tahun (350 ⭐️)",
        flood_warning: "🤫 Sssttt! Anda menaip terlalu cepat. Mesej anda ditahan selama 10 saat.",
        age_congrats: "🎉 <b>PERSIAPAN SELESAI!</b> 🎉\\n<code>━━━━━━━━━━━━━━━━━━━━</code>\\n\\n✅ <b>Profil berjaya dicipta!</b>\\n🎂 Umur: <b>{age} tahun</b> disimpan!\\n\\n🚀 Memulakan carian rakan sekarang...",
    },
    cn: {
        prem_btn_365: "👑 VIP 1 年 (350 ⭐️)",
        flood_warning: "🤫 嘘！您输入太快了。您的消息将被保留10秒。",
        age_congrats: "🎉 <b>设置完成！</b> 🎉\\n<code>━━━━━━━━━━━━━━━━━━━━</code>\\n\\n✅ <b>个人资料已创建！</b>\\n🎂 年龄：<b>{age}岁</b>已保存！\\n\\n🚀 现在开始寻找伙伴...",
    },
    ar: {
        prem_btn_365: "👑 VIP سنة واحدة (350 ⭐️)",
        flood_warning: "🤫 صه! أنت تكتب بسرعة كبيرة. تم تعليق رسالتك لمدة 10 ثوانٍ.",
        age_congrats: "🎉 <b>تم الإعداد!</b> 🎉\\n<code>━━━━━━━━━━━━━━━━━━━━</code>\\n\\n✅ <b>تم إنشاء الملف الشخصي!</b>\\n🎂 العمر: <b>{age} سنة</b> تم الحفظ!\\n\\n🚀 جاري البحث عن شريك الآن...",
    }
};

for (const [lang, keys] of Object.entries(translations)) {
    for (const [k, v] of Object.entries(keys)) {
        updateLang(lang, k, v);
    }
}

// Global token replacement
code = code.replace(/250 ⭐️/g, "350 ⭐️");
// Remove token occurrences in strings (dirty but effective if manual regex is used cautiously)
code = code.replace(/🪙.*?Token/g, "");

fs.writeFileSync('languages.js', code);
console.log("Languages updated successfully.");
