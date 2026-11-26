// 送達知識卡：每張卡的內容都先在 Taiwan.md 找到，再回官方或機構的原始資料逐句核對。
// 核對不了的說法（例如中正紀念堂「89 階」、大稻埕首批茶葉的斤數、101「2004–2010 世界最高」）一律不放。
// 大安森林公園卡的數字全部來自公園處頁面，Taiwan.md 那篇是延伸閱讀。
// 卡片文字改寫自 Taiwan.md（CC BY-SA 4.0），本檔內容同樣以 CC BY-SA 4.0 釋出。
// 2026-11-26 核對。

const TWMD = (path) => `https://taiwan.md/${path}/`;

export const KNOWLEDGE_CARDS = {
  "landmark:taipei101": {
    title: "台北 101",
    body: "地上 101 層、地下 5 層，高 508 公尺。辦公大樓 2004 年 12 月 31 日正式營運。它也取得 LEED 綠建築白金級認證，是世界最高的綠建築。",
    sources: [
      { label: "Taiwan.md〈台北 101〉", url: TWMD("geography/台北101") },
      { label: "台北 101 永續報告書（2015）", url: "https://ws.taipei-101.com.tw/upload/charity/20251201/9099776c8af846b7a389c5ca7feba94a/9099776c8af846b7a389c5ca7feba94a.pdf" }
    ]
  },
  "landmark:memorial": {
    title: "中正紀念堂",
    body: "建築師楊卓成設計，1980 年落成，園區約 25 公頃。2007 年「臺灣民主紀念園區」被指定為國定古蹟，2008 年再登錄為文化景觀，有雙重文化資產身分。",
    sources: [
      { label: "Taiwan.md〈中正紀念堂〉", url: TWMD("history/中正紀念堂") },
      { label: "國立中正紀念堂：園區介紹", url: "https://www.cksmh.gov.tw/cp.aspx?n=5882" }
    ]
  },
  "landmark:daanPark": {
    title: "大安森林公園",
    body: "1994 年開闢，面積約 26 公頃，公園處稱它是台北的「都市之肺」，能淨化空氣、降低噪音、調節氣溫。園內有 0.7 公頃的自然水池，中央的音樂台可容納 900 多位觀眾。",
    sources: [
      { label: "延伸閱讀：Taiwan.md〈台灣公園與日常休閒〉", url: TWMD("lifestyle/台灣公園與日常休閒") },
      { label: "臺北市公園處：大安森林公園", url: "https://parks.gov.taipei/parks/m2/pkl_parks_m2C.php?sid=154" }
    ]
  },
  "district:萬華": {
    title: "艋舺：獨木舟聚集的地方",
    body: "「艋舺」是凱達格蘭語「獨木舟」（Mankah）的音譯。平埔族人划著獨木舟載番薯到河岸跟漢人交易，這裡就被叫成艋舺。1920 年日本政府改名「萬華」。清代有「一府二鹿三艋舺」的說法。",
    sources: [
      { label: "Taiwan.md〈艋舺〉", url: TWMD("geography/艋舺") },
      { label: "臺北市萬華區公所：歷史沿革", url: "https://whdo.gov.taipei/cp.aspx?n=CAA666D84C56861F" }
    ]
  },
  "district:北投": {
    title: "北投公共浴場",
    body: "1913 年落成，是當時東亞最大的溫泉公共浴場，戰後一度荒廢。1994 年北投國小師生做鄉土教學時重新發現它，在地人一起推動保存，1998 年改成北投溫泉博物館，是台灣第一座由社區居民搶救下來的博物館。",
    sources: [
      { label: "Taiwan.md〈北投溫泉街〉", url: TWMD("geography/北投溫泉街") },
      { label: "北投溫泉博物館：誕生與溫泉鄉重生", url: "https://hotspringmuseum.taipei/tourguide_content.aspx?id=466&pid=130" }
    ]
  },
  "district:信義": {
    title: "四四南村",
    body: "台北第一個眷村，住的是從青島遷來的聯勤第四十四兵工廠員工和家屬。信義計畫區開發後居民在 1999 年全部遷出，經文化界爭取保留其中 4 棟，2003 年 10 月 25 日以信義公民會館暨眷村文化公園開放，就在 101 旁邊。",
    sources: [
      { label: "Taiwan.md〈四四南村〉", url: TWMD("geography/四四南村") },
      { label: "臺北市信義區公所：會館故事", url: "https://xydo.gov.taipei/News_Content.aspx?n=51D1E85EF9360CD6&sms=27C846034DA03BCB&s=4EB7D4B6B526505F" }
    ]
  },
  "district:中正": {
    title: "北門承恩門",
    body: "臺北府城 1884 年完工，開了五座城門，北門叫「承恩門」。日治初期為了治水和都市改正，城牆被拆掉。戰後其他城門整修後都失去原貌，只有北門保留原樣，是國定古蹟。",
    sources: [
      { label: "Taiwan.md〈台北市〉", url: TWMD("geography/台北市") },
      { label: "文化部文化資產局：北門早期甕城門額", url: "https://nchdb.boch.gov.tw/embed/assets/overview/antiquity/20180601000001" },
      { label: "文化部文化資產局：臺北府城", url: "https://nchdb.boch.gov.tw/assets/overview/monument/19980903000001" }
    ]
  },
  "district:士林": {
    title: "八芝蘭：溫泉",
    body: "士林舊名「八芝蘭」，譯自平埔族語 Pattsiran，意思是「溫泉」，原本是麻少翁社的居住地。因為這裡私塾、書院多，文風興盛，取「士子如林」的意思改叫士林，1897 年起成為正式地名。",
    sources: [
      { label: "Taiwan.md〈士林〉", url: TWMD("geography/士林") },
      { label: "臺北市士林區公所：歷史沿革", url: "https://sldo.gov.taipei/News_Content.aspx?n=0B28F6DC02F5914C&s=C10EF582DBAA65C3" }
    ]
  },
  "district:大同": {
    title: "大稻埕與 Formosa Oolong Tea",
    body: "英商約翰杜德（John Dodd）發現台灣很適合種茶，請買辦李春生引進茶苗，在大稻埕擴大經營。1869 年他以「Formosa Oolong Tea」為名把烏龍茶直接賣到紐約，一炮而紅，大稻埕從此成了茶商雲集的地方。",
    sources: [
      { label: "Taiwan.md〈大稻埕〉", url: TWMD("geography/大稻埕") },
      { label: "臺北市文化局《聞聞大稻埕》（2020）", url: "https://www-ws.gov.taipei/001/Upload/686/relfile/55437/8338299/093cbdce-a2a7-471c-8742-499246e6df9a.pdf" }
    ]
  },
  "district:大安": {
    title: "仁愛路林蔭大道",
    body: "仁愛路在 1932 年的都市計畫裡就被規劃成林蔭道路。1958 年拓寬為 60 公尺，當作國際迎賓大道；1967 年三段拓寬到 100 公尺。依臺北市行道樹資料，現在路上最多的是大王椰子和樟樹，遊戲裡的仁愛運河也照這樣種。",
    sources: [
      { label: "Taiwan.md〈台灣行道樹〉", url: TWMD("lifestyle/台灣行道樹") },
      { label: "臺北市工務局：仁愛路變身趣史", url: "https://pwd.gov.taipei/News_Content.aspx?n=5C3C29C78077C93E&s=634139F420293468" },
      { label: "臺北市行道樹開放資料", url: "https://data.taipei/dataset/detail?id=7a49d00c-a5ff-4a6b-be9e-aaa6dc1ff7e8" }
    ]
  }
};

// ===== 台灣動物卡（岸邊樹上尋寶發現）=====
// 同樣先在 Taiwan.md 找到，再回國家公園、海洋保育署、農業部、臺灣生命大百科、科博館的原始資料逐句核對。
// Taiwan.md 這幾篇多數標示「待查證」，所以數字只用原始資料寫得到的：
// 石虎數量各來源不一（科博館「可能不到 1000 隻」、Taiwan.md「不到 500 隻」），卡上不寫；
// 黑熊、白海豚、櫻花鉤吻鮭的族群數字隨調查年份變動，也不寫。
// 長鬃山羊、藍腹鷴、莫氏樹蛙、臺北樹蛙在 Taiwan.md 只出現在〈特有種〉的物種列表，內容全部來自原始資料。
// 圖片由專案作者提供（assets/animals/）。2026-11-26 核對。
const NPS = (id) => `https://www.taiwan.nps.gov.tw/home/zh-tw/eco-gallery/${id}.html`;
const TAIEOL = (id) => `https://taieol.tw/pages/${id}`;
const ANIMAL = (file) => `assets/animals/${file}.webp`;

Object.assign(KNOWLEDGE_CARDS, {
  "animal:blueMagpie": {
    title: "臺灣藍鵲",
    image: ANIMAL("blueMagpie"),
    body: "臺灣特有種。全身蔚藍，頭、頸和胸部是黑色，嘴和腳是紅色，尾羽越往中間越長，常成群出現，所以又叫「長尾陣」。牠們合作育雛：部分孩子會留下來當幫手，幫忙驅離入侵者、送食物給孵蛋的雌鳥。除了中低海拔的森林，公園這類樹多的地方也看得到牠們。",
    sources: [
      { label: "Taiwan.md〈台灣藍鵲〉", url: TWMD("nature/台灣藍鵲") },
      { label: "臺灣國家公園：臺灣藍鵲", url: NPS(21493) }
    ]
  },
  "animal:macaque": {
    title: "臺灣獼猴",
    image: ANIMAL("macaque"),
    body: "臺灣特有種，也是臺灣島上除了人類以外唯一的靈長類，主要住在海拔 3,000 公尺以下的森林，吃果實和嫩葉。牠們群居，一群以十幾到三十隻最常見，白天活動，清晨和黃昏是覓食高峰。遇到危險時會發出短促的「喀！喀！」聲，或搖動樹枝警告同伴。",
    sources: [
      { label: "Taiwan.md〈台灣獼猴〉", url: TWMD("nature/台灣獼猴") },
      { label: "臺灣國家公園：人猴距離拿捏好，臺灣獼猴有生機", url: "https://www.taiwan.nps.gov.tw/home/zh-tw/topic/18525.html" },
      { label: "臺灣生命大百科：臺灣獼猴", url: TAIEOL(73696) }
    ]
  },
  "animal:serow": {
    title: "臺灣長鬃山羊",
    image: ANIMAL("serow"),
    body: "臺灣特有種，也是臺灣唯一的野生牛科動物。牠擅長在陡坡活動，靠外突的蹄抓住岩石表面，棲息在海拔 200 到 3,800 公尺之間的山區森林，也常出現在岩石裸露的崩塌地和險峻陡峭的山區。警戒心很強，生氣、警戒或受傷時會發出低沉宏亮的叫聲。",
    sources: [
      { label: "Taiwan.md〈特有種〉", url: TWMD("nature/特有種") },
      { label: "臺灣國家公園：臺灣長鬃山羊", url: NPS(21343) }
    ]
  },
  "animal:swinhoePheasant": {
    title: "藍腹鷴",
    image: ANIMAL("swinhoePheasant"),
    body: "臺灣特有種。雄鳥臉上裸露的皮膚和肉冠是耀眼的血紅色，頭頂有白色羽冠，後頸、上背和中央一對特長的尾羽是潔白色，腹面黑色帶鐵青色光澤。牠住在海拔約 300 到 2,300 公尺的闊葉林底層，學名 swinhoii 是紀念英國外交官 Robert Swinhoe。",
    sources: [
      { label: "Taiwan.md〈特有種〉", url: TWMD("nature/特有種") },
      { label: "臺灣生命大百科：藍腹鷴", url: TAIEOL(73078) }
    ]
  },
  "animal:mikadoPheasant": {
    title: "帝雉",
    image: ANIMAL("mikadoPheasant"),
    body: "臺灣特有種，新臺幣 1,000 元鈔票背面的兩隻鳥就是牠。牠住在海拔 1,800 到 3,800 公尺常有雲霧的高山，生性害羞機警，被稱為「迷霧中的王者」。1906 年，英國探險家古費洛在鄒族的頭飾上看到兩根黑白相間的長尾羽，帶回英國鑑定，學名因此用了日文「天皇」的 mikado。",
    sources: [
      { label: "Taiwan.md〈帝雉〉", url: TWMD("nature/帝雉") },
      { label: "農業部：迷霧中的王者─帝雉", url: "https://www.moa.gov.tw/ws.php?id=2501252" }
    ]
  },
  "animal:moltrechtFrog": {
    title: "莫氏樹蛙",
    image: ANIMAL("moltrechtFrog"),
    body: "臺灣特有種。背面墨綠色，眼睛的虹膜和大腿內側是橘紅色，身體側面和四肢內側有許多小黑斑，指尖有吸盤。從低海拔的樹林、果園到兩千多公尺的山區都找得到，是臺灣分布最廣的樹蛙。北部多在春夏繁殖，花蓮則在冬天。",
    sources: [
      { label: "Taiwan.md〈特有種〉", url: TWMD("nature/特有種") },
      { label: "太魯閣國家公園：不同海拔莫氏樹蛙族群生活史之比較（2010）", url: "https://ws.moi.gov.tw/Download.ashx?u=LzAwMS9VcGxvYWQvT2xkRmlsZV9UQVJPS08vV2ViRmlsZXMvRWNvbG9naWNhbFJlc2VhcmNoRmlsZXMvNDA5NC9maWxlMTM1MDY2NzM5MjM4MDQucGRm&n=ZmlsZTEzNTA2NjczOTIzODA0LnBkZg%3D%3D" }
    ]
  },
  "animal:taipeiFrog": {
    title: "臺北樹蛙",
    image: ANIMAL("taipeiFrog"),
    body: "臺灣特有種，體長 4 到 6 公分，背面綠色、腹面白中帶黃，虹膜是黃色。牠特別的地方是在秋末和冬天繁殖：平地大約十二月到隔年二月，山區從十月到隔年三月。陽明山連續五年的調查發現，牠們可以活到 5 歲，而且每年都回到同一個地方繁殖。",
    sources: [
      { label: "Taiwan.md〈特有種〉", url: TWMD("nature/特有種") },
      { label: "臺灣生命大百科：臺北樹蛙", url: TAIEOL(225726) }
    ]
  },
  "animal:blackBear": {
    title: "臺灣黑熊",
    image: ANIMAL("blackBear"),
    body: "亞洲黑熊的七個亞種之一，也是臺灣唯一原產的熊。最大的特徵是胸前黃白色的 V 字形或新月形斑紋，所以又叫「月熊」。成熊約 60 到 150 公斤，主要住在中央山脈海拔 1,000 到 2,500 公尺的森林。玉山國家公園的無線電追蹤研究發現，臺灣黑熊沒有冬眠，一年到頭都在活動。",
    sources: [
      { label: "Taiwan.md〈台灣黑熊〉", url: TWMD("nature/台灣黑熊") },
      { label: "玉山國家公園：臺灣黑熊科普", url: "https://www.ysnp.gov.tw/StaticPage/Science" }
    ]
  },
  "animal:whiteDolphin": {
    title: "臺灣白海豚",
    image: ANIMAL("whiteDolphin"),
    body: "俗稱中華白海豚，喜歡近岸水深 25 公尺以內的淺海和河口。剛出生時全身灰色，長大後身上出現斑點，成年後轉成白色或粉紅色。2015 年學者把臺灣海峽這一群描述為新亞種 Sousa chinensis taiwanensis。2020 年 9 月 1 日起，苗栗到雲林外海 763 平方公里劃為牠們的重要棲息環境。",
    sources: [
      { label: "Taiwan.md〈台灣白海豚〉", url: TWMD("nature/台灣白海豚") },
      { label: "海洋保育署：臺灣海域白海豚保育專區", url: "https://www.oca.gov.tw/ch/home.jsp?id=368&parentpath=0,296,360" },
      { label: "Zoological Studies（2015）新亞種描述", url: "https://zoolstud.sinica.edu.tw/Journals/54/54-36.html" }
    ]
  },
  "animal:salmon": {
    title: "櫻花鉤吻鮭",
    image: ANIMAL("salmon"),
    body: "冰河時期留下來的陸封型太平洋鮭魚，被稱為「國寶魚」。臺灣是北半球鮭魚分布的南界，櫻花鉤吻鮭現在主要只剩雪霸國家公園武陵地區的七家灣溪和它的上游。雪霸國家公園管理處在武陵遊憩區設有櫻花鉤吻鮭生態中心。",
    sources: [
      { label: "Taiwan.md〈櫻花鉤吻鮭〉", url: TWMD("nature/櫻花鉤吻鮭") },
      { label: "臺灣國家公園：櫻花鉤吻鮭生態中心", url: "https://www.taiwan.nps.gov.tw/home/zh-tw/topic/18290.html" },
      { label: "農業部水產試驗所：愈來愈多櫻花鉤吻鮭戲游七家灣溪", url: "https://www.tfrin.gov.tw/theme_data.php?theme=news&sub_theme=feed&id=35276" }
    ]
  },
  "animal:pangolin": {
    title: "臺灣穿山甲",
    image: ANIMAL("pangolin"),
    body: "臺灣特有亞種，全身披著硬鱗片。牠用強壯的前爪挖洞找食物，主食是白蟻和螞蟻，用又長又黏的舌頭把蟻黏進嘴裡。白天待在洞穴裡，晚上才出來覓食，還會爬樹和游泳。遇到危險時會把頭往肚子捲成一顆球，讓背上的硬鱗朝外。",
    sources: [
      { label: "Taiwan.md〈台灣穿山甲〉", url: TWMD("nature/台灣穿山甲") },
      { label: "臺灣生命大百科：臺灣穿山甲", url: TAIEOL(75630) }
    ]
  },
  "animal:leopardCat": {
    title: "石虎",
    image: ANIMAL("leopardCat"),
    body: "臺灣現在唯一的原生貓科動物，另一種原生的臺灣雲豹已證實滅絕。石虎和家貓很像，分辨方法是：額頭有兩條白色縱紋、眼眶有白圈、耳朵背後有白斑，身上是深色斑點而不是條紋。成年石虎的叫聲是低沉的嘶喝聲，不會喵喵叫。",
    sources: [
      { label: "Taiwan.md〈台灣石虎保育〉", url: TWMD("nature/台灣石虎保育") },
      { label: "國立自然科學博物館：認識石虎", url: "https://web3.nmns.edu.tw/exhibits/107/leopardcat/cont1.html" }
    ]
  }
});

export const ANIMAL_KEYS = Object.keys(KNOWLEDGE_CARDS).filter((k) => k.startsWith("animal:"));

export const KNOWLEDGE_LICENSE = { label: "CC BY-SA 4.0", url: "https://creativecommons.org/licenses/by-sa/4.0/deed.zh-hant" };
