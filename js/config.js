// 遊戲核心參數設定（方便後續調整配色、船隻數值、路名與對話）

export const WORLD_CONFIG = {
  // 4 條東西向運河 + 4 條南北向運河（中心座標）
  canalLines: [-75, -25, 25, 75],
  canalWidth: 16,
  halfExtent: 83, // 最外圍運河岸線
  blockCenters: [-50, 0, 50],
  blockHalfSize: 17, // 每個街廓為 34 x 34

  // 台北主要道路化作的運河名稱
  ewCanals: [
    { z: -75, name: "市民大道運河" },
    { z: -25, name: "忠孝運河" },
    { z: 25, name: "仁愛運河" },
    { z: 75, name: "信義運河" }
  ],
  nsCanals: [
    { x: -75, name: "中山運河" },
    { x: -25, name: "復興運河" },
    { x: 25, name: "敦化運河" },
    { x: 75, name: "光復運河" }
  ]
};

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
export const TIME_PRESETS = {
  dawn: {
    label: "清晨",
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
