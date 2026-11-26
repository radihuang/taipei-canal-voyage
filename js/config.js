// 遊戲核心參數設定（方便後續調整配色、船隻數值、路名與對話）

// 樹種代號（造型定義在 trees.js）
// 每條運河的行道樹，依臺北市公園處「行道樹資料」開放資料（2026-11-26 版）統計：
// 取該路段在本遊戲 9 種樹裡數量最多者，數字為實際棵數；前兩名接近時兩種交錯種。
export const TREE_NAMES = {
  camphor: "樟樹",
  goldenrain: "臺灣欒樹",
  terminalia: "小葉欖仁",
  melaleuca: "白千層",
  sweetgum: "楓香",
  goldenshower: "阿勃勒",
  bishopwood: "茄苳",
  chinaberry: "苦楝",
  royalpalm: "大王椰子"
};

const LINES = [-175, -125, -75, -25, 25, 75, 125, 175];

export const WORLD_CONFIG = {
  // 8 條東西向 + 8 條南北向運河（中心座標），圍出 7 x 7 個街廓
  canalLines: LINES,
  canalWidth: 16,
  halfExtent: 183, // 最外圍運河岸線
  blockCenters: [-150, -100, -50, 0, 50, 100, 150],
  blockHalfSize: 17, // 每個街廓為 34 x 34

  // 由北到南（z 由小到大）
  ewCanals: [
    { z: LINES[0], name: "大度運河", trees: ["bishopwood"] }, // 茄苳 373
    { z: LINES[1], name: "福國運河", trees: ["chinaberry"] }, // 苦楝 151
    { z: LINES[2], name: "北安運河", trees: ["melaleuca"] }, // 白千層 459
    { z: LINES[3], name: "南京運河", trees: ["sweetgum"] }, // 楓香 427
    { z: LINES[4], name: "忠孝運河", trees: ["bishopwood"] }, // 茄苳 523
    { z: LINES[5], name: "仁愛運河", trees: ["royalpalm", "camphor"] }, // 大王椰子 1097、樟樹 1044
    { z: LINES[6], name: "和平運河", trees: ["melaleuca"] }, // 白千層 431
    { z: LINES[7], name: "辛亥運河", trees: ["goldenrain"] } // 臺灣欒樹 265
  ],
  // 由西到東（x 由小到大）
  nsCanals: [
    { x: LINES[0], name: "艋舺運河", trees: ["terminalia"] }, // 小葉欖仁 102
    { x: LINES[1], name: "中華運河", trees: ["bishopwood"] }, // 茄苳 225
    { x: LINES[2], name: "中山運河", trees: ["camphor"] }, // 中山北路 樟樹 1031
    { x: LINES[3], name: "長興運河", trees: ["goldenshower"] }, // 長興街 阿勃勒 124
    { x: LINES[4], name: "敦化運河", trees: ["camphor", "goldenrain"] }, // 敦化南路 欒樹 921、樟樹 822
    { x: LINES[5], name: "光復運河", trees: ["sweetgum"] }, // 光復南路 楓香 218
    { x: LINES[6], name: "堤頂運河", trees: ["chinaberry", "goldenshower"] }, // 苦楝 537、阿勃勒 237
    { x: LINES[7], name: "南港運河", trees: ["bishopwood"] } // 南港路 茄苳 72
  ]
};

// 行政區：位置只抓相對方位，不照實際比例
// 每列由西到東、由北到南排，對應 blockCenters
export const DISTRICT_GRID = [
  ["北投", "北投", "士林", "士林", "士林", "內湖", "內湖"],
  ["北投", "士林", "士林", "中山", "內湖", "內湖", "內湖"],
  ["大同", "大同", "中山", "中山", "松山", "松山", "南港"],
  ["萬華", "大同", "中山", "松山", "松山", "信義", "南港"],
  ["萬華", "中正", "大安", "大安", "大安", "信義", "南港"],
  ["萬華", "中正", "大安", "大安", "信義", "信義", "南港"],
  ["文山", "文山", "文山", "文山", "文山", "信義", "南港"]
];

// 每區的建築高度、配色、廣場地坪色、公園比例、小地圖色
export const DISTRICTS = {
  北投: { heights: [5, 10], palette: [0xe9d8c5, 0xf4ece1, 0x99b8a9, 0xe39d85], plaza: 0xdfe8d6, park: 0.45, map: "#c9dcc0" },
  士林: { heights: [6, 12], palette: [0xf4ece1, 0xeac2bd, 0xe9d8c5, 0x99b8a9], plaza: 0xe8eadc, park: 0.3, map: "#dfe3cc" },
  內湖: { heights: [10, 20], palette: [0x8fa3ba, 0xfbf7f0, 0x8cc2bf, 0xf4ece1], plaza: 0xe4ebee, park: 0.2, map: "#d3dde6" },
  大同: { heights: [5, 9], palette: [0xe39d85, 0xe9d8c5, 0xd9a58a, 0xf4ece1], plaza: 0xf0e2d2, park: 0.08, map: "#efd5c2" },
  中山: { heights: [9, 18], palette: [0xeac2bd, 0xf4ece1, 0xe9d8c5, 0xfbf7f0], plaza: 0xf6ece8, park: 0.12, map: "#f2dcd6" },
  松山: { heights: [9, 19], palette: [0x8fa3ba, 0xf4ece1, 0xeac2bd, 0xe9d8c5], plaza: 0xeeeef0, park: 0.12, map: "#e1e2ea" },
  萬華: { heights: [4, 8], palette: [0xe39d85, 0xd9a58a, 0xe9d8c5, 0xeac2bd], plaza: 0xf2dfcf, park: 0.08, map: "#ecccb6" },
  中正: { heights: [8, 16], palette: [0xfbf7f0, 0xf4ece1, 0x8fa3ba, 0xe9d8c5], plaza: 0xf7f2ea, park: 0.15, map: "#f3ede2" },
  大安: { heights: [8, 18], palette: [0xeac2bd, 0xf4ece1, 0xe39d85, 0xfbf7f0], plaza: 0xf7efe6, park: 0.15, map: "#f4e3d8" },
  信義: { heights: [15, 26], palette: [0x8cc2bf, 0x8fa3ba, 0xfbf7f0, 0xeac2bd], plaza: 0xe6f0ef, park: 0.08, map: "#cfe3e1" },
  南港: { heights: [11, 21], palette: [0x8fa3ba, 0x8cc2bf, 0xf4ece1, 0xfbf7f0], plaza: 0xe2e9ec, park: 0.18, map: "#d0dbe2" },
  文山: { heights: [5, 11], palette: [0xf4ece1, 0x99b8a9, 0xe9d8c5, 0xeac2bd], plaza: 0xdde8d8, park: 0.45, map: "#c6dcc4" }
};

// 特殊地標所在街廓（"ix,iz"）
export const LANDMARKS = {
  "5,4": { key: "taipei101", name: "台北 101" },
  "1,4": { key: "memorial", name: "中正紀念堂" },
  "3,4": { key: "daanPark", name: "大安森林公園" }
};

// 載客：每種船能載幾位乘客（船長自己佔一個位置，所以是容量減一）
export const PASSENGER_CONFIG = {
  waitingCount: 14, // 地圖上同時有幾位在岸邊等船
  pickupRange: 6.5, // 船靠多近會接到人
  dropRange: 27 // 距離目的地街廓中心多近算送達（街廓半寬 17 + 運河 10）
};

// 取得某世界座標所在（或最近）的街廓索引
export function blockIndexAt(x, z) {
  const c = WORLD_CONFIG.blockCenters;
  const toIdx = (v) => Math.max(0, Math.min(c.length - 1, Math.round((v - c[0]) / 50)));
  return { ix: toIdx(x), iz: toIdx(z) };
}

// 三種橘色船隻尺寸與升級門檻
export const BOAT_TIERS = [
  {
    id: 0,
    key: "sup",
    name: "單人 SUP",
    shortName: "SUP",
    capacity: 1,
    unlockScore: 0,
    speed: 13.5,
    turnSpeed: 6.2,
    radius: 1.5,
    canBeBoarded: false
  },
  {
    id: 1,
    key: "sailboat",
    name: "五人帆船",
    shortName: "帆船",
    capacity: 5,
    unlockScore: 30,
    speed: 16.0,
    turnSpeed: 4.8,
    radius: 2.3,
    canBeBoarded: true
  },
  {
    id: 2,
    key: "pirate",
    name: "十人海盜船",
    shortName: "海盜船",
    capacity: 10,
    unlockScore: 80,
    speed: 18.2,
    turnSpeed: 3.8,
    radius: 3.1,
    canBeBoarded: true
  }
];

// 紀念碑谷美學：四種時段光影與配色預設
// 時段跟船一樣靠交友分數解鎖，門檻刻意跟船（30、80）錯開，讓玩家一直有下一個目標；
// 每次重開都從正午開始重新解鎖（分數本來就不存檔）
export const TIME_PRESETS = {
  dawn: {
    label: "清晨",
    unlockScore: 15,
    sky: 0xebd8e8,
    fog: 0xf1dfe8,
    fogDensity: 0.0042,
    sunColor: 0xffd1b3,
    sunIntensity: 1.25,
    sunPos: [95, 58, 65],
    hemiSky: 0xfbe8f3,
    hemiGround: 0x8ea6b8,
    hemiIntensity: 0.85,
    waterColor: 0x73b6bc,
    waterEmissive: 0x19363d,
    windowGlow: 0.25,
    lanternGlow: 0.45,
    isNight: false
  },
  noon: {
    label: "正午",
    unlockScore: 0,
    sky: 0xcbe8f6,
    fog: 0xd6eef9,
    fogDensity: 0.0032,
    sunColor: 0xfff8ea,
    sunIntensity: 1.55,
    sunPos: [70, 125, 55],
    hemiSky: 0xeaf8ff,
    hemiGround: 0x869db8,
    hemiIntensity: 0.9,
    waterColor: 0x4db3c4,
    waterEmissive: 0x0e333e,
    windowGlow: 0.0,
    lanternGlow: 0.0,
    isNight: false
  },
  sunset: {
    label: "夕陽",
    unlockScore: 45,
    sky: 0xf2a88c,
    fog: 0xf2b599,
    fogDensity: 0.0046,
    sunColor: 0xff9a5c,
    sunIntensity: 1.65,
    sunPos: [-110, 44, 72],
    hemiSky: 0xffcbb0,
    hemiGround: 0x675b80,
    hemiIntensity: 0.78,
    waterColor: 0x4c8ca6,
    waterEmissive: 0x382026,
    windowGlow: 0.55,
    lanternGlow: 0.75,
    isNight: false
  },
  night: {
    label: "夜晚",
    unlockScore: 100,
    sky: 0x18213a,
    fog: 0x1b2642,
    fogDensity: 0.0048,
    sunColor: 0x9ab4e8,
    sunIntensity: 0.72,
    sunPos: [-65, 95, -55],
    hemiSky: 0x3b4f7d,
    hemiGround: 0x141d33,
    hemiIntensity: 0.55,
    waterColor: 0x1a3857,
    waterEmissive: 0x081526,
    windowGlow: 1.15,
    lanternGlow: 1.35,
    isNight: true
  }
};

// 台北運河 NPC 船友資料庫
export const NPC_ROSTER = [
  {
    name: "大安咖啡師小魚",
    tier: 1,
    greetings: ["早安！剛在仁愛運河手沖完一杯 ☕", "要不要上船一起漂去大安水岸？"],
    reGreet: ["又遇見你了！今天水波好平靜呀 ✨"]
  },
  {
    name: "信義區阿豪",
    tier: 2,
    greetings: ["歡迎來到信義大帆海！我這艘可以坐十個人喔 ⚓", "從運河仰望 101 超壯觀的！"],
    reGreet: ["老朋友！隨時歡迎跳上我的海盜船！"]
  },
  {
    name: "敦化建築師 Mia",
    tier: 1,
    greetings: ["這座運河拱橋的弧線超像紀念碑谷！", "一起沿著敦化林蔭划一段吧 🌿"],
    reGreet: ["夕陽照在粉橘建築上真的好美～"]
  },
  {
    name: "忠孝攝影師阿哲",
    tier: 0,
    greetings: ["嗨！我正在拍台北運河的倒影 📸", "單人 SUP 鑽橋洞最靈活了！"],
    reGreet: ["剛幫你的橘船拍了一張超好看的！"]
  },
  {
    name: "松菸插畫家小葵",
    tier: 1,
    greetings: ["嗨～剛逛完展覽出來划船放空 🎨", "我船上有空位，累了可以搭便車！"],
    reGreet: ["今天靈感滿滿，謝謝你的招呼 💛"]
  },
  {
    name: "永康街船長老林",
    tier: 2,
    greetings: ["哈囉年輕人！上來我這艘十人海盜船吹風吧！", "聽說前面仁愛運河開了水上豆花攤～"],
    reGreet: ["哈哈又碰頭啦，這就是台北的緣分！"]
  },
  {
    name: "光復路慢跑哥 Kevin",
    tier: 0,
    greetings: ["以前都在路跑，現在改划 SUP 練核心 💪", "順流划起來超舒服！"],
    reGreet: ["加油加油！我們一起繞台北一圈！"]
  },
  {
    name: "中山古著店主 Nana",
    tier: 1,
    greetings: ["你的橘色船好亮眼！跟我今天的配色超搭 🧡", "要搭順風船去中山運河嗎？"],
    reGreet: ["哈囉～今天水面顏色像莫蘭迪藍呢！"]
  },
  {
    name: "市民大道吉他手阿樂",
    tier: 2,
    greetings: ["登船聽我彈一首台北水岸民謠吧 🎸", "夜晚點燈後這裡超浪漫！"],
    reGreet: ["這首安可曲獻給最棒的船友 🎶"]
  },
  {
    name: "復興南路夜貓子 Ray",
    tier: 0,
    greetings: ["切換成夜晚模式看城市燈火超療癒 🌙", "很高興在運河上認識你！"],
    reGreet: ["晚安旅人，願水波溫柔托住你～"]
  },
  {
    name: "東區甜點師可可",
    tier: 1,
    greetings: ["嗨！船上有剛烤好的可麗露要分享嗎 🧁", "跳上來休息一下再繼續划吧！"],
    reGreet: ["每次遇到你心情都變好好！"]
  },
  {
    name: "四四南村植物控阿森",
    tier: 0,
    greetings: ["岸邊的柏樹跟拱橋配起來好像畫喔 🌲", "一起把台北運河探索完吧！"],
    reGreet: ["嗨朋友！記得多換幾個時段看光影喔！"]
  }
];
