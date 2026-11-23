const LANGS = {
    id: {
        age_congrats: `🎉 <b>SETUP SELESAI!</b> 🎉\n<code>━━━━━━━━━━━━━━━━━━━━</code>\n\n✅ <b>Profil berhasil dibuat!</b>\n🎂 Usia: <b>{age} tahun</b> tersimpan!\n\n🚀 Memulai pencarian partner sekarang...`,
        flood_warning: `🤫 Sssttt! Kamu mengetik terlalu cepat. Pesanmu ditahan selama 10 detik agar partner-mu bisa membaca dengan santai.`,
        prem_btn_7: "🌟 1 Minggu (50 ⭐️)",
        prem_btn_30: "🌟 1 Bulan (75 ⭐️)",
        prem_btn_60: "🌟 2 Bulan (120 ⭐️)",
        prem_btn_90: "🌟 3 Bulan (175 ⭐️)",
        prem_btn_365: `👑 VIP 1 Tahun (350 ⭐️)`,
        name: "🇮🇩 Indonesia",
        greeting_pagi: "Selamat Pagi",
        greeting_siang: "Selamat Siang",
        greeting_sore: "Selamat Sore",
        greeting_malam: "Selamat Malam",
        menu_title: "⚡ <b>ANONYMOUS CHAT EXPERT</b> ⚡",
        menu_welcome_text: "Masuk ke dalam jaringan, temukan koneksi baru, dan biarkan identitasmu menjadi misteri. Tidak ada batasan, tidak ada jejak. Hanya kamu dan ribuan pengguna lain yang menunggu di seluruh dunia.",
        menu_subtitle: `<i>⚡ Fast Match · 🌍 Global · 🔒 Anonim
"Temukan temanmu secepat kilat, tanpa nama!"</i>`,
        prem_title: "💎 <b>UPGRADE KE PREMIUM ATAU VIP SULTAN</b> 💎",
        prem_desc: `🚀 <b>Jadilah Penguasa Komunitas!</b>
Buka seluruh batasan dan nikmati fitur eksklusif berikut:

🎯 <b>Bebas Memilih Gender</b>: Cari partner spesifik pria atau wanita sesuai keinginanmu.
🕵️ <b>Akses Informasi Rahasia</b>: Mengintip identitas asli dan profil lengkap partner ngobrolmu tanpa batas!
🎖️ <b>Badge Eksklusif VIP</b>: Pamerkan lencana keren 👑 <b>[VIP SULTAN]</b> di sebelah namamu agar semua orang tahu status bergengsimu.
⚡ <b>Prioritas Matchmaking</b>: Menjadi prioritas di antrean perjodohan.

Jangan biarkan obrolanmu dibatasi. Jadilah member prioritas sekarang juga!`,
        prem_vip_info: `<i>💡 <b>Info Khusus VIP SULTAN:</b>
Biaya status VIP eksklusif selama 12 bulan adalah — 1000 Telegram Stars / Rp349.000.
Lanjutkan ke pembayaran menggunakan tombol di bawah ini:</i>`,
        btn_back_main: "🔙 Kembali ke Menu Utama",
        menu_server: "🌐 <b>STATUS SERVER</b>",
        menu_users: "👥 Terdaftar",
        menu_online: "🟢 Aktif/Online",
        menu_wallet: "💼 <b>DOMPET & LISENSI</b>",
        menu_choose: "<i>Pilih menu di bawah untuk memulai:</i>",
        btn_search_random: "🔍 Mulai Cari Teman Acak (Gratis)",
        btn_search_male: "👦 Pria (Premium)",
        btn_search_female: "👧 Wanita (Premium)",
        btn_profile: "🪪 Info Profil & Gender",
        btn_vip: "💎 Upgrade VIP",
        btn_broadcast: "📢 Pengumuman",
        btn_channel: "📣 Channel Official",
        btn_owner: "👨‍💻 Hubungi Owner",
        btn_back: "🔙 Kembali ke Menu Utama",
        btn_change_gender: "⚙️ Ubah Jenis Kelamin",
        btn_change_lang: "🌐 Ubah Bahasa",
        btn_cancel: "❌ Batal",
        searching: `⏳ *Mencari lawan bicara...*
_Ketik /stop untuk membatalkan pencarian._`,
        partner_found: `✅ *PARTNER DITEMUKAN!*

Kalian sekarang terhubung. Silakan sapa lawan bicaramu!

_Ketik /next untuk mencari partner baru._
_Ketik /stop untuk mengakhiri obrolan._`,
        chat_ended: `🛑 OBROLAN SELESAI! 🛑
━━━━━━━━━━━━━━━━━━━━

Kamu telah mengakhiri percakapan ini. Terkadang, kita memang harus melangkah pergi untuk menemukan cerita yang baru... ✨

Kira-kira siapa lagi ya orang seru yang sedang menunggu untuk menyapamu hari ini?

👉 Ketik /search atau /next untuk langsung terhubung dengan partner ngobrol yang baru!`,
        chat_next: "🔄 Mencari partner baru...",
        partner_left: `🛑 YAHH... OBROLAN BERAKHIR! 🛑
━━━━━━━━━━━━━━━━━━━━

Lawan bicaramu telah meninggalkan obrolan dan menghilang ke dalam bayangan... 💨

Jangan sedih! Di luar sana masih banyak jutaan orang seru yang menunggu untuk ngobrol sama kamu hari ini.

👉 Ketik /search atau klik tombol di bawah untuk mencari partner baru! atau ketik /next`,
        feedback_prompt: "Jika mau, silakan tinggalkan feedback tentang pasangan Anda. Ini akan membantu kami mencarikan pasangan yang lebih sesuai untuk Anda di masa depan:",
        lang_changed: "✅ Bahasa telah diubah ke 🇮🇩 Indonesia!",
        lang_menu_title: "🌐 <b>PILIH BAHASA / SELECT LANGUAGE</b>",
        lang_menu_body: `Pilih bahasa utama yang ingin kamu gunakan untuk antarmuka bot ini. 🌐

🤖 <b>Sistem Matchmaking Cerdas (AI):</b>
Bahasa yang kamu pilih di sini tidak hanya mengubah teks menu, tetapi juga membantu sistem AI kami mencarikan partner obrolan yang paling sesuai untukmu! Kami akan memprioritaskan untuk menghubungkanmu dengan pengguna lain yang menggunakan bahasa yang sama, sehingga obrolan kalian bisa lebih nyambung dan seru.

<i>Silakan pilih bahasamu di bawah ini:</i>`,
        btn_view_partner: "👁️ Lihat Informasi Pengguna",
        btn_share_username: "💌 Ajak Kenalan (Kirim Username)",
        premium_info: `🌟 *EKSKLUSIF: KEUNTUNGAN PENGGUNA PREMIUM* 🌟

Tingkatkan pengalaman chattingmu ke level tertinggi! Dengan menjadi pengguna Premium, kamu membuka semua batasan:

👑 *Badge & Status VIP*
Tampil beda! Pesanmu akan ditandai dengan badge khusus \`[PREMIUM]\` yang elegan.

🚻 *Filter Gender Bebas*
Tidak ada lagi zonk! Pilih secara spesifik apakah kamu ingin ngobrol dengan Pria atau Wanita.

👁️ *Buka Identitas Rahasia*
Hanya Premium yang bisa menembus dinding anonimitas dan melihat profil asli lawan bicara (tanpa sensor!).

🚀 *Prioritas Matchmaking VIP*
Sistem AI kami akan menaruhmu di antrean terdepan. Bertemu dengan partner yang lebih aktif, asyik, dan bebas dari akun spam.

🚫 *100% Bebas Iklan*
Layar bersih tanpa gangguan promosi apapun.`,
        prem_not_enough: "❌ Stars kamu tidak cukup! Silakan topup terlebih dahulu.",
        prem_success: "🎉 *SELAMAT!* Akun kamu sekarang menjadi 🌟 PREMIUM selama {days} hari ke depan!",
        features_text: `📋 <b>PUSAT PANDUAN & FITUR LENGKAP</b> 📋
━━━━━━━━━━━━━━━━━━━━

Selamat datang di pusat komando! Berikut adalah daftar lengkap fitur canggih yang bisa kamu gunakan:

💬 <b>FITUR OBROLAN</b>
• <b>🔍 Cari Teman:</b> Pencocokan anonim instan.
• <b>🚻 Filter Gender:</b> (Premium) Pilih lawan bicara Pria/Wanita.
• <b>🔄 /next & 🛑 /stop:</b> Ganti partner atau akhiri obrolan seketika.
• <b>💬 Reply Pesan:</b> Balas pesan spesifik dari partner seperti di grup.

🎮 <b>MINI GAMES & INTERAKSI</b>
• <b>🎰 Main Slot:</b> Uji kekompakan dengan mesin slot animasi!
• <b>❓ Quiz Cepat:</b> Main tebak-tebakan trivia berdua.
• <b>🎲 Icebreaker:</b> Kirim pertanyaan acak untuk mencairkan suasana.
• <b>😍 Kirim Reaksi:</b> Lempar emoji lucu ke layar partnermu.

• <b>👁️ Info Partner:</b> (Premium) Intip identitas asli lawan bicara!
• <b>💌 Kenalkan Diri:</b> Bagikan username Telegram-mu dengan elegan.

💎 <b>EKONOMI & VIP</b>

━━━━━━━━━━━━━━━━━━━━
<i>💡 Jaga etika saat mengobrol. Privasi dan keamananmu adalah prioritas kami!</i>`,
        captcha_code_q: `🤖 Sebelum mencari partner, buktikan kamu bukan robot!

Pilih kode yang <b>SAMA PERSIS</b> dengan teks di bawah ini:`,
        captcha_math_q: `🧮 Sebelum mencari partner, selesaikan soal matematika ini!

Berapa hasil dari:`,
        captcha_wrong: "❌ Jawaban salah! Coba lagi dengan soal baru.",
        captcha_passed: "✅ Verifikasi berhasil! Mencari partner...",
        captcha_expired: "⏰ Waktu verifikasi habis. Ketik /search untuk mencoba lagi.",
        captcha_title: "🔐 VERIFIKASI KEAMANAN",
        plan_1w: "Premium 1 Minggu",
        plan_1m: "Premium 1 Bulan",
        plan_2m: "Premium 2 Bulan",
        plan_3m: "Premium 3 Bulan",
        plan_1y: "Premium 1 Tahun",
        plan_vip: "VIP SULTAN 1 Tahun",
        recovery_title: "↩️ <b>MENYESAL PENCET NEXT?</b>",
        recovery_body: "⏳ Kamu punya <b>30 detik</b> untuk kembali ke partner sebelumnya!",
        btn_recovery_back: "↩️ Kembali ke Partner Sebelumnya",
        btn_recovery_skip: "🔍 Langsung Cari Partner Baru",
        recovery_used_alert: "❌ Tombol ini sudah digunakan untuk sesi ini!",
        partner_typing: "✍️ <i>Partner sedang mengetik...</i>",
    },
    en: {
        age_congrats: `🎉 <b>SETUP COMPLETE!</b> 🎉\n<code>━━━━━━━━━━━━━━━━━━━━</code>\n\n✅ <b>Profile created!</b>\n🎂 Age: <b>{age} years</b> saved!\n\n🚀 Starting to search for a partner now...`,
        flood_warning: `🤫 Shh! You're typing too fast. Your message is held for 10 seconds so your partner can read it.`,
        prem_btn_7: "🌟 1 Week (50 ⭐️)",
        prem_btn_30: "🌟 1 Month (75 ⭐️)",
        prem_btn_60: "🌟 2 Months (120 ⭐️)",
        prem_btn_90: "🌟 3 Months (175 ⭐️)",
        prem_btn_365: `👑 VIP 1 Year (350 ⭐️)`,
        name: "🇬🇧 English",
        greeting_pagi: "Good Morning",
        greeting_siang: "Good Afternoon",
        greeting_sore: "Good Evening",
        greeting_malam: "Good Night",
        menu_welcome_text: "Enter the network, find new connections, and let your identity remain a mystery. No limits, no traces. Just you and thousands of other users waiting worldwide.",
        prem_title: "💎 <b>UPGRADE TO PREMIUM OR VIP SULTAN</b> 💎",
        prem_desc: `🚀 <b>Become the Ruler of the Community!</b>
Unlock all limits and enjoy these exclusive features:

🎯 <b>Free Gender Choice</b>: Search specifically for male or female partners as you wish.
🕵️ <b>Secret Info Access</b>: Peek at your partner's true identity and full profile limitlessly!
🎖️ <b>Exclusive VIP Badge</b>: Show off the cool 👑 <b>[VIP SULTAN]</b> badge next to your name so everyone knows your prestigious status.
⚡ <b>Matchmaking Priority</b>: Get prioritized in the matchmaking queue.

Don't let your chats be restricted. Become a priority member right now!`,
        prem_vip_info: `<i>💡 <b>Exclusive VIP SULTAN Info:</b>
The cost of VIP status for 12 months is — 1000 Telegram Stars / Rp349.000.
Proceed to payment using the buttons below:</i>`,
        btn_back_main: "🔙 Back to Main Menu",
        menu_title: "⚡ <b>ANONYMOUS CHAT EXPERT</b> ⚡",
        menu_subtitle: `<i>⚡ Fast Match · 🌍 Global · 🔒 Anonymous
"Find your match at lightning speed — nameless!"</i>`,
        menu_server: "🌐 <b>SERVER STATUS</b>",
        menu_users: "👥 Registered",
        menu_online: "🟢 Active/Online",
        menu_wallet: "💼 <b>WALLET & LICENSE</b>",
        menu_choose: "<i>Choose a menu below to get started:</i>",
        btn_search_random: "🔍 Find Random Friend (Free)",
        btn_search_male: "👦 Male (Premium)",
        btn_search_female: "👧 Female (Premium)",
        btn_profile: "🪪 Profile Info & Gender",
        btn_vip: "💎 Upgrade VIP",
        btn_broadcast: "📢 Announcements",
        btn_channel: "📣 Official Channel",
        btn_owner: "👨‍💻 Contact Owner",
        btn_back: "🔙 Back to Main Menu",
        btn_change_gender: "⚙️ Change Gender",
        btn_change_lang: "🌐 Change Language",
        btn_cancel: "❌ Cancel",
        searching: `⏳ *Searching for a chat partner...*
_Type /stop to cancel._`,
        partner_found: `✅ *PARTNER FOUND!*

You are now connected. Say hi to your chat partner!

_Type /next for a new partner._
_Type /stop to end the chat._`,
        chat_ended: `🛑 <b>CHAT ENDED!</b> 🛑
━━━━━━━━━━━━━━━━━━━━

You have ended this conversation. Sometimes, we just have to walk away to find a new story... ✨

Who else is waiting to say hello to you today?

👉 <i>Type /search or /next to instantly connect with a new chat partner!</i>`,
        chat_next: "🔄 Searching for a new partner...",
        partner_left: `🛑 <b>AWW... CHAT ENDED!</b> 🛑
━━━━━━━━━━━━━━━━━━━━

Your partner has left the chat and vanished into the shadows... 💨

Don't be sad! There are thousands of awesome people waiting to talk to you right now.

👉 <i>Type /search or click the button below to find a new partner! or type /next</i>`,
        feedback_prompt: "If you'd like, leave feedback about your chat partner. It helps us find better matches for you in the future:",
        lang_changed: "✅ Language changed to 🇬🇧 English!",
        lang_menu_title: "🌐 <b>PILIH BAHASA / SELECT LANGUAGE</b>",
        lang_menu_body: `Choose the main language you want to use for this bot's interface. 🌐

🤖 <b>Smart AI Matchmaking:</b>
The language you select here doesn't just change the menu text; it also helps our AI system find the best chat partner for you! We will prioritize connecting you with other users who speak the same language, ensuring your conversations are smooth and engaging.

<i>Please select your language below:</i>`,
        btn_view_partner: "👁️ View Partner Info",
        btn_share_username: "💌 Introduce Myself (Share Username)",
        premium_info: `🌟 *EXCLUSIVE: PREMIUM USER BENEFITS* 🌟

Elevate your chatting experience to the highest level! By going Premium, you unlock all limits:

👑 *VIP Badge & Status*
Stand out! Your messages will be marked with an elegant \`[PREMIUM]\` badge.

🚻 *Ultimate Gender Filter*
No more guessing! Specifically choose to chat with Males or Females.

👁️ *Uncover Secret Identities*
Only Premium users can break the anonymity wall and view their partner's true profile (uncensored!).

🚀 *VIP Matchmaking Priority*
Our AI system puts you at the front of the line. Meet active, fun partners and avoid spam accounts.

🚫 *100% Ad-Free*
Clean screen with no promotional interruptions.`,
        prem_not_enough: "❌ Not enough Stars! Please top up first.",
        prem_success: "🎉 *CONGRATULATIONS!* Your account is now 🌟 PREMIUM for the next {days} days!",
        features_text: `📋 <b>FULL GUIDE & FEATURES CENTER</b> 📋
━━━━━━━━━━━━━━━━━━━━

Welcome to the command center! Here is the complete list of advanced features you can use:

💬 <b>CHATTING FEATURES</b>
• <b>🔍 Find Friends:</b> Instant anonymous matching.
• <b>🚻 Gender Filter:</b> (Premium) Choose Male/Female partners.
• <b>🔄 /next & 🛑 /stop:</b> Instantly change partner or end chat.
• <b>💬 Reply Messages:</b> Reply to specific messages just like in groups.

🎮 <b>MINI GAMES & INTERACTION</b>
• <b>🎰 Play Slot:</b> Test your synergy with an animated slot machine!
• <b>❓ Quick Quiz:</b> Play trivia together.
• <b>🎲 Icebreaker:</b> Send random questions to start a conversation.
• <b>😍 Send Reaction:</b> Throw cute emojis at your partner's screen.

• <b>👁️ Partner Info:</b> (Premium) Uncover your partner's true identity!
• <b>💌 Introduce Yourself:</b> Share your Telegram username elegantly.

💎 <b>ECONOMY & VIP</b>

━━━━━━━━━━━━━━━━━━━━
<i>💡 Please maintain good etiquette. Your privacy and safety are our priority!</i>`,
        captcha_code_q: `🤖 Before searching for a partner, prove you're not a robot!

Select the code that is <b>EXACTLY THE SAME</b> as the text below:`,
        captcha_math_q: `🧮 Before searching for a partner, solve this math problem!

What is the result of:`,
        captcha_wrong: "❌ Wrong answer! Try again with a new challenge.",
        captcha_passed: "✅ Verification successful! Searching for a partner...",
        captcha_expired: "⏰ Verification timed out. Type /search to try again.",
        captcha_title: "🔐 SECURITY VERIFICATION",
        plan_1w: "Premium 1 Week",
        plan_1m: "Premium 1 Month",
        plan_2m: "Premium 2 Months",
        plan_3m: "Premium 3 Months",
        plan_1y: "Premium 1 Year",
        plan_vip: "VIP SULTAN 1 Year",
        recovery_title: "↩️ <b>REGRET HITTING NEXT?</b>",
        recovery_body: "⏳ You have <b>30 seconds</b> to go back to your previous partner!",
        btn_recovery_back: "↩️ Back to Previous Partner",
        btn_recovery_skip: "🔍 Find New Partner Now",
        recovery_used_alert: "❌ This button has already been used for this session!",
        partner_typing: "✍️ <i>Partner is typing...</i>",
    },
    ar: {
        age_congrats: `🎉 <b>تم الإعداد!</b> 🎉\n<code>━━━━━━━━━━━━━━━━━━━━</code>\n\n✅ <b>تم إنشاء الملف الشخصي!</b>\n🎂 العمر: <b>{age} سنة</b> تم الحفظ!\n\n🚀 جاري البحث عن شريك الآن...`,
        flood_warning: `🤫 صه! أنت تكتب بسرعة كبيرة. تم تعليق رسالتك لمدة 10 ثوانٍ.`,
        prem_btn_7: "🌟 1 أسبوع (50 ⭐️)",
        prem_btn_30: "🌟 1 شهر (75 ⭐️)",
        prem_btn_60: "🌟 2 أشهر (120 ⭐️)",
        prem_btn_90: "🌟 3 أشهر (175 ⭐️)",
        prem_btn_365: `👑 VIP سنة واحدة (350 ⭐️)`,
        name: "🇸🇦 العربية",
        greeting_pagi: "صباح الخير",
        greeting_siang: "مرحباً",
        greeting_sore: "مساء الخير",
        greeting_malam: "مساء الخير",
        menu_welcome_text: "ادخل إلى الشبكة، واعثر على اتصالات جديدة، ودع هويتك تبقى لغزاً. بلا حدود، بلا أثر. فقط أنت والآلاف من المستخدمين الآخرين ينتظرونك في جميع أنحاء العالم.",
        prem_title: "💎 <b>الترقية إلى بريميوم أو VIP سلطان</b> 💎",
        prem_desc: `🚀 <b>كن حاكم المجتمع!</b>
افتح جميع القيود واستمتع بهذه الميزات الحصرية:

🎯 <b>حرية اختيار الجنس</b>: ابحث تحديدًا عن شركاء ذكور أو إناث كما يحلو لك.
🕵️ <b>الوصول للمعلومات السرية</b>: اختلس النظر إلى الهوية الحقيقية والملف الشخصي الكامل لشريكك بلا حدود!
🎖️ <b>شارة VIP حصرية</b>: تفاخر بشارة 👑 <b>[VIP سلطان]</b> الرائعة بجانب اسمك ليعرف الجميع مكانتك المرموقة.
⚡ <b>أولوية المطابقة</b>: احصل على الأولوية في طابور المطابقة.

لا تدع محادثاتك مقيدة. كن عضوًا ذا أولوية الآن!`,
        prem_vip_info: `<i>💡 <b>معلومات VIP سلطان الحصرية:</b>
تكلفة حالة VIP لمدة 12 شهرًا هي — 1000 نجمة تيليجرام / Rp349.000.
تابع للدفع باستخدام الأزرار أدناه:</i>`,
        btn_back_main: "🔙 العودة للقائمة الرئيسية",
        menu_title: "⚡ <b>ANONYMOUS CHAT EXPERT</b> ⚡",
        menu_subtitle: `<i>⚡ تطابق سريع · 🌍 عالمي · 🔒 مجهول
"ابحث عن رفيقك بسرعة البرق!"</i>`,
        menu_server: "🌐 <b>حالة الخادم</b>",
        menu_users: "👥 مسجّل",
        menu_online: "🟢 نشط/متصل",
        menu_wallet: "💼 <b>المحفظة والترخيص</b>",
        menu_choose: "<i>اختر قائمة للبدء:</i>",
        btn_search_random: "🔍 إيجاد صديق عشوائي (مجاني)",
        btn_search_male: "👦 إيجاد ذكر (مميز)",
        btn_search_female: "👧 إيجاد أنثى (مميز)",
        btn_profile: "🪪 الملف الشخصي",
        btn_vip: "💎 ترقية VIP",
        btn_broadcast: "📢 الإعلانات",
        btn_channel: "📣 القناة الرسمية",
        btn_owner: "👨‍💻 تواصل مع المالك",
        btn_back: "🔙 العودة للقائمة الرئيسية",
        btn_change_gender: "⚙️ تغيير الجنس",
        btn_change_lang: "🌐 تغيير اللغة",
        btn_cancel: "❌ إلغاء",
        searching: `⏳ *جاري البحث عن شريك للدردشة...*
_اكتب /stop للإلغاء._`,
        partner_found: `✅ *تم إيجاد شريك!*

أنتما الآن متصلان. قل مرحبا!

_اكتب /next لشريك جديد._
_اكتب /stop لإنهاء الدردشة._`,
        chat_ended: `🛑 <b>انتهت الدردشة!</b> 🛑
━━━━━━━━━━━━━━━━━━━━

لقد أنهيت هذه المحادثة. في بعض الأحيان، علينا فقط المضي قدماً لاكتشاف قصة جديدة... ✨

من يا ترى ينتظر إلقاء التحية عليك اليوم؟

👉 <i>اكتب /search أو /next للاتصال الفوري بشريك دردشة جديد!</i>`,
        chat_next: "🔄 جاري البحث عن شريك جديد...",
        partner_left: `🛑 <b>أوه... انتهت الدردشة!</b> 🛑
━━━━━━━━━━━━━━━━━━━━

لقد غادر شريكك الدردشة واختفى في الظلال... 💨

لا تحزن! هناك الآلاف من الأشخاص الرائعين ينتظرون التحدث إليك في هذه اللحظة.

👉 <i>اكتب /search أو انقر على الزر أدناه للعثور على شريك جديد!</i>`,
        feedback_prompt: "إذا أردت، اترك تقييماً لشريك دردشتك. سيساعدنا في إيجاد تطابقات أفضل:",
        lang_changed: "✅ تم تغيير اللغة إلى 🇸🇦 العربية!",
        lang_menu_title: "🌐 <b>PILIH BAHASA / SELECT LANGUAGE</b>",
        lang_menu_body: `اختر اللغة الأساسية التي تريد استخدامها لواجهة هذا البوت. 🌐

🤖 <b>نظام التوافق الذكي (AI):</b>
اللغة التي تختارها هنا لا تغير نصوص القائمة فحسب، بل تساعد أيضاً نظام الذكاء الاصطناعي لدينا في العثور على أفضل شريك دردشة لك! سنعطي الأولوية لربطك بمستخدمين آخرين يتحدثون نفس اللغة، مما يضمن أن تكون محادثاتك سلسة وممتعة.

<i>يرجى تحديد لغتك أدناه:</i>`,
        btn_view_partner: "👁️ عرض معلومات الشريك",
        btn_share_username: "💌 تعريف نفسي (مشاركة الاسم)",
        premium_info: `🌟 *حصرية: مزايا العضوية المميزة* 🌟

ارتقِ بتجربتك إلى أعلى مستوى! بفضل العضوية المميزة، ستفتح جميع القيود:

👑 *شارة وحالة VIP*
تألق! سيتم تمييز رسائلك بشارة \`[PREMIUM]\` الأنيقة.

🚻 *تصفية دقيقة حسب الجنس*
لا مزيد من التخمين! اختر التحدث مع ذكور أو إناث.

👁️ *كشف الهويات السرية*
فقط مستخدمو Premium يمكنهم كسر جدار المجهولية ورؤية الملف الشخصي الحقيقي للشريك.

🚀 *أولوية المطابقة VIP*
يضعك نظام الذكاء الاصطناعي في مقدمة قائمة الانتظار للابتعاد عن الحسابات الوهمية.

🚫 *بدون إعلانات 100%*
شاشة نظيفة بدون أي إعلانات مزعجة.`,
        prem_not_enough: "❌ النجوم غير كافية! يرجى الشحن أولاً.",
        prem_success: "🎉 *تهانينا!* حسابك الآن 🌟 PREMIUM للأيام الـ {days} القادمة!",
        features_text: `📋 <b>دليل المركز والميزات الكاملة</b> 📋
━━━━━━━━━━━━━━━━━━━━

مرحباً بك في مركز القيادة! إليك القائمة الكاملة للميزات المتقدمة:

💬 <b>ميزات الدردشة</b>
• <b>🔍 البحث عن أصدقاء:</b> مطابقة فورية ومجهولة.
• <b>🚻 تصفية الجنس:</b> (للمميزين) اختر شريكاً ذكراً أو أنثى.
• <b>🔄 /next & 🛑 /stop:</b> تغيير الشريك أو إنهاء الدردشة فوراً.
• <b>💬 الرد على الرسائل:</b> اقتبس رسائل الشريك ورد عليها.

🎮 <b>الألعاب المصغرة والتفاعل</b>
• <b>🎰 ماكينة القمار:</b> اختبر مدى توافقك بلعبة ممتعة!
• <b>❓ مسابقة سريعة:</b> العبوا أسئلة ثقافية معاً.
• <b>🎲 كاسر الجليد:</b> أرسل أسئلة عشوائية لبدء محادثة.
• <b>😍 إرسال تفاعل:</b> أرسل رموزاً تعبيرية ممتعة لشريكك.

🌐 <b>الاجتماعية والتواصل</b>
• <b>👁️ معلومات الشريك:</b> (للمميزين) اكتشف الهوية الحقيقية لشريكك!
• <b>💌 قدّم نفسك:</b> شارك معرف تيليجرام الخاص بك بأناقة.

💎 <b>الاقتصاد والـ VIP</b>
• <b>🌟 ترقية للمميز:</b> احصل على شارة [VIP]، بدون إعلانات وميزات حصرية.

━━━━━━━━━━━━━━━━━━━━
<i>💡 يرجى الحفاظ على الآداب. خصوصيتك وأمانك هما أولويتنا!</i>`,
        captcha_code_q: `🤖 قبل البحث عن شريك، أثبت أنك لست روبوتاً!

اختر الرمز <b>المطابق تماماً</b> للنص أدناه:`,
        captcha_math_q: `🧮 قبل البحث عن شريك، احل هذه المسألة الرياضية!

ما هي نتيجة:`,
        captcha_wrong: "❌ إجابة خاطئة! حاول مرة أخرى بتحدٍ جديد.",
        captcha_passed: "✅ تم التحقق بنجاح! جاري البحث عن شريك...",
        captcha_expired: "⏰ انتهى وقت التحقق. اكتب /search للمحاولة مرة أخرى.",
        captcha_title: "🔐 التحقق الأمني",
        plan_1w: "بريميوم 1 أسبوع",
        plan_1m: "بريميوم 1 شهر",
        plan_2m: "بريميوم 2 أشهر",
        plan_3m: "بريميوم 3 أشهر",
        plan_1y: "بريميوم 1 سنة",
        plan_vip: "VIP سلطان 1 سنة",
        recovery_title: "↩️ <b>ندمت على الضغط؟</b>",
        recovery_body: "⏳ لديك <b>30 ثانية</b> للعودة إلى شريكك السابق!",
        btn_recovery_back: "↩️ العودة إلى الشريك السابق",
        btn_recovery_skip: "🔍 إيجاد شريك جديد الآن",
        recovery_used_alert: "❌ تم استخدام هذا الزر بالفعل في هذه الجلسة!",
        partner_typing: "✍️ <i>الشريك يكتب...</i>",
    },
    ms: {
        prem_btn_7: "🌟 1 Minggu (50 ⭐️)",
        prem_btn_30: "🌟 1 Bulan (75 ⭐️)",
        prem_btn_60: "🌟 2 Bulan (120 ⭐️)",
        prem_btn_90: "🌟 3 Bulan (175 ⭐️)",
        prem_btn_365: "👑 VIP 1 Tahun (350 ⭐️)",
        name: "🇲🇾 Bahasa Melayu",
        greeting_pagi: "Selamat Pagi",
        greeting_siang: "Selamat Tengahari",
        greeting_sore: "Selamat Petang",
        greeting_malam: "Selamat Malam",
        menu_welcome_text: "Masuk ke dalam rangkaian, temui sambungan baharu, dan biarkan identiti anda menjadi misteri. Tiada batasan, tiada jejak. Hanya anda dan ribuan pengguna lain yang menunggu di seluruh dunia.",
        prem_title: "💎 <b>NAIK TARAF KE PREMIUM ATAU VIP SULTAN</b> 💎",
        prem_desc: `🚀 <b>Jadilah Penguasa Komuniti!</b>
Buka semua had dan nikmati ciri eksklusif berikut:

🎯 <b>Bebas Memilih Jantina</b>: Cari rakan lelaki atau perempuan secara spesifik mengikut kehendak anda.
🕵️ <b>Akses Maklumat Rahsia</b>: Intai identiti sebenar dan profil penuh rakan sembang anda tanpa had!
🎖️ <b>Lencana Eksklusif VIP</b>: Pamerkan lencana hebat 👑 <b>[VIP SULTAN]</b> di sebelah nama anda agar semua tahu status berprestij anda.
⚡ <b>Keutamaan Padanan</b>: Diberi keutamaan dalam barisan padanan.

Jangan biarkan sembang anda disekat. Jadilah ahli keutamaan sekarang juga!`,
        prem_vip_info: `<i>💡 <b>Info Khas VIP SULTAN:</b>
Kos status VIP selama 12 bulan ialah — 1000 Telegram Stars / Rp349.000.
Teruskan ke pembayaran menggunakan butang di bawah:</i>`,
        btn_back_main: "🔙 Kembali ke Menu Utama",
        menu_title: "⚡ <b>ANONYMOUS CHAT EXPERT</b> ⚡",
        menu_subtitle: `<i>⚡ Fast Match · 🌍 Global · 🔒 Tanpa Nama
"Jumpa kawan dengan pantas, tanpa nama!"</i>`,
        menu_server: "🌐 <b>STATUS PELAYAN</b>",
        menu_users: "👥 Berdaftar",
        menu_online: "🟢 Aktif/Dalam Talian",
        menu_wallet: "💼 <b>DOMPET & LESEN</b>",
        menu_choose: "<i>Pilih menu di bawah untuk bermula:</i>",
        btn_search_random: "🔍 Cari Rakan Rawak (Percuma)",
        btn_search_male: "👦 Lelaki (Premium)",
        btn_search_female: "👧 Perempuan (Premium)",
        btn_profile: "🪪 Info Profil & Jantina",
        btn_vip: "💎 Naik Taraf VIP",
        btn_broadcast: "📢 Pengumuman",
        btn_channel: "📣 Saluran Rasmi",
        btn_owner: "👨‍💻 Hubungi Pemilik",
        btn_back: "🔙 Kembali ke Menu Utama",
        btn_change_gender: "⚙️ Tukar Jantina",
        btn_change_lang: "🌐 Tukar Bahasa",
        btn_cancel: "❌ Batal",
        searching: `⏳ *Mencari rakan bual...*
_Taip /stop untuk membatalkan._`,
        partner_found: `✅ *RAKAN DIJUMPAI!*

Anda kini disambungkan. Sapa rakan bual anda!

_Taip /next untuk rakan baru._
_Taip /stop untuk tamat sembang._`,
        chat_ended: `🛑 <b>SEMBANG TAMAT!</b> 🛑
━━━━━━━━━━━━━━━━━━━━

Anda telah menamatkan perbualan ini. Kadang-kala, kita memang perlu melangkah pergi untuk menemui cerita yang baharu... ✨

Siapalah agaknya orang misteri yang sedang menunggu untuk menyapa anda hari ini?

👉 <i>Taip /search atau /next untuk terus berhubung dengan rakan sembang yang baharu!</i>`,
        chat_next: "🔄 Mencari rakan baru...",
        partner_left: `🛑 <b>ALAMAK... SEMBANG TAMAT!</b> 🛑
━━━━━━━━━━━━━━━━━━━━

Pasangan borak anda telah meninggalkan sembang dan hilang ke dalam bayang-bayang... 💨

Jangan sedih! Terdapat beribu-ribu orang hebat di luar sana yang menunggu untuk bersembang dengan anda sekarang juga.

👉 <i>Taip /search atau klik butang di bawah untuk mencari rakan baru!</i>`,
        feedback_prompt: "Jika mahu, tinggalkan maklum balas tentang rakan bual anda:",
        lang_changed: "✅ Bahasa telah ditukar ke 🇲🇾 Bahasa Melayu!",
        lang_menu_title: "🌐 <b>PILIH BAHASA / SELECT LANGUAGE</b>",
        lang_menu_body: `Pilih bahasa utama yang ingin anda gunakan untuk antara muka bot ini. 🌐

🤖 <b>Sistem Pemadanan Pintar (AI):</b>
Bahasa yang anda pilih di sini bukan sahaja menukar teks menu, tetapi ia juga membantu sistem AI kami mencari rakan bual yang paling sesuai untuk anda! Kami akan mengutamakan untuk menghubungkan anda dengan pengguna lain yang menggunakan bahasa yang sama, supaya perbualan anda lebih selesa dan menarik.

<i>Sila pilih bahasa anda di bawah:</i>`,
        btn_view_partner: "👁️ Lihat Info Rakan",
        btn_share_username: "💌 Perkenalkan Diri (Kongsi Username)",
        premium_info: `🌟 *EKSKLUSIF: KELEBIHAN PENGGUNA PREMIUM* 🌟

Tingkatkan pengalaman sembang anda! Dengan Premium, anda buka semua batasan:

👑 *Lencana & Status VIP*
Tampil beza! Mesej anda akan ditandai dengan lencana \`[PREMIUM]\` eksklusif.

🚻 *Penapis Jantina Bebas*
Pilih secara spesifik sama ada anda ingin berbual dengan Lelaki atau Perempuan.

👁️ *Buka Identiti Rahsia*
Hanya Premium boleh tembus dinding tanpa nama dan lihat profil sebenar rakan bual (tanpa tapisan!).

🚀 *Keutamaan Padanan VIP*
Sistem AI kami letak anda di barisan hadapan. Jumpa rakan aktif dan elak akaun spam.

🚫 *100% Bebas Iklan*
Skrin bersih tanpa sebarang gangguan.`,
        prem_not_enough: "❌ Stars tidak mencukupi! Sila topup terlebih dahulu.",
        prem_success: "🎉 *TAHNIAH!* Akaun anda kini 🌟 PREMIUM selama {days} hari!",
        features_text: `📋 <b>PUSAT PANDUAN & CIRI PENUH</b> 📋
━━━━━━━━━━━━━━━━━━━━

Selamat datang ke pusat arahan! Berikut adalah senarai lengkap ciri-ciri hebat yang anda boleh gunakan:

💬 <b>CIRI SEMBANG</b>
• <b>🔍 Cari Rakan:</b> Padanan tanpa nama serta-merta.
• <b>🚻 Penapis Jantina:</b> (Premium) Pilih rakan bual Lelaki/Perempuan.
• <b>🔄 /next & 🛑 /stop:</b> Tukar rakan atau tamatkan sembang serta-merta.
• <b>💬 Balas Mesej:</b> Balas mesej spesifik seperti dalam grup.

🎮 <b>MINI GAME & INTERAKSI</b>
• <b>🎰 Main Slot:</b> Uji keserasian anda dengan mesin slot animasi!
• <b>❓ Kuiz Cepat:</b> Main teka-teki trivia berdua.
• <b>🎲 Icebreaker:</b> Hantar soalan rawak untuk mulakan perbualan.
• <b>😍 Hantar Reaksi:</b> Baling emoji comel ke skrin rakan anda.

• <b>👁️ Info Rakan:</b> (Premium) Intai identiti sebenar rakan bual anda!
• <b>💌 Kenalkan Diri:</b> Kongsi username Telegram anda dengan elegan.

💎 <b>EKONOMI & VIP</b>

━━━━━━━━━━━━━━━━━━━━
<i>💡 Sila jaga adab ketika berbual. Privasi dan keselamatan anda adalah keutamaan kami!</i>`,
        captcha_code_q: `🤖 Sebelum mencari rakan, buktikan anda bukan robot!

Pilih kod yang <b>SAMA PERSIS</b> dengan teks di bawah:`,
        captcha_math_q: `🧮 Sebelum mencari rakan, selesaikan soalan matematik ini!

Berapakah hasilnya:`,
        captcha_wrong: "❌ Jawapan salah! Cuba lagi dengan cabaran baru.",
        captcha_passed: "✅ Pengesahan berjaya! Sedang mencari rakan...",
        captcha_expired: "⏰ Masa pengesahan tamat. Taip /search untuk cuba lagi.",
        captcha_title: "🔐 PENGESAHAN KESELAMATAN",
        plan_1w: "Premium 1 Minggu",
        plan_1m: "Premium 1 Bulan",
        plan_2m: "Premium 2 Bulan",
        plan_3m: "Premium 3 Bulan",
        plan_1y: "Premium 1 Tahun",
        plan_vip: "VIP SULTAN 1 Tahun",
        recovery_title: "↩️ <b>MENYESAL TEKAN NEXT?</b>",
        recovery_body: "⏳ Anda ada <b>30 saat</b> untuk kembali ke rakan sebelumnya!",
        btn_recovery_back: "↩️ Kembali ke Rakan Sebelumnya",
        btn_recovery_skip: "🔍 Cari Rakan Baru Sekarang",
        recovery_used_alert: "❌ Butang ini telah digunakan untuk sesi ini!",
        partner_typing: "✍️ <i>Rakan sedang menaip...</i>",
    },
    zh: {
        prem_btn_7: "🌟 1 周 (50 ⭐️)",
        prem_btn_30: "🌟 1 个月 (75 ⭐️)",
        prem_btn_60: "🌟 2 个月 (120 ⭐️)",
        prem_btn_90: "🌟 3 个月 (175 ⭐️)",
        prem_btn_365: "👑 VIP 1 年 (350 ⭐️)",
        name: "🇨🇳 中文",
        greeting_pagi: "早上好",
        greeting_siang: "中午好",
        greeting_sore: "下午好",
        greeting_malam: "晚上好",
        menu_welcome_text: "进入网络，寻找新的连接，让你的身份保持神秘。没有限制，不留痕迹。只有你和全球成千上万的其他用户在这里等待。",
        prem_title: "💎 <b>升级至高级版或 VIP SULTAN</b> 💎",
        prem_desc: `🚀 <b>成为社区的统治者！</b>
解锁所有限制并享受以下专属功能：

🎯 <b>自由选择性别</b>：根据您的意愿专门搜索男性或女性伴侣。
🕵️ <b>访问机密信息</b>：无限制地偷看您的聊天伙伴的真实身份和完整资料！
🎖️ <b>专属 VIP 徽章</b>：在您的名字旁边炫耀酷炫的 👑 <b>[VIP SULTAN]</b> 徽章，让所有人都知道您的尊贵身份。
⚡ <b>优先匹配</b>：在匹配队列中获得优先权。

不要让您的聊天受到限制。现在就成为优先会员吧！`,
        prem_vip_info: `<i>💡 <b>专属 VIP SULTAN 信息：</b>
12 个月 VIP 身份的费用为 — 1000 Telegram Stars / Rp349.000。
请使用下面的按钮继续付款：</i>`,
        btn_back_main: "🔙 返回主菜单",
        menu_title: "⚡ <b>ANONYMOUS CHAT EXPERT</b> ⚡",
        menu_subtitle: `<i>⚡ 闪速配对 · 🌍 全球 · 🔒 匿名
"以光速找到聊天伙伴，无需透露姓名！"</i>`,
        menu_server: "🌐 <b>服务器状态</b>",
        menu_users: "👥 已注册",
        menu_online: "🟢 活跃/在线",
        menu_wallet: "💼 <b>钱包与许可证</b>",
        menu_choose: "<i>选择下方菜单开始：</i>",
        btn_search_random: "🔍 随机找朋友 (免费)",
        btn_search_male: "👦 找男生 (高级)",
        btn_search_female: "👧 找女生 (高级)",
        btn_profile: "🪪 个人资料",
        btn_vip: "💎 升级VIP",
        btn_broadcast: "📢 公告",
        btn_channel: "📣 官方频道",
        btn_owner: "👨‍💻 联系管理员",
        btn_back: "🔙 返回主菜单",
        btn_change_gender: "⚙️ 更改性别",
        btn_change_lang: "🌐 更改语言",
        btn_cancel: "❌ 取消",
        searching: `⏳ *正在寻找聊天伙伴...*
_输入 /stop 取消。_`,
        partner_found: `✅ *找到伙伴！*

你们现在已连接。向你的聊天伙伴打个招呼吧！

_输入 /next 寻找新伙伴。_
_输入 /stop 结束聊天。_`,
        chat_ended: `🛑 <b>聊天已结束！</b> 🛑
━━━━━━━━━━━━━━━━━━━━

你已经结束了这次对话。有时候，我们必须继续前进才能发现新的故事... ✨

今天还有谁在等着和你打招呼呢？

👉 <i>输入 /search 或 /next 立即与新的聊天伙伴建立连接！</i>`,
        chat_next: "🔄 正在寻找新伙伴...",
        partner_left: `🛑 <b>哎呀... 聊天结束了！</b> 🛑
━━━━━━━━━━━━━━━━━━━━

你的聊天对象已经离开了聊天室，消失在阴影中... 💨

别伤心！现在还有成千上万个有趣的人等着和你聊天呢。

👉 <i>输入 /search 或点击下方的按钮寻找新伙伴吧！</i>`,
        feedback_prompt: "如果你愿意，请对你的聊天伙伴留下反馈：",
        lang_changed: "✅ 语言已更改为 🇨🇳 中文！",
        lang_menu_title: "🌐 <b>PILIH BAHASA / SELECT LANGUAGE</b>",
        lang_menu_body: `选择您希望在此机器人界面中使用的主要语言。 🌐

🤖 <b>智能 AI 匹配系统：</b>
您在此处选择的语言不仅会更改菜单文本，还会帮助我们的 AI 系统为您找到最合适的聊天伙伴！我们将优先为您连接使用相同语言的其他用户，确保您的对话更加顺畅和有趣。

<i>请在下方选择您的语言：</i>`,
        btn_view_partner: "👁️ 查看对方信息",
        btn_share_username: "💌 自我介绍 (分享用户名)",
        premium_info: `🌟 *独家：高级用户特权* 🌟

将您的聊天体验提升到最高水平！成为高级用户，解锁所有限制：

👑 *VIP徽章与身份*
脱颖而出！您的消息将带有优雅的\`[PREMIUM]\`徽章。

🚻 *终极性别筛选*
精准选择与男生或女生聊天。

👁️ *揭开神秘面纱*
只有高级用户才能打破匿名墙，查看对方的真实个人资料（无审查！）。

🚀 *VIP优先匹配*
我们的AI系统将您排在队列最前面。结识活跃、有趣的伙伴。

🚫 *100%无广告*
干净的屏幕，没有任何广告打扰。`,
        prem_not_enough: "❌ Stars不足！请先充值。",
        prem_success: "🎉 *恭喜！* 您的账号在接下来的 {days} 天内已成为 🌟 高级用户！",
        features_text: `📋 <b>完整指南与功能中心</b> 📋
━━━━━━━━━━━━━━━━━━━━

欢迎来到控制中心！以下是您可以使用的所有高级功能：

💬 <b>聊天功能</b>
• <b>🔍 寻找朋友：</b> 即时匿名匹配。
• <b>🚻 性别筛选：</b> (高级) 选择男生或女生进行聊天。
• <b>🔄 /next & 🛑 /stop：</b> 立即更换伙伴或结束聊天。
• <b>💬 回复消息：</b> 像在群组中一样引用并回复特定消息。

🎮 <b>迷你游戏与互动</b>
• <b>🎰 玩老虎机：</b> 用动画老虎机测试你们的默契！
• <b>❓ 快速问答：</b> 一起玩知识问答游戏。
• <b>🎲 破冰问题：</b> 发送随机问题以开启对话。
• <b>😍 发送反应：</b> 向对方屏幕发送可爱的表情符号。

🌐 <b>社交与连接</b>
• <b>👁️ 伙伴信息：</b> (高级) 揭开对方的真实身份！
• <b>💌 自我介绍：</b> 优雅地分享您的Telegram用户名。

💎 <b>经济与VIP</b>
• <b>🌟 升级VIP：</b> 获得[VIP SULTAN]徽章、免广告及专属功能。

━━━━━━━━━━━━━━━━━━━━
<i>💡 请保持良好的聊天礼仪。您的隐私和安全是我们的首要任务！</i>`,
        captcha_code_q: `🤖 搜索伙伴前，请证明你不是机器人！

请选择与下方文字<b>完全相同</b>的代码:`,
        captcha_math_q: `🧮 搜索伙伴前，请解决这道数学题！

结果是多少:`,
        captcha_wrong: "❌ 答案错误！请用新题目再试一次。",
        captcha_passed: "✅ 验证成功！正在搜索伙伴...",
        captcha_expired: "⏰ 验证超时。输入 /search 重试。",
        captcha_title: "🔐 安全验证",
        plan_1w: "高级版 1 周",
        plan_1m: "高级版 1 个月",
        plan_2m: "高级版 2 个月",
        plan_3m: "高级版 3 个月",
        plan_1y: "高级版 1 年",
        plan_vip: "VIP SULTAN 1 年",
        recovery_title: "↩️ <b>后悔按了 NEXT？</b>",
        recovery_body: "⏳ 你有 <b>30秒</b> 回到上一位聊天对象！",
        btn_recovery_back: "↩️ 回到上一位聊天对象",
        btn_recovery_skip: "🔍 立即寻找新伙伴",
        recovery_used_alert: "❌ 此按钮在本次会话中已被使用！",
        partner_typing: "✍️ <i>对方正在输入...</i>",
    },
};

module.exports = LANGS;
