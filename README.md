# 台北運河漫遊｜Taipei Canal Voyage

一款以**紀念碑谷（Monument Valley）**柔和幾何美學打造的 3D 瀏覽器網頁遊戲。將台北市區主要幹道（市民大道、忠孝、仁愛、信義、中山、復興、敦化、光復）化為運河，開著你的橘色船隻在城市中划船交朋友！

## 特色功能
- **四種時段光影**：清晨、正午、夕陽、夜晚平滑切換，夜晚建築窗格與運河橋燈自動點亮。
- **三種尺寸橘色船隻**：
  - `1 人` 單人立槳 SUP（初始）
  - `5 人` 優雅帆船（累積 30 分解鎖）
  - `10 人` 海盜船（累積 80 分解鎖）
- **交友與搭便車機制**：靠近 AI 船友揮手交朋友累積分數；靠近帆船或海盜船可暫時收起自己的橘船，跳上對方甲板一起漂流看台北。
- **跨裝置操控**：支援電腦鍵盤（WASD / 方向鍵 / Space / E）與手機觸控（虛擬搖桿 + 互動鈕 + 雙指縮放）。

## 檔案結構（已模組化拆分，方便擴充調整）
```text
taipei-canal-voyage/
├── index.html          # 主頁面與 HUD 結構
├── css/
│   └── style.css       # 紀念碑谷毛玻璃介面與手機響應式樣式
├── js/
│   ├── config.js       # 時段配色、船隻數值、路名與 NPC 對話設定
│   ├── city.js         # 台北棋盤運河、台北101、紀念堂、大安水岸、高拱橋與水面
│   ├── boats.js        # 三種尺寸橘色船隻 3D 建模與極簡人物
│   ├── npc.js          # AI 船友巡航、轉彎避讓與互動邏輯
│   ├── controls.js     # 鍵盤與手機觸控虛擬搖桿
│   ├── ui.js           # HUD、小地圖、對話氣泡與升級提示
│   └── main.js         # 主場景、光影平滑過渡、碰撞、登船收船與主迴圈
└── vercel.json         # Vercel 靜態部署設定
```

## 本地預覽
因為使用了原生 ES Modules，請透過本地靜態伺服器開啟（不要直接雙擊 `index.html`）：
```bash
# Python 3
python3 -m http.server 8000
# 接著瀏覽器打開 http://localhost:8000
```

## 部署到 GitHub + Vercel
1. 在 GitHub 建立新 Repository 並把這個資料夾內所有檔案 push 上去。
2. 前往 [Vercel](https://vercel.com/) → **Add New Project** → 匯入你的 GitHub Repo。
3. Framework Preset 選 **Other**（不需設定 Build Command，Output Directory 留空）。
4. 點擊 **Deploy**，數秒內即完成上線，手機與電腦皆可直接打開連結遊玩！
