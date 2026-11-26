// 知識卡收藏的存讀，存在瀏覽器 localStorage。
// 無痕模式或停用儲存時 localStorage 會丟錯，這時退回只記在這一局，遊戲照常進行。
const STORAGE_KEY = "taipei-canal-voyage:knowledge-cards";

export function loadCollected(validKeys) {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (!Array.isArray(saved)) return new Set();
    // 卡片改版拿掉某張時，舊存檔裡的那張不算數
    return new Set(saved.filter((k) => validKeys.includes(k)));
  } catch {
    return new Set();
  }
}

export function saveCollected(collected) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...collected]));
  } catch {
    // 存不進去就只留在這一局
  }
}

export function clearCollected(collected) {
  collected.clear();
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // 同上
  }
}
