// File: quiz.js
// KUMPULAN SOAL KUIS MULTI-BAHASA (PART 1)

const QUIZ_LIST = [
    // ==========================================
    // 🌍 KATEGORI: PENGETAHUAN UMUM
    // ==========================================
    {
        id: { q: '🌍 Ibu kota Australia?', a: 'Canberra', choices: ['Sydney', 'Melbourne', 'Canberra', 'Brisbane'] },
        en: { q: '🌍 Capital of Australia?', a: 'Canberra', choices: ['Sydney', 'Melbourne', 'Canberra', 'Brisbane'] },
        ar: { q: '🌍 عاصمة أستراليا؟', a: 'كانبرا', choices: ['سيدني', 'ملبورن', 'كانبرا', 'بريزبان'] },
        ms: { q: '🌍 Ibu negara Australia?', a: 'Canberra', choices: ['Sydney', 'Melbourne', 'Canberra', 'Brisbane'] },
        zh: { q: '🌍 澳大利亚的首都是哪里？', a: '堪培拉', choices: ['悉尼', '墨尔本', '堪培拉', '布里斯班'] }
    },
    {
        id: { q: '🧮 Berapakah akar kuadrat dari 144?', a: '12', choices: ['11', '12', '13', '14'] },
        en: { q: '🧮 What is the square root of 144?', a: '12', choices: ['11', '12', '13', '14'] },
        ar: { q: '🧮 ما هو الجذر التربيعي لـ 144؟', a: '12', choices: ['11', '12', '13', '14'] },
        ms: { q: '🧮 Berapakah punca kuasa dua bagi 144?', a: '12', choices: ['11', '12', '13', '14'] },
        zh: { q: '🧮 144的平方根是多少？', a: '12', choices: ['11', '12', '13', '14'] }
    },
    {
        id: { q: '🌊 Samudra terluas di dunia?', a: 'Pasifik', choices: ['Atlantik', 'Hindia', 'Pasifik', 'Arktik'] },
        en: { q: '🌊 The largest ocean in the world?', a: 'Pacific', choices: ['Atlantic', 'Indian', 'Pacific', 'Arctic'] },
        ar: { q: '🌊 أكبر محيط في العالم؟', a: 'الهادئ', choices: ['الأطلسي', 'الهندي', 'الهادئ', 'القطبي'] },
        ms: { q: '🌊 Lautan terbesar di dunia?', a: 'Pasifik', choices: ['Atlantik', 'Hindi', 'Pasifik', 'Artik'] },
        zh: { q: '🌊 世界上最大的大洋是？', a: '太平洋', choices: ['大西洋', '印度洋', '太平洋', '北冰洋'] }
    },
    {
        id: { q: '🦁 Hewan apa yang disebut Raja Hutan?', a: 'Singa', choices: ['Harimau', 'Singa', 'Elang', 'Buaya'] },
        en: { q: '🦁 Which animal is called the King of the Jungle?', a: 'Lion', choices: ['Tiger', 'Lion', 'Eagle', 'Crocodile'] },
        ar: { q: '🦁 ما هو الحيوان الملقب بملك الغابة؟', a: 'الأسد', choices: ['النمر', 'الأسد', 'النسر', 'التمساح'] },
        ms: { q: '🦁 Haiwan apakah yang dipanggil Raja Rimba?', a: 'Singa', choices: ['Harimau', 'Singa', 'Helang', 'Buaya'] },
        zh: { q: '🦁 被称为“万兽之王”的动物是？', a: '狮子', choices: ['老虎', '狮子', '老鹰', '鳄鱼'] }
    },
    {
        id: { q: '🎨 Campuran warna merah dan biru menghasilkan warna?', a: 'Ungu', choices: ['Hijau', 'Orange', 'Ungu', 'Coklat'] },
        en: { q: '🎨 Mixing red and blue produces which color?', a: 'Purple', choices: ['Green', 'Orange', 'Purple', 'Brown'] },
        ar: { q: '🎨 مزج اللونين الأحمر والأزرق ينتج لون؟', a: 'أرجواني', choices: ['أخضر', 'برتقالي', 'أرجواني', 'بني'] },
        ms: { q: '🎨 Campuran warna merah dan biru menghasilkan warna?', a: 'Ungu', choices: ['Hijau', 'Oren', 'Ungu', 'Coklat'] },
        zh: { q: '🎨 红色和蓝色混合会产生什么颜色？', a: '紫色', choices: ['绿色', '橙色', '紫色', '棕色'] }
    },
    {
        id: { q: '🌙 Planet terdekat dengan Matahari?', a: 'Merkurius', choices: ['Venus', 'Merkurius', 'Mars', 'Bumi'] },
        en: { q: '🌙 Closest planet to the Sun?', a: 'Mercury', choices: ['Venus', 'Mercury', 'Mars', 'Earth'] },
        ar: { q: '🌙 أقرب كوكب إلى الشمس؟', a: 'عطارد', choices: ['الزهرة', 'عطارد', 'المريخ', 'الأرض'] },
        ms: { q: '🌙 Planet terdekat dengan Matahari?', a: 'Utarid', choices: ['Zuhrah', 'Utarid', 'Marikh', 'Bumi'] },
        zh: { q: '🌙 离太阳最近的行星是？', a: '水星', choices: ['金星', '水星', '火星', '地球'] }
    },
    {
        id: { q: '🗺️ Benua terbesar di dunia adalah?', a: 'Asia', choices: ['Afrika', 'Eropa', 'Asia', 'Amerika'] },
        en: { q: '🗺️ The largest continent in the world is?', a: 'Asia', choices: ['Africa', 'Europe', 'Asia', 'America'] },
        ar: { q: '🗺️ أكبر قارة في العالم هي؟', a: 'آسيا', choices: ['أفريقيا', 'أوروبا', 'آسيا', 'أمريكا'] },
        ms: { q: '🗺️ Benua terbesar di dunia ialah?', a: 'Asia', choices: ['Afrika', 'Eropah', 'Asia', 'Amerika'] },
        zh: { q: '🗺️ 世界上最大的大洲是？', a: '亚洲', choices: ['非洲', '欧洲', '亚洲', '美洲'] }
    },
    {
        id: { q: '💡 Siapa penemu bola lampu pijar?', a: 'Thomas Edison', choices: ['Nikola Tesla', 'Albert Einstein', 'Thomas Edison', 'Isaac Newton'] },
        en: { q: '💡 Who invented the incandescent light bulb?', a: 'Thomas Edison', choices: ['Nikola Tesla', 'Albert Einstein', 'Thomas Edison', 'Isaac Newton'] },
        ar: { q: '💡 من اخترع المصباح الكهربائي؟', a: 'توماس إديسون', choices: ['نيكولا تسلا', 'ألبرت أينشتاين', 'توماس إديسون', 'إسحاق نيوتن'] },
        ms: { q: '💡 Siapakah pencipta mentol lampu pijar?', a: 'Thomas Edison', choices: ['Nikola Tesla', 'Albert Einstein', 'Thomas Edison', 'Isaac Newton'] },
        zh: { q: '💡 谁发明了白炽灯泡？', a: '托马斯·爱迪生', choices: ['尼古拉·特斯拉', '阿尔伯特·爱因斯坦', '托马斯·爱迪生', '艾萨克·牛顿'] }
    },
    {
        id: { q: '🗼 Di kota manakah Menara Eiffel berada?', a: 'Paris', choices: ['London', 'Roma', 'Berlin', 'Paris'] },
        en: { q: '🗼 In which city is the Eiffel Tower located?', a: 'Paris', choices: ['London', 'Rome', 'Berlin', 'Paris'] },
        ar: { q: '🗼 في أي مدينة يقع برج إيفل؟', a: 'باريس', choices: ['لندن', 'روما', 'برلين', 'باريس'] },
        ms: { q: '🗼 Di bandar manakah Menara Eiffel terletak?', a: 'Paris', choices: ['London', 'Rom', 'Berlin', 'Paris'] },
        zh: { q: '🗼 埃菲尔铁塔位于哪个城市？', a: '巴黎', choices: ['伦敦', '罗马', '柏林', '巴黎'] }
    },
    {
        id: { q: '🩸 Organ tubuh yang berfungsi memompa darah adalah?', a: 'Jantung', choices: ['Paru-paru', 'Ginjal', 'Hati', 'Jantung'] },
        en: { q: '🩸 Which organ pumps blood throughout the body?', a: 'Heart', choices: ['Lungs', 'Kidneys', 'Liver', 'Heart'] },
        ar: { q: '🩸 ما هو العضو الذي يضخ الدم في الجسم؟', a: 'القلب', choices: ['الرئتين', 'الكليتين', 'الكبد', 'القلب'] },
        ms: { q: '🩸 Organ yang berfungsi mengepam darah ialah?', a: 'Jantung', choices: ['Paru-paru', 'Buah pinggang', 'Hati', 'Jantung'] },
        zh: { q: '🩸 负责人体泵血的器官是？', a: '心脏', choices: ['肺部', '肾脏', '肝脏', '心脏'] }
    },

    // ==========================================
    // 💻 KATEGORI: TEKNOLOGI TERBARU
    // ==========================================
    {
        id: { q: '📱 Siapa pendiri perusahaan Apple?', a: 'Steve Jobs', choices: ['Bill Gates', 'Elon Musk', 'Steve Jobs', 'Mark Zuckerberg'] },
        en: { q: '📱 Who is the founder of Apple Inc.?', a: 'Steve Jobs', choices: ['Bill Gates', 'Elon Musk', 'Steve Jobs', 'Mark Zuckerberg'] },
        ar: { q: '📱 من هو مؤسس شركة آبل؟', a: 'ستيف جوبز', choices: ['بيل غيتس', 'إيلون ماسك', 'ستيف جوبز', 'مارك زوكربيرغ'] },
        ms: { q: '📱 Siapakah pengasas syarikat Apple?', a: 'Steve Jobs', choices: ['Bill Gates', 'Elon Musk', 'Steve Jobs', 'Mark Zuckerberg'] },
        zh: { q: '📱 苹果公司的创始人是谁？', a: '史蒂夫·乔布斯', choices: ['比尔·盖茨', '埃隆·马斯克', '史蒂夫·乔布斯', '马克·扎克伯格'] }
    },
    {
        id: { q: '🤖 AI populer buatan OpenAI yang bisa chatting adalah?', a: 'ChatGPT', choices: ['Siri', 'Alexa', 'ChatGPT', 'Cortana'] },
        en: { q: '🤖 Popular conversational AI made by OpenAI?', a: 'ChatGPT', choices: ['Siri', 'Alexa', 'ChatGPT', 'Cortana'] },
        ar: { q: '🤖 ذكاء اصطناعي شهير للمحادثة من OpenAI؟', a: 'ChatGPT', choices: ['Siri', 'Alexa', 'ChatGPT', 'Cortana'] },
        ms: { q: '🤖 AI perbualan popular buatan OpenAI?', a: 'ChatGPT', choices: ['Siri', 'Alexa', 'ChatGPT', 'Cortana'] },
        zh: { q: '🤖 OpenAI 制作的流行聊天 AI 是？', a: 'ChatGPT', choices: ['Siri', 'Alexa', 'ChatGPT', 'Cortana'] }
    },
    {
        id: { q: '🪙 Mata uang kripto pertama dan paling populer di dunia?', a: 'Bitcoin', choices: ['Ethereum', 'Dogecoin', 'Bitcoin', 'Solana'] },
        en: { q: '🪙 The first and most popular cryptocurrency in the world?', a: 'Bitcoin', choices: ['Ethereum', 'Dogecoin', 'Bitcoin', 'Solana'] },
        ar: { q: '🪙 أول وأشهر عملة مشفرة في العالم؟', a: 'بيتكوين', choices: ['إيثريوم', 'دوجكوين', 'بيتكوين', 'سولانا'] },
        ms: { q: '🪙 Mata wang kripto pertama dan paling popular di dunia?', a: 'Bitcoin', choices: ['Ethereum', 'Dogecoin', 'Bitcoin', 'Solana'] },
        zh: { q: '🪙 世界上第一种也是最流行的加密货币是？', a: '比特币', choices: ['以太坊', '狗狗币', '比特币', 'Solana'] }
    },
    {
        id: { q: '☁️ Layanan Cloud Computing dari Amazon disebut?', a: 'AWS', choices: ['Azure', 'GCP', 'AWS', 'DigitalOcean'] },
        en: { q: '☁️ Amazon\'s Cloud Computing service is called?', a: 'AWS', choices: ['Azure', 'GCP', 'AWS', 'DigitalOcean'] },
        ar: { q: '☁️ خدمة الحوسبة السحابية من أمازون تسمى؟', a: 'AWS', choices: ['Azure', 'GCP', 'AWS', 'DigitalOcean'] },
        ms: { q: '☁️ Perkhidmatan Pengkomputeran Awan dari Amazon dipanggil?', a: 'AWS', choices: ['Azure', 'GCP', 'AWS', 'DigitalOcean'] },
        zh: { q: '☁️ 亚马逊的云计算服务叫什么？', a: 'AWS', choices: ['Azure', 'GCP', 'AWS', 'DigitalOcean'] }
    },
    {
        id: { q: '📸 Aplikasi berbagi foto & video yang dibeli Meta/Facebook?', a: 'Instagram', choices: ['Snapchat', 'TikTok', 'Instagram', 'Pinterest'] },
        en: { q: '📸 Photo & video sharing app bought by Meta/Facebook?', a: 'Instagram', choices: ['Snapchat', 'TikTok', 'Instagram', 'Pinterest'] },
        ar: { q: '📸 تطبيق مشاركة الصور والفيديو الذي اشترته ميتا/فيسبوك؟', a: 'إنستغرام', choices: ['سناب شات', 'تيك توك', 'إنستغرام', 'بينتريست'] },
        ms: { q: '📸 Aplikasi perkongsian gambar & video yang dibeli Meta?', a: 'Instagram', choices: ['Snapchat', 'TikTok', 'Instagram', 'Pinterest'] },
        zh: { q: '📸 Meta/Facebook 收购的照片和视频分享应用是？', a: 'Instagram', choices: ['Snapchat', 'TikTok', 'Instagram', 'Pinterest'] }
    },
    {
        id: { q: '🚀 Siapa CEO dari perusahaan SpaceX dan Tesla?', a: 'Elon Musk', choices: ['Jeff Bezos', 'Elon Musk', 'Tim Cook', 'Sundar Pichai'] },
        en: { q: '🚀 Who is the CEO of SpaceX and Tesla?', a: 'Elon Musk', choices: ['Jeff Bezos', 'Elon Musk', 'Tim Cook', 'Sundar Pichai'] },
        ar: { q: '🚀 من هو الرئيس التنفيذي لشركتي سبيس إكس وتسلا؟', a: 'إيلون ماسك', choices: ['جيف بيزوس', 'إيلون ماسك', 'تيم كوك', 'سوندار بيتشاي'] },
        ms: { q: '🚀 Siapakah CEO bagi syarikat SpaceX dan Tesla?', a: 'Elon Musk', choices: ['Jeff Bezos', 'Elon Musk', 'Tim Cook', 'Sundar Pichai'] },
        zh: { q: '🚀 谁是 SpaceX 和特斯拉的首席执行官？', a: '埃隆·马斯克', choices: ['杰夫·贝佐斯', '埃隆·马斯克', '蒂姆·库克', '桑达尔·皮查伊'] }
    },
    {
        id: { q: '📡 Teknologi jaringan nirkabel jarak dekat disebut?', a: 'Bluetooth', choices: ['Wi-Fi', 'Bluetooth', 'NFC', 'Infrared'] },
        en: { q: '📡 Short-range wireless network technology is called?', a: 'Bluetooth', choices: ['Wi-Fi', 'Bluetooth', 'NFC', 'Infrared'] },
        ar: { q: '📡 تقنية الشبكة اللاسلكية قصيرة المدى تسمى؟', a: 'بلوتوث', choices: ['واي فاي', 'بلوتوث', 'NFC', 'الأشعة تحت الحمراء'] },
        ms: { q: '📡 Teknologi rangkaian tanpa wayar jarak dekat dipanggil?', a: 'Bluetooth', choices: ['Wi-Fi', 'Bluetooth', 'NFC', 'Inframerah'] },
        zh: { q: '📡 近距离无线网络技术称为什么？', a: '蓝牙', choices: ['Wi-Fi', '蓝牙', 'NFC', '红外线'] }
    },
    {
        id: { q: '🔒 Protokol keamanan untuk website agar koneksi terenkripsi?', a: 'HTTPS', choices: ['HTTP', 'FTP', 'HTTPS', 'SSH'] },
        en: { q: '🔒 Security protocol for encrypted website connections?', a: 'HTTPS', choices: ['HTTP', 'FTP', 'HTTPS', 'SSH'] },
        ar: { q: '🔒 بروتوكول الأمان لتشفير اتصالات مواقع الويب؟', a: 'HTTPS', choices: ['HTTP', 'FTP', 'HTTPS', 'SSH'] },
        ms: { q: '🔒 Protokol keselamatan untuk sambungan laman web yang disulitkan?', a: 'HTTPS', choices: ['HTTP', 'FTP', 'HTTPS', 'SSH'] },
        zh: { q: '🔒 用于加密网站连接的安全协议是？', a: 'HTTPS', choices: ['HTTP', 'FTP', 'HTTPS', 'SSH'] }
    },
    {
        id: { q: '🍎 Sistem operasi yang digunakan pada perangkat iPhone?', a: 'iOS', choices: ['Android', 'macOS', 'iOS', 'Windows'] },
        en: { q: '🍎 The operating system used on iPhone devices?', a: 'iOS', choices: ['Android', 'macOS', 'iOS', 'Windows'] },
        ar: { q: '🍎 نظام التشغيل المستخدم في أجهزة آيفون؟', a: 'iOS', choices: ['أندرويد', 'ماك', 'iOS', 'ويندوز'] },
        ms: { q: '🍎 Sistem operasi yang digunakan pada peranti iPhone?', a: 'iOS', choices: ['Android', 'macOS', 'iOS', 'Windows'] },
        zh: { q: '🍎 iPhone 设备使用的操作系统是？', a: 'iOS', choices: ['Android', 'macOS', 'iOS', 'Windows'] }
    },
    {
        id: { q: '🎮 Perusahaan pembuat konsol game PlayStation?', a: 'Sony', choices: ['Microsoft', 'Nintendo', 'Sony', 'Sega'] },
        en: { q: '🎮 The company that created the PlayStation game console?', a: 'Sony', choices: ['Microsoft', 'Nintendo', 'Sony', 'Sega'] },
        ar: { q: '🎮 الشركة المصنعة لجهاز ألعاب بلاي ستيشن؟', a: 'سوني', choices: ['مايكروسوفت', 'نينتندو', 'سوني', 'سيجا'] },
        ms: { q: '🎮 Syarikat yang mencipta konsol permainan PlayStation?', a: 'Sony', choices: ['Microsoft', 'Nintendo', 'Sony', 'Sega'] },
        zh: { q: '🎮 制造 PlayStation 游戏主机的公司是？', a: '索尼', choices: ['微软', '任天堂', '索尼', '世嘉'] }
    },
    {
        id: { q: '🏛️ Siapakah presiden pertama Indonesia?', a: 'Soekarno', choices: ['Soeharto', 'Soekarno', 'Megawati', 'Jokowi'] },
        en: { q: '🏛️ Who was the first president of Indonesia?', a: 'Sukarno', choices: ['Suharto', 'Sukarno', 'Megawati', 'Jokowi'] },
        ar: { q: '🏛️ من هو أول رئيس لإندونيسيا؟', a: 'سوكارنو', choices: ['سوهارتو', 'سوكارنو', 'ميغاواتي', 'جوكوي'] },
        ms: { q: '🏛️ Siapakah presiden pertama Indonesia?', a: 'Soekarno', choices: ['Soeharto', 'Soekarno', 'Megawati', 'Jokowi'] },
        zh: { q: '🏛️ 印度尼西亚的第一任总统是谁？', a: '苏加诺', choices: ['苏哈托', '苏加诺', '梅加瓦蒂', '佐科'] }
    },
    {
        id: { q: '🌱 Tumbuhan yang menghasilkan beras adalah?', a: 'Padi', choices: ['Jagung', 'Gandum', 'Padi', 'Sagu'] },
        en: { q: '🌱 Which plant produces rice?', a: 'Rice plant', choices: ['Corn', 'Wheat', 'Rice plant', 'Sago'] },
        ar: { q: '🌱 النبات الذي ينتج الأرز هو؟', a: 'نبات الأرز', choices: ['ذرة', 'قمح', 'نبات الأرز', 'ساغو'] },
        ms: { q: '🌱 Tumbuhan yang menghasilkan beras ialah?', a: 'Padi', choices: ['Jagung', 'Gandum', 'Padi', 'Sagu'] },
        zh: { q: '🌱 生产大米的植物是？', a: '水稻', choices: ['玉米', '小麦', '水稻', '西米'] }
    },
    {
        id: { q: '🧪 Simbol kimia untuk air adalah?', a: 'H₂O', choices: ['CO₂', 'O₂', 'H₂O', 'NaCl'] },
        en: { q: '🧪 The chemical symbol for water is?', a: 'H₂O', choices: ['CO₂', 'O₂', 'H₂O', 'NaCl'] },
        ar: { q: '🧪 الرمز الكيميائي للماء هو؟', a: 'H₂O', choices: ['CO₂', 'O₂', 'H₂O', 'NaCl'] },
        ms: { q: '🧪 Simbol kimia untuk air ialah?', a: 'H₂O', choices: ['CO₂', 'O₂', 'H₂O', 'NaCl'] },
        zh: { q: '🧪 水的化学符号是？', a: 'H₂O', choices: ['CO₂', 'O₂', 'H₂O', 'NaCl'] }
    },
    {
        id: { q: '🏀 Olahraga yang dimainkan oleh Michael Jordan?', a: 'Basket', choices: ['Sepak Bola', 'Basket', 'Tenis', 'Bulu Tangkis'] },
        en: { q: '🏀 Which sport did Michael Jordan play?', a: 'Basketball', choices: ['Football', 'Basketball', 'Tennis', 'Badminton'] },
        ar: { q: '🏀 ما هي الرياضة التي لعبها مايكل جوردان؟', a: 'كرة السلة', choices: ['كرة القدم', 'كرة السلة', 'تنس', 'ريشة طائرة'] },
        ms: { q: '🏀 Sukan yang dimainkan oleh Michael Jordan?', a: 'Bola Keranjang', choices: ['Bola Sepak', 'Bola Keranjang', 'Tenis', 'Badminton'] },
        zh: { q: '🏀 迈克尔·乔丹从事的运动是？', a: '篮球', choices: ['足球', '篮球', '网球', '羽毛球'] }
    },
    {
        id: { q: '📅 Tahun berapakah Proklamasi Kemerdekaan Indonesia?', a: '1945', choices: ['1945', '1950', '1942', '1965'] },
        en: { q: '📅 In which year was Indonesia’s independence proclaimed?', a: '1945', choices: ['1945', '1950', '1942', '1965'] },
        ar: { q: '📅 في أي عام أُعلن استقلال إندونيسيا؟', a: '1945', choices: ['1945', '1950', '1942', '1965'] },
        ms: { q: '📅 Tahun berapakah Proklamasi Kemerdekaan Indonesia?', a: '1945', choices: ['1945', '1950', '1942', '1965'] },
        zh: { q: '📅 印度尼西亚独立宣言是哪一年？', a: '1945年', choices: ['1945年', '1950年', '1942年', '1965年'] }
    },
    {
        id: { q: '🦷 Berapa jumlah gigi susu pada anak-anak?', a: '20', choices: ['16', '20', '24', '32'] },
        en: { q: '🦷 How many baby teeth do children have?', a: '20', choices: ['16', '20', '24', '32'] },
        ar: { q: '🦷 كم عدد الأسنان اللبنية عند الأطفال؟', a: '20', choices: ['16', '20', '24', '32'] },
        ms: { q: '🦷 Berapakah bilangan gigi susu pada kanak-kanak?', a: '20', choices: ['16', '20', '24', '32'] },
        zh: { q: '🦷 儿童有多少颗乳牙？', a: '20颗', choices: ['16颗', '20颗', '24颗', '32颗'] }
    },
    {
        id: { q: '🎭 Siapakah penulis novel "Laskar Pelangi"?', a: 'Andrea Hirata', choices: ['Andrea Hirata', 'Pramoedya Ananta Toer', 'Tere Liye', 'Dewi Lestari'] },
        en: { q: '🎭 Who wrote the novel "Laskar Pelangi"?', a: 'Andrea Hirata', choices: ['Andrea Hirata', 'Pramoedya Ananta Toer', 'Tere Liye', 'Dewi Lestari'] },
        ar: { q: '🎭 من هو مؤلف رواية "Laskar Pelangi"؟', a: 'أندريا هيراتا', choices: ['أندريا هيراتا', 'برامويديا أنانتا توير', 'تيري ليي', 'ديوي ليستاري'] },
        ms: { q: '🎭 Siapakah penulis novel "Laskar Pelangi"?', a: 'Andrea Hirata', choices: ['Andrea Hirata', 'Pramoedya Ananta Toer', 'Tere Liye', 'Dewi Lestari'] },
        zh: { q: '🎭 小说《天虹战队小学》的作者是谁？', a: '安德烈亚·希拉塔', choices: ['安德烈亚·希拉塔', '普拉姆迪亚·阿南达·杜尔', '特雷·利耶', '德维·莱斯塔里'] }
    },
    {
        id: { q: '🏔️ Gunung tertinggi di dunia adalah?', a: 'Everest', choices: ['K2', 'Everest', 'Kilimanjaro', 'Denali'] },
        en: { q: '🏔️ What is the highest mountain in the world?', a: 'Everest', choices: ['K2', 'Everest', 'Kilimanjaro', 'Denali'] },
        ar: { q: '🏔️ ما هو أعلى جبل في العالم؟', a: 'إفرست', choices: ['كي 2', 'إفرست', 'كليمنجارو', 'دينالي'] },
        ms: { q: '🏔️ Gunung tertinggi di dunia ialah?', a: 'Everest', choices: ['K2', 'Everest', 'Kilimanjaro', 'Denali'] },
        zh: { q: '🏔️ 世界上最高的山峰是？', a: '珠穆朗玛峰', choices: ['K2', '珠穆朗玛峰', '乞力马扎罗山', '德纳里山'] }
    },
    {
        id: { q: '🎬 Film animasi tentang petualangan ikan badut bernama Nemo?', a: 'Finding Nemo', choices: ['Shark Tale', 'Finding Nemo', 'The Little Mermaid', 'Moana'] },
        en: { q: '🎬 Which animated film features a clownfish named Nemo?', a: 'Finding Nemo', choices: ['Shark Tale', 'Finding Nemo', 'The Little Mermaid', 'Moana'] },
        ar: { q: '🎬 فيلم رسوم متحركة عن مغامرات سمكة مهرج تدعى نيمو؟', a: 'البحث عن نيمو', choices: ['القرش حكاية', 'البحث عن نيمو', 'الحورية الصغيرة', 'موانا'] },
        ms: { q: '🎬 Filem animasi tentang pengembaraan ikan badut bernama Nemo?', a: 'Finding Nemo', choices: ['Shark Tale', 'Finding Nemo', 'The Little Mermaid', 'Moana'] },
        zh: { q: '🎬 哪部动画电影讲述了一只名叫尼莫的小丑鱼的冒险？', a: '海底总动员', choices: ['鲨鱼故事', '海底总动员', '小美人鱼', '海洋奇缘'] }
    },
    {
        id: { q: '🍕 Makanan khas Italia berbentuk bulat pipih yang dipanggang disebut?', a: 'Pizza', choices: ['Lasagna', 'Spaghetti', 'Pizza', 'Risotto'] },
        en: { q: '🍕 The Italian flat round baked dish is called?', a: 'Pizza', choices: ['Lasagna', 'Spaghetti', 'Pizza', 'Risotto'] },
        ar: { q: '🍕 الطبق الإيطالي المخبوز المسطح والمستدير يسمى؟', a: 'بيتزا', choices: ['لازانيا', 'سباغيتي', 'بيتزا', 'ريزوتو'] },
        ms: { q: '🍕 Makanan khas Itali berbentuk bulat pipih yang dibakar dipanggil?', a: 'Pizza', choices: ['Lasagna', 'Spaghetti', 'Pizza', 'Risotto'] },
        zh: { q: '🍕 意大利扁圆形烤制食品称为？', a: '披萨', choices: ['千层面', '意大利面', '披萨', '烩饭'] }
    },
    {
        id: { q: '🎸 Alat musik petik berdawai enam yang populer?', a: 'Gitar', choices: ['Biola', 'Gitar', 'Piano', 'Harpa'] },
        en: { q: '🎸 Popular six-stringed plucked musical instrument?', a: 'Guitar', choices: ['Violin', 'Guitar', 'Piano', 'Harp'] },
        ar: { q: '🎸 آلة موسيقية شعبية ذات ستة أوتار تُعزف بالنقر؟', a: 'غيتار', choices: ['كمان', 'غيتار', 'بيانو', 'قيثارة'] },
        ms: { q: '🎸 Alat muzik bertali enam yang dipetik?', a: 'Gitar', choices: ['Biola', 'Gitar', 'Piano', 'Harpa'] },
        zh: { q: '🎸 流行的六弦弹拨乐器是？', a: '吉他', choices: ['小提琴', '吉他', '钢琴', '竖琴'] }
    },
    {
        id: { q: '🦴 Tulang terpanjang pada tubuh manusia adalah?', a: 'Femur', choices: ['Tulang kering', 'Tulang hasta', 'Femur', 'Tulang belakang'] },
        en: { q: '🦴 The longest bone in the human body is?', a: 'Femur', choices: ['Tibia', 'Ulna', 'Femur', 'Spine'] },
        ar: { q: '🦴 أطول عظمة في جسم الإنسان هي؟', a: 'عظم الفخذ', choices: ['الظنبوب', 'الزند', 'عظم الفخذ', 'العمود الفقري'] },
        ms: { q: '🦴 Tulang terpanjang dalam badan manusia ialah?', a: 'Femur', choices: ['Tibia', 'Ulna', 'Femur', 'Tulang belakang'] },
        zh: { q: '🦴 人体最长的骨头是？', a: '股骨', choices: ['胫骨', '尺骨', '股骨', '脊柱'] }
    },
    {
        id: { q: '🥇 Olimpiade modern pertama diadakan di kota?', a: 'Athena', choices: ['Paris', 'Athena', 'London', 'Roma'] },
        en: { q: '🥇 The first modern Olympic Games were held in which city?', a: 'Athens', choices: ['Paris', 'Athens', 'London', 'Rome'] },
        ar: { q: '🥇 أُقيمت أول دورة ألعاب أولمبية حديثة في مدينة؟', a: 'أثينا', choices: ['باريس', 'أثينا', 'لندن', 'روما'] },
        ms: { q: '🥇 Sukan Olimpik moden pertama diadakan di bandar?', a: 'Athens', choices: ['Paris', 'Athens', 'London', 'Rom'] },
        zh: { q: '🥇 第一届现代奥运会在哪个城市举办？', a: '雅典', choices: ['巴黎', '雅典', '伦敦', '罗马'] }
    },
    {
        id: { q: '🌲 Hutan hujan tropis terbesar di dunia terdapat di lembah?', a: 'Amazon', choices: ['Kongo', 'Amazon', 'Kalimantan', 'Papua'] },
        en: { q: '🌲 The largest tropical rainforest in the world is in which basin?', a: 'Amazon', choices: ['Congo', 'Amazon', 'Borneo', 'Papua'] },
        ar: { q: '🌲 أكبر غابة استوائية مطيرة في العالم توجد في حوض؟', a: 'الأمازون', choices: ['الكونغو', 'الأمازون', 'بورنيو', 'بابوا'] },
        ms: { q: '🌲 Hutan hujan tropika terbesar di dunia terdapat di lembangan?', a: 'Amazon', choices: ['Congo', 'Amazon', 'Borneo', 'Papua'] },
        zh: { q: '🌲 世界上最大的热带雨林在哪个盆地？', a: '亚马逊', choices: ['刚果', '亚马逊', '婆罗洲', '巴布亚'] }
    },
    {
        id: { q: '📚 Siapakah pengarang novel klasik "Pride and Prejudice"?', a: 'Jane Austen', choices: ['Jane Austen', 'Charles Dickens', 'Emily Brontë', 'Virginia Woolf'] },
        en: { q: '📚 Who is the author of the classic novel "Pride and Prejudice"?', a: 'Jane Austen', choices: ['Jane Austen', 'Charles Dickens', 'Emily Brontë', 'Virginia Woolf'] },
        ar: { q: '📚 من هي مؤلفة الرواية الكلاسيكية "كبرياء وتحامل"؟', a: 'جاين أوستن', choices: ['جاين أوستن', 'تشارلز ديكنز', 'إميلي برونتي', 'فرجينيا وولف'] },
        ms: { q: '📚 Siapakah pengarang novel klasik "Pride and Prejudice"?', a: 'Jane Austen', choices: ['Jane Austen', 'Charles Dickens', 'Emily Brontë', 'Virginia Woolf'] },
        zh: { q: '📚 经典小说《傲慢与偏见》的作者是谁？', a: '简·奥斯汀', choices: ['简·奥斯汀', '查尔斯·狄更斯', '艾米莉·勃朗特', '弗吉尼亚·伍尔夫'] }
    },
    {
        id: { q: '⌚ Lambang unsur kimia untuk emas adalah?', a: 'Au', choices: ['Ag', 'Au', 'Fe', 'Pb'] },
        en: { q: '⌚ The chemical symbol for gold is?', a: 'Au', choices: ['Ag', 'Au', 'Fe', 'Pb'] },
        ar: { q: '⌚ الرمز الكيميائي للذهب هو؟', a: 'Au', choices: ['Ag', 'Au', 'Fe', 'Pb'] },
        ms: { q: '⌚ Simbol kimia untuk emas ialah?', a: 'Au', choices: ['Ag', 'Au', 'Fe', 'Pb'] },
        zh: { q: '⌚ 金的化学符号是？', a: 'Au', choices: ['Ag', 'Au', 'Fe', 'Pb'] }
    },
    {
        id: { q: '🐼 Hewan endemik dari Tiongkok yang ikonik adalah?', a: 'Panda raksasa', choices: ['Koala', 'Panda raksasa', 'Harimau Siberia', 'Gajah Asia'] },
        en: { q: '🐼 An iconic endemic animal from China is?', a: 'Giant panda', choices: ['Koala', 'Giant panda', 'Siberian tiger', 'Asian elephant'] },
        ar: { q: '🐼 حيوان أيقوني مستوطن في الصين هو؟', a: 'الباندا العملاقة', choices: ['كوالا', 'الباندا العملاقة', 'النمر السيبيري', 'الفيل الآسيوي'] },
        ms: { q: '🐼 Haiwan endemik ikonik dari China ialah?', a: 'Panda gergasi', choices: ['Koala', 'Panda gergasi', 'Harimau Siberia', 'Gajah Asia'] },
        zh: { q: '🐼 中国标志性的特有动物是？', a: '大熊猫', choices: ['考拉', '大熊猫', '西伯利亚虎', '亚洲象'] }
    },
    {
        id: { q: '🌬️ Satuan ukuran suhu yang dipakai di sebagian besar dunia?', a: 'Celsius', choices: ['Fahrenheit', 'Kelvin', 'Celsius', 'Réaumur'] },
        en: { q: '🌬️ The unit of temperature measurement used in most of the world?', a: 'Celsius', choices: ['Fahrenheit', 'Kelvin', 'Celsius', 'Réaumur'] },
        ar: { q: '🌬️ وحدة قياس الحرارة المستخدمة في معظم أنحاء العالم؟', a: 'سيلزيوس', choices: ['فهرنهايت', 'كلفن', 'سيلزيوس', 'ريومور'] },
        ms: { q: '🌬️ Unit sukatan suhu yang digunakan di kebanyakan negara dunia?', a: 'Celsius', choices: ['Fahrenheit', 'Kelvin', 'Celsius', 'Réaumur'] },
        zh: { q: '🌬️ 世界上大部分地区使用的温度计量单位是？', a: '摄氏度', choices: ['华氏度', '开尔文', '摄氏度', '列氏度'] }
    },
    // ... More general knowledge questions
    {
        id: { q: '🎭 Siapa penemu teori relativitas?', a: 'Albert Einstein', choices: ['Isaac Newton', 'Albert Einstein', 'Galileo Galilei', 'Stephen Hawking'] },
        en: { q: '🎭 Who discovered the theory of relativity?', a: 'Albert Einstein', choices: ['Isaac Newton', 'Albert Einstein', 'Galileo Galilei', 'Stephen Hawking'] },
        ar: { q: '🎭 من اكتشف نظرية النسبية؟', a: 'ألبرت أينشتاين', choices: ['إسحاق نيوتن', 'ألبرت أينشتاين', 'غاليليو غاليلي', 'ستيفن هوكينغ'] },
        ms: { q: '🎭 Siapakah yang menemui teori kerelatifan?', a: 'Albert Einstein', choices: ['Isaac Newton', 'Albert Einstein', 'Galileo Galilei', 'Stephen Hawking'] },
        zh: { q: '🎭 发现相对论的人是谁？', a: '阿尔伯特·爱因斯坦', choices: ['艾萨克·牛顿', '阿尔伯特·爱因斯坦', '伽利略·伽利莱', '斯蒂芬·霍金'] }
    },
    {
        id: { q: '🎨 Siapakah pelukis "Mona Lisa"?', a: 'Leonardo da Vinci', choices: ['Michelangelo', 'Leonardo da Vinci', 'Raphael', 'Donatello'] },
        en: { q: '🎨 Who painted the "Mona Lisa"?', a: 'Leonardo da Vinci', choices: ['Michelangelo', 'Leonardo da Vinci', 'Raphael', 'Donatello'] },
        ar: { q: '🎨 من رسم لوحة "الموناليزا"؟', a: 'ليوناردو دافنشي', choices: ['مايكل أنجلو', 'ليوناردو دافنشي', 'رافاييل', 'دوناتيلو'] },
        ms: { q: '🎨 Siapakah pelukis "Mona Lisa"?', a: 'Leonardo da Vinci', choices: ['Michelangelo', 'Leonardo da Vinci', 'Raphael', 'Donatello'] },
        zh: { q: '🎨 画《蒙娜丽莎》的画家是谁？', a: '列奥纳多·达·芬奇', choices: ['米开朗基罗', '列奥纳多·达·芬奇', '拉斐尔', '多纳泰罗'] }
    },
    {
        id: { q: '🌏 Negara dengan jumlah penduduk terbanyak pada 2025?', a: 'India', choices: ['Cina', 'India', 'Amerika Serikat', 'Indonesia'] },
        en: { q: '🌏 Country with the largest population in 2025?', a: 'India', choices: ['China', 'India', 'United States', 'Indonesia'] },
        ar: { q: '🌏 الدولة ذات أكبر عدد سكان في عام 2025؟', a: 'الهند', choices: ['الصين', 'الهند', 'الولايات المتحدة', 'إندونيسيا'] },
        ms: { q: '🌏 Negara dengan jumlah penduduk terbanyak pada 2025?', a: 'India', choices: ['China', 'India', 'Amerika Syarikat', 'Indonesia'] },
        zh: { q: '🌏 2025年人口最多的国家是？', a: '印度', choices: ['中国', '印度', '美国', '印度尼西亚'] }
    },
    {
        id: { q: '🏺 Candi Borobudur merupakan peninggalan agama?', a: 'Buddha', choices: ['Hindu', 'Buddha', 'Islam', 'Kristen'] },
        en: { q: '🏺 Borobudur Temple is a relic of which religion?', a: 'Buddhist', choices: ['Hindu', 'Buddhist', 'Islam', 'Christian'] },
        ar: { q: '🏺 معبد بوروبودور هو من آثار أي ديانة؟', a: 'البوذية', choices: ['الهندوسية', 'البوذية', 'الإسلام', 'المسيحية'] },
        ms: { q: '🏺 Candi Borobudur merupakan peninggalan agama?', a: 'Buddha', choices: ['Hindu', 'Buddha', 'Islam', 'Kristian'] },
        zh: { q: '🏺 婆罗浮屠寺是哪一宗教的遗迹？', a: '佛教', choices: ['印度教', '佛教', '伊斯兰教', '基督教'] }
    },
    {
        id: { q: '🎤 Siapa penyanyi lagu "Shape of You"?', a: 'Ed Sheeran', choices: ['Justin Bieber', 'Ed Sheeran', 'Bruno Mars', 'The Weeknd'] },
        en: { q: '🎤 Who sings the song "Shape of You"?', a: 'Ed Sheeran', choices: ['Justin Bieber', 'Ed Sheeran', 'Bruno Mars', 'The Weeknd'] },
        ar: { q: '🎤 من يغني أغنية "Shape of You"؟', a: 'إد شيران', choices: ['جاستن بيبر', 'إد شيران', 'برونو مارس', 'ذا ويكند'] },
        ms: { q: '🎤 Siapakah penyanyi lagu "Shape of You"?', a: 'Ed Sheeran', choices: ['Justin Bieber', 'Ed Sheeran', 'Bruno Mars', 'The Weeknd'] },
        zh: { q: '🎤 谁演唱了歌曲《Shape of You》？', a: '艾德·希兰', choices: ['贾斯汀·比伯', '艾德·希兰', '布鲁诺·马尔斯', '威肯'] }
    },
    {
        id: { q: '🌪️ Bencana alam berupa pusaran angin kencang disebut?', a: 'Tornado', choices: ['Tsunami', 'Gempa bumi', 'Tornado', 'Banjir'] },
        en: { q: '🌪️ A natural disaster of a violently rotating column of air is called?', a: 'Tornado', choices: ['Tsunami', 'Earthquake', 'Tornado', 'Flood'] },
        ar: { q: '🌪️ كارثة طبيعية عبارة عن عمود هوائي دوار عنيف تسمى؟', a: 'إعصار قمعي', choices: ['تسونامي', 'زلزال', 'إعصار قمعي', 'فيضان'] },
        ms: { q: '🌪️ Bencana alam berupa pusaran angin yang kuat dipanggil?', a: 'Tornado', choices: ['Tsunami', 'Gempa bumi', 'Tornado', 'Banjir'] },
        zh: { q: '🌪️ 一种由猛烈旋转的空气柱形成的自然灾害叫做？', a: '龙卷风', choices: ['海啸', '地震', '龙卷风', '洪水'] }
    },
    {
        id: { q: '📆 Bulan apa yang memiliki 28 atau 29 hari?', a: 'Februari', choices: ['Januari', 'Februari', 'Maret', 'April'] },
        en: { q: '📆 Which month has 28 or 29 days?', a: 'February', choices: ['January', 'February', 'March', 'April'] },
        ar: { q: '📆 ما هو الشهر الذي يحتوي على 28 أو 29 يومًا؟', a: 'فبراير', choices: ['يناير', 'فبراير', 'مارس', 'أبريل'] },
        ms: { q: '📆 Bulan apakah yang mempunyai 28 atau 29 hari?', a: 'Februari', choices: ['Januari', 'Februari', 'Mac', 'April'] },
        zh: { q: '📆 哪个月份有28天或29天？', a: '二月', choices: ['一月', '二月', '三月', '四月'] }
    },
    {
        id: { q: '🚩 Warna bendera Palestina?', a: 'Hitam, putih, hijau, merah', choices: ['Merah, putih', 'Hitam, putih, hijau, merah', 'Biru, putih, merah', 'Hijau, kuning'] },
        en: { q: '🚩 Colors of the Palestinian flag?', a: 'Black, white, green, red', choices: ['Red, white', 'Black, white, green, red', 'Blue, white, red', 'Green, yellow'] },
        ar: { q: '🚩 ألوان العلم الفلسطيني؟', a: 'أسود، أبيض، أخضر، أحمر', choices: ['أحمر، أبيض', 'أسود، أبيض، أخضر، أحمر', 'أزرق، أبيض، أحمر', 'أخضر، أصفر'] },
        ms: { q: '🚩 Warna bendera Palestin?', a: 'Hitam, putih, hijau, merah', choices: ['Merah, putih', 'Hitam, putih, hijau, merah', 'Biru, putih, merah', 'Hijau, kuning'] },
        zh: { q: '🚩 巴勒斯坦国旗的颜色是什么？', a: '黑、白、绿、红', choices: ['红、白', '黑、白、绿、红', '蓝、白、红', '绿、黄'] }
    },
    {
        id: { q: '🧪 Gas apa yang paling melimpah di atmosfer Bumi?', a: 'Nitrogen', choices: ['Oksigen', 'Nitrogen', 'Karbon dioksida', 'Argon'] },
        en: { q: '🧪 Which gas is most abundant in Earth\'s atmosphere?', a: 'Nitrogen', choices: ['Oxygen', 'Nitrogen', 'Carbon dioxide', 'Argon'] },
        ar: { q: '🧪 ما هو الغاز الأكثر وفرة في الغلاف الجوي للأرض؟', a: 'النيتروجين', choices: ['أكسجين', 'نيتروجين', 'ثاني أكسيد الكربون', 'أرجون'] },
        ms: { q: '🧪 Gas apakah yang paling banyak dalam atmosfera Bumi?', a: 'Nitrogen', choices: ['Oksigen', 'Nitrogen', 'Karbon dioksida', 'Argon'] },
        zh: { q: '🧪 地球大气中含量最丰富的气体是什么？', a: '氮气', choices: ['氧气', '氮气', '二氧化碳', '氩气'] }
    },
    {
        id: { q: '🧮 1 kilometer sama dengan berapa meter?', a: '1000', choices: ['10', '100', '1000', '10000'] },
        en: { q: '🧮 1 kilometer equals how many meters?', a: '1000', choices: ['10', '100', '1000', '10000'] },
        ar: { q: '🧮 كم مترًا يساوي الكيلومتر الواحد؟', a: '1000', choices: ['10', '100', '1000', '10000'] },
        ms: { q: '🧮 1 kilometer bersamaan berapa meter?', a: '1000', choices: ['10', '100', '1000', '10000'] },
        zh: { q: '🧮 1公里等于多少米？', a: '1000', choices: ['10', '100', '1000', '10000'] }
    },

    // ==========================================
    // 💻 TAMBAHAN SOAL TEKNOLOGI TERBARU
    // ==========================================
    {
        id: { q: '🔮 Teknologi yang memungkinkan mesin belajar dari data tanpa diprogram eksplisit disebut?', a: 'Machine Learning', choices: ['Machine Learning', 'Virtual Reality', 'Blockchain', 'Cloud Computing'] },
        en: { q: '🔮 Technology that enables machines to learn from data without explicit programming is called?', a: 'Machine Learning', choices: ['Machine Learning', 'Virtual Reality', 'Blockchain', 'Cloud Computing'] },
        ar: { q: '🔮 التقنية التي تمكّن الآلات من التعلم من البيانات بدون برمجة صريحة تسمى؟', a: 'تعلم الآلة', choices: ['تعلم الآلة', 'الواقع الافتراضي', 'بلوكتشين', 'الحوسبة السحابية'] },
        ms: { q: '🔮 Teknologi yang membolehkan mesin belajar daripada data tanpa diprogram secara eksplisit dipanggil?', a: 'Pembelajaran Mesin', choices: ['Pembelajaran Mesin', 'Realiti Maya', 'Blockchain', 'Pengkomputeran Awan'] },
        zh: { q: '🔮 使机器能够无需明确编程即可从数据中学习的技术称为？', a: '机器学习', choices: ['机器学习', '虚拟现实', '区块链', '云计算'] }
    },
    {
        id: { q: '👓 Perangkat realitas virtual besutan Meta yang populer adalah?', a: 'Oculus Quest', choices: ['HTC Vive', 'PlayStation VR', 'Oculus Quest', 'Valve Index'] },
        en: { q: '👓 Which popular virtual reality device is made by Meta?', a: 'Oculus Quest', choices: ['HTC Vive', 'PlayStation VR', 'Oculus Quest', 'Valve Index'] },
        ar: { q: '👓 جهاز الواقع الافتراضي الشهير من ميتا هو؟', a: 'Oculus Quest', choices: ['HTC Vive', 'PlayStation VR', 'Oculus Quest', 'Valve Index'] },
        ms: { q: '👓 Peranti realiti maya popular buatan Meta ialah?', a: 'Oculus Quest', choices: ['HTC Vive', 'PlayStation VR', 'Oculus Quest', 'Valve Index'] },
        zh: { q: '👓 Meta 公司生产的流行虚拟现实设备是？', a: 'Oculus Quest', choices: ['HTC Vive', 'PlayStation VR', 'Oculus Quest', 'Valve Index'] }
    },
    {
        id: { q: '🖥️ Bahasa pemrograman yang biasa digunakan untuk analisis data dan AI?', a: 'Python', choices: ['PHP', 'Java', 'Python', 'C++'] },
        en: { q: '🖥️ Programming language commonly used for data analysis and AI?', a: 'Python', choices: ['PHP', 'Java', 'Python', 'C++'] },
        ar: { q: '🖥️ لغة البرمجة الشائعة الاستخدام لتحليل البيانات والذكاء الاصطناعي؟', a: 'بايثون', choices: ['PHP', 'Java', 'بايثون', 'C++'] },
        ms: { q: '🖥️ Bahasa pengaturcaraan yang biasa digunakan untuk analisis data dan AI?', a: 'Python', choices: ['PHP', 'Java', 'Python', 'C++'] },
        zh: { q: '🖥️ 常用于数据分析和人工智能的编程语言是？', a: 'Python', choices: ['PHP', 'Java', 'Python', 'C++'] }
    },
    {
        id: { q: '🛡️ Jenis serangan siber yang meminta tebusan untuk membuka kunci data korban?', a: 'Ransomware', choices: ['Spyware', 'Ransomware', 'Adware', 'Trojan'] },
        en: { q: '🛡️ Type of cyber attack demanding ransom to unlock victim data?', a: 'Ransomware', choices: ['Spyware', 'Ransomware', 'Adware', 'Trojan'] },
        ar: { q: '🛡️ نوع من الهجمات الإلكترونية يطلب فدية لفك تشفير بيانات الضحية؟', a: 'برامج الفدية', choices: ['برامج التجسس', 'برامج الفدية', 'برامج الإعلانات', 'حصان طروادة'] },
        ms: { q: '🛡️ Jenis serangan siber yang meminta wang tebusan untuk membuka kunci data mangsa?', a: 'Ransomware', choices: ['Spyware', 'Ransomware', 'Adware', 'Trojan'] },
        zh: { q: '🛡️ 要求赎金以解锁受害者数据的网络攻击类型是？', a: '勒索软件', choices: ['间谍软件', '勒索软件', '广告软件', '木马'] }
    },
    {
        id: { q: '📲 Teknologi jaringan seluler generasi kelima yang mulai marak disebut?', a: '5G', choices: ['4G', '5G', '6G', 'LTE'] },
        en: { q: '📲 The fifth-generation mobile network technology is called?', a: '5G', choices: ['4G', '5G', '6G', 'LTE'] },
        ar: { q: '📲 تقنية شبكات الهاتف المحمول من الجيل الخامس تسمى؟', a: '5G', choices: ['4G', '5G', '6G', 'LTE'] },
        ms: { q: '📲 Teknologi rangkaian mudah alih generasi kelima dipanggil?', a: '5G', choices: ['4G', '5G', '6G', 'LTE'] },
        zh: { q: '📲 第五代移动网络技术称为？', a: '5G', choices: ['4G', '5G', '6G', 'LTE'] }
    },
    {
        id: { q: '🤖 Asisten virtual bawaan dari Amazon?', a: 'Alexa', choices: ['Siri', 'Alexa', 'Google Assistant', 'Cortana'] },
        en: { q: '🤖 Amazon\'s built-in virtual assistant is?', a: 'Alexa', choices: ['Siri', 'Alexa', 'Google Assistant', 'Cortana'] },
        ar: { q: '🤖 المساعد الافتراضي المدمج من أمازون هو؟', a: 'أليكسا', choices: ['سيري', 'أليكسا', 'مساعد جوجل', 'كورتانا'] },
        ms: { q: '🤖 Pembantu maya terbina dalam dari Amazon?', a: 'Alexa', choices: ['Siri', 'Alexa', 'Google Assistant', 'Cortana'] },
        zh: { q: '🤖 亚马逊内置的虚拟助手是？', a: 'Alexa', choices: ['Siri', 'Alexa', 'Google Assistant', 'Cortana'] }
    },
    {
        id: { q: '💻 Siapa penemu World Wide Web?', a: 'Tim Berners-Lee', choices: ['Vint Cerf', 'Tim Berners-Lee', 'Bill Gates', 'Steve Jobs'] },
        en: { q: '💻 Who invented the World Wide Web?', a: 'Tim Berners-Lee', choices: ['Vint Cerf', 'Tim Berners-Lee', 'Bill Gates', 'Steve Jobs'] },
        ar: { q: '💻 من اخترع الشبكة العنكبوتية العالمية؟', a: 'تيم بيرنرز لي', choices: ['فينت سيرف', 'تيم بيرنرز لي', 'بيل غيتس', 'ستيف جوبز'] },
        ms: { q: '💻 Siapakah pencipta World Wide Web?', a: 'Tim Berners-Lee', choices: ['Vint Cerf', 'Tim Berners-Lee', 'Bill Gates', 'Steve Jobs'] },
        zh: { q: '💻 万维网的发明者是谁？', a: '蒂姆·伯纳斯-李', choices: ['文特·瑟夫', '蒂姆·伯纳斯-李', '比尔·盖茨', '史蒂夫·乔布斯'] }
    },
    {
        id: { q: '📷 Format gambar yang mendukung latar belakang transparan?', a: 'PNG', choices: ['JPEG', 'PNG', 'GIF', 'BMP'] },
        en: { q: '📷 Which image format supports transparent backgrounds?', a: 'PNG', choices: ['JPEG', 'PNG', 'GIF', 'BMP'] },
        ar: { q: '📷 أي تنسيق للصور يدعم الخلفيات الشفافة؟', a: 'PNG', choices: ['JPEG', 'PNG', 'GIF', 'BMP'] },
        ms: { q: '📷 Format imej yang menyokong latar belakang telus?', a: 'PNG', choices: ['JPEG', 'PNG', 'GIF', 'BMP'] },
        zh: { q: '📷 支持透明背景的图片格式是？', a: 'PNG', choices: ['JPEG', 'PNG', 'GIF', 'BMP'] }
    },
    {
        id: { q: '🔋 Merek mobil listrik terlaris di dunia saat ini?', a: 'Tesla', choices: ['Toyota', 'Tesla', 'BMW', 'Hyundai'] },
        en: { q: '🔋 The world\'s best-selling electric car brand currently?', a: 'Tesla', choices: ['Toyota', 'Tesla', 'BMW', 'Hyundai'] },
        ar: { q: '🔋 ماركة السيارات الكهربائية الأكثر مبيعًا في العالم حاليًا؟', a: 'تسلا', choices: ['تويوتا', 'تسلا', 'بي إم دبليو', 'هيونداي'] },
        ms: { q: '🔋 Jenama kereta elektrik paling laris di dunia ketika ini?', a: 'Tesla', choices: ['Toyota', 'Tesla', 'BMW', 'Hyundai'] },
        zh: { q: '🔋 目前世界上最畅销的电动汽车品牌是？', a: '特斯拉', choices: ['丰田', '特斯拉', '宝马', '现代'] }
    },
    {
        id: { q: '🧬 Teknologi pengeditan gen yang kontroversial bernama?', a: 'CRISPR', choices: ['CRISPR', 'PCR', 'DNA', 'GMO'] },
        en: { q: '🧬 Controversial gene-editing technology is called?', a: 'CRISPR', choices: ['CRISPR', 'PCR', 'DNA', 'GMO'] },
        ar: { q: '🧬 تقنية تحرير الجينات المثيرة للجدل تسمى؟', a: 'كريسبر', choices: ['كريسبر', 'PCR', 'DNA', 'كائنات معدلة وراثيًا'] },
        ms: { q: '🧬 Teknologi penyuntingan gen yang kontroversi dipanggil?', a: 'CRISPR', choices: ['CRISPR', 'PCR', 'DNA', 'GMO'] },
        zh: { q: '🧬 有争议的基因编辑技术称为？', a: 'CRISPR', choices: ['CRISPR', 'PCR', 'DNA', '转基因'] }
    },
    {
        id: { q: '📡 Kepanjangan dari IoT adalah?', a: 'Internet of Things', choices: ['Internet of Tools', 'Internet of Things', 'Integration of Tech', 'Intranet of Things'] },
        en: { q: '📡 IoT stands for?', a: 'Internet of Things', choices: ['Internet of Tools', 'Internet of Things', 'Integration of Tech', 'Intranet of Things'] },
        ar: { q: '📡 IoT هو اختصار لـ؟', a: 'إنترنت الأشياء', choices: ['إنترنت الأدوات', 'إنترنت الأشياء', 'دمج التقنية', 'إنترانت الأشياء'] },
        ms: { q: '📡 IoT adalah singkatan dari?', a: 'Internet of Things', choices: ['Internet of Tools', 'Internet of Things', 'Integration of Tech', 'Intranet of Things'] },
        zh: { q: '📡 IoT 是什么的缩写？', a: '物联网', choices: ['工具互联网', '物联网', '技术集成', '内联网事物'] }
    },
    {
        id: { q: '🕶️ Perusahaan di balik headset realitas campuran HoloLens?', a: 'Microsoft', choices: ['Apple', 'Google', 'Microsoft', 'Meta'] },
        en: { q: '🕶️ Company behind the HoloLens mixed reality headset?', a: 'Microsoft', choices: ['Apple', 'Google', 'Microsoft', 'Meta'] },
        ar: { q: '🕶️ الشركة التي تقف وراء سماعة الواقع المختلط HoloLens؟', a: 'مايكروسوفت', choices: ['أبل', 'جوجل', 'مايكروسوفت', 'ميتا'] },
        ms: { q: '🕶️ Syarikat di sebalik headset realiti campuran HoloLens?', a: 'Microsoft', choices: ['Apple', 'Google', 'Microsoft', 'Meta'] },
        zh: { q: '🕶️ HoloLens 混合现实头显背后的公司是？', a: '微软', choices: ['苹果', '谷歌', '微软', 'Meta'] }
    },
    {
        id: { q: '🎮 Konsol game terbaru dari Sony pada generasi kesembilan?', a: 'PlayStation 5', choices: ['PlayStation 4', 'PlayStation 5', 'Xbox Series X', 'Nintendo Switch'] },
        en: { q: '🎮 Sony\'s latest ninth-generation game console?', a: 'PlayStation 5', choices: ['PlayStation 4', 'PlayStation 5', 'Xbox Series X', 'Nintendo Switch'] },
        ar: { q: '🎮 أحدث جهاز ألعاب من سوني من الجيل التاسع؟', a: 'بلاي ستيشن 5', choices: ['بلاي ستيشن 4', 'بلاي ستيشن 5', 'إكس بوكس سيريس إكس', 'نينتندو سويتش'] },
        ms: { q: '🎮 Konsol permainan terbaharu Sony generasi kesembilan?', a: 'PlayStation 5', choices: ['PlayStation 4', 'PlayStation 5', 'Xbox Series X', 'Nintendo Switch'] },
        zh: { q: '🎮 索尼最新的第九代游戏机是？', a: 'PlayStation 5', choices: ['PlayStation 4', 'PlayStation 5', 'Xbox Series X', '任天堂 Switch'] }
    },
    {
        id: { q: '🔑 Standar keamanan nirkabel terbaru yang menggantikan WPA2?', a: 'WPA3', choices: ['WEP', 'WPA', 'WPA2', 'WPA3'] },
        en: { q: '🔑 The latest wireless security standard replacing WPA2?', a: 'WPA3', choices: ['WEP', 'WPA', 'WPA2', 'WPA3'] },
        ar: { q: '🔑 أحدث معيار أمان لاسلكي يحل محل WPA2؟', a: 'WPA3', choices: ['WEP', 'WPA', 'WPA2', 'WPA3'] },
        ms: { q: '🔑 Piawaian keselamatan tanpa wayar terkini yang menggantikan WPA2?', a: 'WPA3', choices: ['WEP', 'WPA', 'WPA2', 'WPA3'] },
        zh: { q: '🔑 取代 WPA2 的最新无线安全标准是？', a: 'WPA3', choices: ['WEP', 'WPA', 'WPA2', 'WPA3'] }
    },
    {
        id: { q: '🖨️ Teknologi pencetakan 3D benda padat dari model digital disebut?', a: 'Additive Manufacturing', choices: ['Subtractive Manufacturing', 'Additive Manufacturing', 'CNC Machining', 'Injection Molding'] },
        en: { q: '🖨️ The technology of printing solid objects from a digital model is called?', a: 'Additive Manufacturing', choices: ['Subtractive Manufacturing', 'Additive Manufacturing', 'CNC Machining', 'Injection Molding'] },
        ar: { q: '🖨️ تقنية طباعة الأشياء الصلبة من نموذج رقمي تسمى؟', a: 'التصنيع بالإضافة', choices: ['التصنيع بالطرح', 'التصنيع بالإضافة', 'التشغيل باستخدام CNC', 'القولبة بالحقن'] },
        ms: { q: '🖨️ Teknologi pencetakan objek pepejal dari model digital dipanggil?', a: 'Pembuatan Aditif', choices: ['Pembuatan Subtractive', 'Pembuatan Aditif', 'Pemesinan CNC', 'Pengacuan Suntikan'] },
        zh: { q: '🖨️ 从数字模型打印固体物体的技术称为？', a: '增材制造', choices: ['减材制造', '增材制造', 'CNC加工', '注塑成型'] }
    },
    {
        id: { q: '⌚ Sistem operasi smartwatch buatan Apple?', a: 'watchOS', choices: ['watchOS', 'Wear OS', 'Tizen', 'Fitbit OS'] },
        en: { q: '⌚ The operating system for Apple smartwatches?', a: 'watchOS', choices: ['watchOS', 'Wear OS', 'Tizen', 'Fitbit OS'] },
        ar: { q: '⌚ نظام تشغيل الساعات الذكية من آبل؟', a: 'watchOS', choices: ['watchOS', 'Wear OS', 'Tizen', 'Fitbit OS'] },
        ms: { q: '⌚ Sistem operasi jam tangan pintar buatan Apple?', a: 'watchOS', choices: ['watchOS', 'Wear OS', 'Tizen', 'Fitbit OS'] },
        zh: { q: '⌚ 苹果智能手表的操作系统是？', a: 'watchOS', choices: ['watchOS', 'Wear OS', 'Tizen', 'Fitbit OS'] }
    },
    {
        id: { q: '🗄️ Layanan penyimpanan cloud dari Google?', a: 'Google Drive', choices: ['Dropbox', 'OneDrive', 'Google Drive', 'iCloud'] },
        en: { q: '🗄️ Google\'s cloud storage service?', a: 'Google Drive', choices: ['Dropbox', 'OneDrive', 'Google Drive', 'iCloud'] },
        ar: { q: '🗄️ خدمة التخزين السحابي من جوجل؟', a: 'جوجل درايف', choices: ['دروب بوكس', 'ون درايف', 'جوجل درايف', 'آي كلاود'] },
        ms: { q: '🗄️ Perkhidmatan storan awan dari Google?', a: 'Google Drive', choices: ['Dropbox', 'OneDrive', 'Google Drive', 'iCloud'] },
        zh: { q: '🗄️ 谷歌的云存储服务是？', a: 'Google Drive', choices: ['Dropbox', 'OneDrive', 'Google Drive', 'iCloud'] }
    },
    {
        id: { q: '🧠 Model AI terbaru dari OpenAI yang bisa memproses teks dan gambar?', a: 'GPT-4o', choices: ['GPT-3', 'GPT-4', 'GPT-4o', 'DALL-E 3'] },
        en: { q: '🧠 OpenAI\'s latest AI model that can process text and images?', a: 'GPT-4o', choices: ['GPT-3', 'GPT-4', 'GPT-4o', 'DALL-E 3'] },
        ar: { q: '🧠 أحدث نموذج ذكاء اصطناعي من OpenAI يمكنه معالجة النصوص والصور؟', a: 'GPT-4o', choices: ['GPT-3', 'GPT-4', 'GPT-4o', 'دال-إي 3'] },
        ms: { q: '🧠 Model AI terbaharu dari OpenAI yang boleh memproses teks dan imej?', a: 'GPT-4o', choices: ['GPT-3', 'GPT-4', 'GPT-4o', 'DALL-E 3'] },
        zh: { q: '🧠 OpenAI 最新的可处理文本和图像的人工智能模型是？', a: 'GPT-4o', choices: ['GPT-3', 'GPT-4', 'GPT-4o', 'DALL-E 3'] }
    },
    {
        id: { q: '📡 Chip prosesor buatan Apple untuk Mac terbaru disebut?', a: 'M series (M1, M2, M3, M4)', choices: ['Intel Core', 'AMD Ryzen', 'M series (M1, M2, M3, M4)', 'Snapdragon'] },
        en: { q: '📡 Apple\'s latest Mac processor chip series is called?', a: 'M series (M1, M2, M3, M4)', choices: ['Intel Core', 'AMD Ryzen', 'M series (M1, M2, M3, M4)', 'Snapdragon'] },
        ar: { q: '📡 سلسلة شرائح المعالج الجديدة من آبل لأجهزة ماك تسمى؟', a: 'سلسلة M (M1, M2, M3, M4)', choices: ['إنتل كور', 'AMD Ryzen', 'سلسلة M (M1, M2, M3, M4)', 'سنابدراجون'] },
        ms: { q: '📡 Cip pemproses siri terbaharu Apple untuk Mac dipanggil?', a: 'Siri M (M1, M2, M3, M4)', choices: ['Intel Core', 'AMD Ryzen', 'Siri M (M1, M2, M3, M4)', 'Snapdragon'] },
        zh: { q: '📡 苹果最新 Mac 处理器芯片系列叫做？', a: 'M系列 (M1, M2, M3, M4)', choices: ['Intel Core', 'AMD Ryzen', 'M系列 (M1, M2, M3, M4)', '骁龙'] }
    },
    {
        id: { q: '🔗 Teknologi buku besar terdistribusi yang mendasari cryptocurrency?', a: 'Blockchain', choices: ['Cloud', 'Blockchain', 'Quantum Computing', 'Edge Computing'] },
        en: { q: '🔗 The distributed ledger technology underlying cryptocurrencies?', a: 'Blockchain', choices: ['Cloud', 'Blockchain', 'Quantum Computing', 'Edge Computing'] },
        ar: { q: '🔗 تقنية السجل الموزع التي تقوم عليها العملات المشفرة؟', a: 'بلوكتشين', choices: ['سحابة', 'بلوكتشين', 'الحوسبة الكمومية', 'حوسبة الحافة'] },
        ms: { q: '🔗 Teknologi lejar teragih yang mendasari mata wang kripto?', a: 'Blockchain', choices: ['Awan', 'Blockchain', 'Pengkomputeran Kuantum', 'Pengkomputeran Tepi'] },
        zh: { q: '🔗 加密货币底层的分布式账本技术是？', a: '区块链', choices: ['云', '区块链', '量子计算', '边缘计算'] }
    },
    {
        id: { q: '🎧 Merek earphone nirkabel populer dari Samsung?', a: 'Galaxy Buds', choices: ['AirPods', 'Galaxy Buds', 'Pixel Buds', 'FreeBuds'] },
        en: { q: '🎧 Popular wireless earbud brand from Samsung?', a: 'Galaxy Buds', choices: ['AirPods', 'Galaxy Buds', 'Pixel Buds', 'FreeBuds'] },
        ar: { q: '🎧 علامة تجارية مشهورة لسماعات الأذن اللاسلكية من سامسونج؟', a: 'Galaxy Buds', choices: ['AirPods', 'Galaxy Buds', 'Pixel Buds', 'FreeBuds'] },
        ms: { q: '🎧 Jenama fon telinga tanpa wayar popular dari Samsung?', a: 'Galaxy Buds', choices: ['AirPods', 'Galaxy Buds', 'Pixel Buds', 'FreeBuds'] },
        zh: { q: '🎧 三星推出的流行无线耳机品牌是？', a: 'Galaxy Buds', choices: ['AirPods', 'Galaxy Buds', 'Pixel Buds', 'FreeBuds'] }
    },
    {
        id: { q: '🖥️ Bahasa utama untuk pengembangan aplikasi Android secara native?', a: 'Kotlin', choices: ['Swift', 'Kotlin', 'C#', 'Dart'] },
        en: { q: '🖥️ Primary language for native Android app development?', a: 'Kotlin', choices: ['Swift', 'Kotlin', 'C#', 'Dart'] },
        ar: { q: '🖥️ اللغة الأساسية لتطوير تطبيقات أندرويد الأصلية؟', a: 'كوتلن', choices: ['سويفت', 'كوتلن', 'سي شارب', 'دارت'] },
        ms: { q: '🖥️ Bahasa utama untuk pembangunan aplikasi Android secara natif?', a: 'Kotlin', choices: ['Swift', 'Kotlin', 'C#', 'Dart'] },
        zh: { q: '🖥️ 原生 Android 应用开发的主要语言是？', a: 'Kotlin', choices: ['Swift', 'Kotlin', 'C#', 'Dart'] }
    },
    {
        id: { q: '📡 Teknologi satelit internet dari SpaceX yang memberikan akses global?', a: 'Starlink', choices: ['Starlink', 'Project Kuiper', 'OneWeb', 'Iridium'] },
        en: { q: '📡 SpaceX\'s satellite internet technology providing global access?', a: 'Starlink', choices: ['Starlink', 'Project Kuiper', 'OneWeb', 'Iridium'] },
        ar: { q: '📡 تقنية الإنترنت عبر الأقمار الصناعية من سبيس إكس التي تتيح الوصول العالمي؟', a: 'ستارلينك', choices: ['ستارلينك', 'مشروع كايبر', 'ون ويب', 'إيريديوم'] },
        ms: { q: '📡 Teknologi internet satelit dari SpaceX yang menyediakan capaian global?', a: 'Starlink', choices: ['Starlink', 'Project Kuiper', 'OneWeb', 'Iridium'] },
        zh: { q: '📡 SpaceX 提供全球接入的卫星互联网技术是？', a: '星链', choices: ['星链', '柯伊伯项目', '一网', '铱星'] }
    },
    {
        id: { q: '🎨 Aplikasi edit foto profesional dari Adobe?', a: 'Photoshop', choices: ['Lightroom', 'Photoshop', 'GIMP', 'Canva'] },
        en: { q: '🎨 Professional photo editing application from Adobe?', a: 'Photoshop', choices: ['Lightroom', 'Photoshop', 'GIMP', 'Canva'] },
        ar: { q: '🎨 تطبيق تحرير الصور الاحترافي من أدوبي؟', a: 'فوتوشوب', choices: ['لايت روم', 'فوتوشوب', 'جيمب', 'كانفا'] },
        ms: { q: '🎨 Aplikasi penyuntingan foto profesional dari Adobe?', a: 'Photoshop', choices: ['Lightroom', 'Photoshop', 'GIMP', 'Canva'] },
        zh: { q: '🎨 Adobe 的专业照片编辑应用程序是？', a: 'Photoshop', choices: ['Lightroom', 'Photoshop', 'GIMP', 'Canva'] }
    },
    {
        id: { q: '🤖 Perusahaan di balik platform ChatGPT dan DALL-E?', a: 'OpenAI', choices: ['OpenAI', 'DeepMind', 'Microsoft', 'Anthropic'] },
        en: { q: '🤖 The company behind ChatGPT and DALL-E platforms?', a: 'OpenAI', choices: ['OpenAI', 'DeepMind', 'Microsoft', 'Anthropic'] },
        ar: { q: '🤖 الشركة التي تقف وراء منصتي ChatGPT و DALL-E؟', a: 'OpenAI', choices: ['OpenAI', 'DeepMind', 'مايكروسوفت', 'أنثروبيك'] },
        ms: { q: '🤖 Syarikat di sebalik platform ChatGPT dan DALL-E?', a: 'OpenAI', choices: ['OpenAI', 'DeepMind', 'Microsoft', 'Anthropic'] },
        zh: { q: '🤖 ChatGPT 和 DALL-E 平台背后的公司是？', a: 'OpenAI', choices: ['OpenAI', 'DeepMind', '微软', 'Anthropic'] }
    },
    {
        id: { q: '🌙 Planet terdekat dengan Matahari?', a: 'Merkurius', choices: ['Venus', 'Merkurius', 'Mars', 'Bumi'] },
        en: { q: '🌙 Closest planet to the Sun?', a: 'Mercury', choices: ['Venus', 'Mercury', 'Mars', 'Earth'] },
        ar: { q: '🌙 أقرب كوكب إلى الشمس؟', a: 'عطارد', choices: ['الزهرة', 'عطارد', 'المريخ', 'الأرض'] },
        ms: { q: '🌙 Planet terdekat dengan Matahari?', a: 'Utarid', choices: ['Zuhrah', 'Utarid', 'Marikh', 'Bumi'] },
        zh: { q: '🌙 离太阳最近的行星是？', a: '水星', choices: ['金星', '水星', '火星', '地球'] }
    }
        ];

module.exports = QUIZ_LIST;
