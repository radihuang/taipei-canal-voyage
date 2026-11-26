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

export const KNOWLEDGE_LICENSE = { label: "CC BY-SA 4.0", url: "https://creativecommons.org/licenses/by-sa/4.0/deed.zh-hant" };
