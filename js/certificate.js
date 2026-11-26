// 破關獎狀：用 canvas 畫成 PNG，讓玩家分享或下載。
const W = 1080;
const H = 1350;
const ORANGE = "#f26b3a";
const ORANGE_DEEP = "#d95224";
const INK = "#2b3445";
const SOFT = "#5c677b";
const SERIF = '"Noto Serif TC", "Songti TC", serif';
const SANS = '"Noto Sans TC", -apple-system, "PingFang TC", sans-serif';

export const CERT_TITLE = "我是台北市的五星船長 aka 五星船員！";
export const CERT_FILENAME = "台北運河漫遊-五星船長獎狀.png";

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null); // 少一張圖不影響獎狀，空著就好
    img.src = src;
  });
}

// Google Fonts 的中文字型是依用到的字分批下載，畫之前要先把這些字載進來，不然會用系統字型畫
async function loadFonts(text) {
  if (!document.fonts?.load) return;
  try {
    await Promise.all([
      document.fonts.load(`700 80px ${SERIF}`, text),
      document.fonts.load(`700 40px ${SANS}`, text),
      document.fonts.load(`400 40px ${SANS}`, text)
    ]);
  } catch {
    // 字型載不到就用系統字型，獎狀照樣能畫
  }
}

function star(ctx, cx, cy, r) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    ctx.lineTo(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad);
  }
  ctx.closePath();
  ctx.fill();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * @param {{ total:number, placeCount:number, animalCount:number, animalImages:string[], date:Date }} info
 * @returns {Promise<Blob>}
 */
export async function renderCertificate({ total, placeCount, animalCount, animalImages, date }) {
  const dateText = `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日`;
  const lines = {
    eyebrow: "TAIPEI CANAL VOYAGE",
    heading: "獎　狀",
    l1: "我是台北市的",
    l2: "五星船長",
    l3: "aka 五星船員！",
    detail: `在「台北運河漫遊」收集了全部 ${total} 張知識卡`,
    detail2: `台北景點 ${placeCount} 張・台灣動物 ${animalCount} 張`,
    date: `破關日期　${dateText}`,
    url: "taipei-canal-voyage.vercel.app"
  };
  await loadFonts(Object.values(lines).join(""));
  const images = await Promise.all(animalImages.map(loadImage));

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  // 底色
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#fffaf2");
  bg.addColorStop(1, "#fdeedd");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // 雙框
  ctx.strokeStyle = ORANGE;
  ctx.lineWidth = 10;
  roundRect(ctx, 40, 40, W - 80, H - 80, 34);
  ctx.stroke();
  ctx.strokeStyle = "rgba(242, 107, 58, 0.35)";
  ctx.lineWidth = 3;
  roundRect(ctx, 64, 64, W - 128, H - 128, 24);
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  ctx.fillStyle = ORANGE;
  ctx.font = `700 30px ${SANS}`;
  ctx.letterSpacing = "8px";
  ctx.fillText(lines.eyebrow, W / 2, 150);
  ctx.letterSpacing = "0px";

  ctx.fillStyle = INK;
  ctx.font = `700 96px ${SERIF}`;
  ctx.fillText(lines.heading, W / 2, 262);

  // 五顆星
  ctx.fillStyle = "#f5b335";
  for (let i = 0; i < 5; i++) star(ctx, W / 2 + (i - 2) * 92, 342, 36);

  ctx.fillStyle = INK;
  ctx.font = `700 64px ${SERIF}`;
  ctx.fillText(lines.l1, W / 2, 472);

  ctx.fillStyle = ORANGE_DEEP;
  ctx.font = `700 150px ${SERIF}`;
  ctx.fillText(lines.l2, W / 2, 636);

  ctx.fillStyle = INK;
  ctx.font = `700 64px ${SERIF}`;
  ctx.fillText(lines.l3, W / 2, 742);

  ctx.fillStyle = SOFT;
  ctx.font = `400 34px ${SANS}`;
  ctx.fillText(lines.detail, W / 2, 822);
  ctx.fillText(lines.detail2, W / 2, 868);

  // 12 隻動物，兩排各 6 隻
  const size = 104;
  const gap = 18;
  const perRow = 6;
  const rowW = perRow * size + (perRow - 1) * gap;
  images.forEach((img, i) => {
    const x = (W - rowW) / 2 + (i % perRow) * (size + gap);
    const y = 912 + Math.floor(i / perRow) * (size + gap);
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2 + 4, 0, Math.PI * 2);
    ctx.fill();
    if (img) ctx.drawImage(img, x, y, size, size);
  });

  ctx.fillStyle = SOFT;
  ctx.font = `500 30px ${SANS}`;
  ctx.fillText(lines.date, W / 2, 1196);
  ctx.fillStyle = ORANGE;
  ctx.font = `500 26px ${SANS}`;
  ctx.fillText(lines.url, W / 2, 1240);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("toBlob 回傳空值"))), "image/png");
  });
}

export function downloadBlob(blob, filename = CERT_FILENAME) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

/**
 * 用系統分享選單分享獎狀；不支援分享檔案的瀏覽器回傳 "unsupported"，交給呼叫端改成下載。
 * 不同失敗分開回報，才知道是使用者取消還是瀏覽器擋下來。
 * @returns {Promise<"shared"|"unsupported"|"cancelled"|{error:string}>}
 */
export async function shareBlob(blob, filename = CERT_FILENAME) {
  const file = new File([blob], filename, { type: "image/png" });
  if (!navigator.canShare?.({ files: [file] })) return "unsupported";
  try {
    await navigator.share({ files: [file], title: "台北運河漫遊", text: CERT_TITLE });
    return "shared";
  } catch (err) {
    if (err?.name === "AbortError") return "cancelled";
    return { error: `${err?.name || "Error"}：${err?.message || "未知錯誤"}` };
  }
}
