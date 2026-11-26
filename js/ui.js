import * as THREE from "three";
import { WORLD_CONFIG, BOAT_TIERS, DISTRICT_GRID, DISTRICTS, LANDMARKS, TREE_NAMES, blockIndexAt } from "./config.js";

export class GameUI {
  constructor({ onSelectTime, onSelectBoat }) {
    this.scoreEl = document.getElementById("score-val");
    this.friendsEl = document.getElementById("friends-val");
    this.nextLabelEl = document.getElementById("next-tier-label");
    this.nextProgEl = document.getElementById("next-tier-progress");
    this.progressFill = document.getElementById("progress-fill");
    this.locationTag = document.getElementById("location-tag");

    this.interactBar = document.getElementById("interact-bar");
    this.nearbyType = document.getElementById("nearby-boat-type");
    this.nearbyName = document.getElementById("nearby-name");
    this.interactHint = document.getElementById("interact-hint");

    this.passengerBanner = document.getElementById("passenger-banner");
    this.passengerText = document.getElementById("passenger-text");

    this.btnGreet = document.getElementById("btn-greet");
    this.btnBoard = document.getElementById("btn-board");
    this.boardIcon = document.getElementById("board-icon");
    this.boardLabel = document.getElementById("board-label");

    this.bubblesLayer = document.getElementById("bubbles-layer");
    this.toastContainer = document.getElementById("toast-container");

    this.minimapCanvas = document.getElementById("minimap");
    this.minimapCtx = this.minimapCanvas.getContext("2d");

    this.passengerCountEl = document.getElementById("passenger-count");
    this.passengerDestsEl = document.getElementById("passenger-dests");
    this.passengerDomMap = new Map();

    this.knowledgeEl = document.getElementById("knowledge-card");
    this.knowledgeEyebrowEl = document.getElementById("knowledge-eyebrow");
    this.knowledgeTitleEl = document.getElementById("knowledge-title");
    this.knowledgeBodyEl = document.getElementById("knowledge-body");
    this.knowledgeSourcesEl = document.getElementById("knowledge-sources");
    this.knowledgeTimer = null;
    document.getElementById("knowledge-close").addEventListener("click", () => this.hideKnowledgeCard());

    this.collection = null; // initCollection 之後才有
    this.collectionBtn = document.getElementById("collection-btn");
    this.collectionCountEl = document.getElementById("collection-count");
    this.collectionEl = document.getElementById("collection-overlay");
    this.collectionProgressEl = document.getElementById("collection-progress");
    this.collectionGridEl = document.getElementById("collection-grid");
    this.collectionDetailEl = document.getElementById("collection-detail");
    this.collectionFooterEl = document.getElementById("collection-footer");
    this.collectionClearBtn = document.getElementById("collection-clear");
    this.collectionClearArmed = false;
    this.collectionBtn.addEventListener("click", () => this.openCollection());
    document.getElementById("collection-close").addEventListener("click", () => this.closeCollection());
    document.getElementById("collection-back").addEventListener("click", () => this._showCollectionGrid());
    this.collectionClearBtn.addEventListener("click", () => this._onClearClick());
    this.collectionEl.addEventListener("click", (e) => {
      if (e.target === this.collectionEl) this.closeCollection();
    });
    // 收藏冊開著時，按鍵不傳給遊戲（否則在卡片上按 Enter 會同時觸發登船）
    this.collectionEl.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.closeCollection();
      e.stopPropagation();
    });

    this.npcDomMap = new Map();
    this.playerBubbleEl = this._createBubbleEl();
    this.playerBubbleTimer = 0;

    // 時段按鈕
    document.querySelectorAll(".time-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".time-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        onSelectTime(btn.dataset.time);
      });
    });

    // 船隻切換按鈕
    document.querySelectorAll(".boat-pill").forEach((pill) => {
      pill.addEventListener("click", () => {
        const tier = Number(pill.dataset.tier);
        onSelectBoat(tier);
      });
    });

    // 開始按鈕
    const startBtn = document.getElementById("start-btn");
    const overlay = document.getElementById("welcome-overlay");
    startBtn?.addEventListener("click", () => {
      overlay?.classList.add("fade-out");
      setTimeout(() => overlay?.remove(), 480);
    });
  }

  _createBubbleEl() {
    const el = document.createElement("div");
    el.className = "speech-bubble hidden";
    this.bubblesLayer.appendChild(el);
    return el;
  }

  showPlayerBubble(text, duration = 2.6) {
    this.playerBubbleEl.textContent = text;
    this.playerBubbleEl.classList.remove("hidden");
    this.playerBubbleTimer = duration;
  }

  showToast(message, { soft = false } = {}) {
    const el = document.createElement("div");
    el.className = soft ? "toast soft" : "toast";
    el.textContent = message;
    this.toastContainer.appendChild(el);
    setTimeout(() => {
      el.style.opacity = "0";
      el.style.transition = "opacity 0.35s ease";
      setTimeout(() => el.remove(), 360);
    }, 2800);
  }

  setNightTheme(isNight) {
    document.body.classList.toggle("theme-night", isNight);
  }

  updateStats({ score, friendsCount, currentTier, maxUnlockedTier }) {
    this.scoreEl.textContent = score;
    this.friendsEl.textContent = friendsCount;

    const nextTier = BOAT_TIERS.find((t) => t.id > maxUnlockedTier);
    if (nextTier) {
      const prevThreshold = BOAT_TIERS[maxUnlockedTier].unlockScore;
      const pct = Math.min(
        100,
        Math.max(0, ((score - prevThreshold) / (nextTier.unlockScore - prevThreshold)) * 100)
      );
      this.nextLabelEl.textContent = `距離 ${nextTier.name}`;
      this.nextProgEl.textContent = `${score} / ${nextTier.unlockScore}`;
      this.progressFill.style.width = `${pct}%`;
    } else {
      this.nextLabelEl.textContent = "已解鎖全部船艦！";
      this.nextProgEl.textContent = "滿級船長 ⚓";
      this.progressFill.style.width = "100%";
    }

    document.querySelectorAll(".boat-pill").forEach((pill) => {
      const t = Number(pill.dataset.tier);
      const info = BOAT_TIERS[t];
      const unlocked = t <= maxUnlockedTier;
      pill.classList.toggle("locked", !unlocked);
      pill.classList.toggle("active", t === currentTier);
      pill.querySelector(".pill-name").textContent = unlocked
        ? info.shortName
        : `🔒 ${info.shortName}`;
    });
  }

  updateInteraction({ nearestNpc, boardedNpc }) {
    if (boardedNpc) {
      this.passengerBanner.classList.remove("hidden");
      this.passengerText.textContent = `正在搭乘「${boardedNpc.name}」的${boardedNpc.tierInfo.shortName}（你的橘船已暫時收起）`;
      this.btnBoard.disabled = false;
      this.btnBoard.classList.add("boarding-active");
      this.btnBoard.classList.remove("ready");
      this.boardIcon.textContent = "🛶";
      this.boardLabel.textContent = "下船自駕";
    } else {
      this.passengerBanner.classList.add("hidden");
      this.btnBoard.classList.remove("boarding-active");
      this.boardIcon.textContent = "⛵";
      this.boardLabel.textContent = "搭便車";

      if (nearestNpc && nearestNpc.tierInfo.canBeBoarded) {
        this.btnBoard.disabled = false;
        this.btnBoard.classList.add("ready");
      } else {
        this.btnBoard.disabled = true;
        this.btnBoard.classList.remove("ready");
      }
    }

    // 交朋友按鈕
    if (nearestNpc) {
      this.btnGreet.disabled = false;
      this.btnGreet.classList.add("ready");
      this.interactBar.classList.remove("hidden");
      this.nearbyType.textContent = nearestNpc.tierInfo.shortName;
      this.nearbyName.textContent = nearestNpc.name + (nearestNpc.friended ? " ♥" : "");

      if (boardedNpc && boardedNpc.id === nearestNpc.id) {
        this.interactHint.textContent = "按 Space 聊天互動 · 按 E 下船開自己的橘船";
      } else if (nearestNpc.tierInfo.canBeBoarded) {
        this.interactHint.textContent = "按 Space 交朋友 · 按 E 登船搭便車";
      } else {
        this.interactHint.textContent = "按 Space 交朋友（單人 SUP 無法共乘）";
      }
    } else {
      this.btnGreet.disabled = true;
      this.btnGreet.classList.remove("ready");
      this.interactBar.classList.add("hidden");
    }
  }

  // 顯示「行政區｜運河」與該運河的行道樹，回傳目前行政區
  updateLocationName(pos) {
    const { ix, iz } = blockIndexAt(pos.x, pos.z);
    const district = DISTRICT_GRID[iz][ix];

    let ew = WORLD_CONFIG.ewCanals[0];
    let minEw = Infinity;
    for (const c of WORLD_CONFIG.ewCanals) {
      const d = Math.abs(pos.z - c.z);
      if (d < minEw) {
        minEw = d;
        ew = c;
      }
    }

    let ns = WORLD_CONFIG.nsCanals[0];
    let minNs = Infinity;
    for (const c of WORLD_CONFIG.nsCanals) {
      const d = Math.abs(pos.x - c.x);
      if (d < minNs) {
        minNs = d;
        ns = c;
      }
    }

    let canalText;
    let trees;
    if (minEw < 9 && minNs < 9) {
      canalText = `${ew.name.replace("運河", "")} × ${ns.name.replace("運河", "")}`;
      trees = [...new Set([...ew.trees, ...ns.trees])];
    } else if (minEw < minNs) {
      canalText = ew.name;
      trees = ew.trees;
    } else {
      canalText = ns.name;
      trees = ns.trees;
    }

    const text = `${district}區｜${canalText}`;
    const treeText = `行道樹：${trees.map((k) => TREE_NAMES[k]).join("、")}`;
    if (text !== this._lastLocation || treeText !== this._lastTrees) {
      this._lastLocation = text;
      this._lastTrees = treeText;
      this.locationTag.textContent = text;
      const sub = document.createElement("span");
      sub.className = "location-trees";
      sub.textContent = treeText;
      this.locationTag.appendChild(sub);
    }
    return district;
  }

  updateFloatingLabels(dt, camera, playerWorldPos, npcs, nearestNpc) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const proj = new THREE.Vector3();

    // 玩家對話泡泡
    if (this.playerBubbleTimer > 0) {
      this.playerBubbleTimer = Math.max(0, this.playerBubbleTimer - dt);
      proj.copy(playerWorldPos);
      proj.y += 3.5;
      proj.project(camera);
      if (proj.z < 1) {
        this.playerBubbleEl.style.left = `${(proj.x * 0.5 + 0.5) * w}px`;
        this.playerBubbleEl.style.top = `${(-proj.y * 0.5 + 0.5) * h}px`;
      }
      if (this.playerBubbleTimer <= 0) {
        this.playerBubbleEl.classList.add("hidden");
      }
    }

    // NPC 名牌與對話泡泡
    for (const npc of npcs) {
      let dom = this.npcDomMap.get(npc.id);
      if (!dom) {
        const tag = document.createElement("div");
        tag.className = "npc-tag hidden";
        const bubble = document.createElement("div");
        bubble.className = "speech-bubble hidden";
        this.bubblesLayer.appendChild(tag);
        this.bubblesLayer.appendChild(bubble);
        dom = { tag, bubble };
        this.npcDomMap.set(npc.id, dom);
      }

      const dist = playerWorldPos.distanceTo(npc.boat.group.position);
      const showTag = dist < 34 || npc.friended || (nearestNpc && nearestNpc.id === npc.id);
      const showBubble = npc.bubbleTimer > 0 && dist < 55;

      if (!showTag && !showBubble) {
        dom.tag.classList.add("hidden");
        dom.bubble.classList.add("hidden");
        continue;
      }

      proj.copy(npc.boat.group.position);
      proj.y += npc.tier === 2 ? 5.6 : npc.tier === 1 ? 4.2 : 2.6;
      proj.project(camera);

      if (proj.z >= 1 || proj.x < -1.1 || proj.x > 1.1 || proj.y < -1.1 || proj.y > 1.1) {
        dom.tag.classList.add("hidden");
        dom.bubble.classList.add("hidden");
        continue;
      }

      const sx = (proj.x * 0.5 + 0.5) * w;
      const sy = (-proj.y * 0.5 + 0.5) * h;

      if (showBubble) {
        dom.bubble.textContent = npc.bubbleText;
        dom.bubble.style.left = `${sx}px`;
        dom.bubble.style.top = `${sy - 18}px`;
        dom.bubble.classList.remove("hidden");
        dom.tag.classList.add("hidden");
      } else {
        dom.bubble.classList.add("hidden");
        dom.tag.textContent = (npc.friended ? "♥ " : "") + npc.name;
        dom.tag.classList.toggle("friended", npc.friended);
        dom.tag.style.left = `${sx}px`;
        dom.tag.style.top = `${sy}px`;
        dom.tag.classList.remove("hidden");
      }
    }
  }

  // 載客狀態：船上人數與各目的地
  updatePassengerStatus(groups, count, capacity) {
    const countText = capacity === 0
      ? "🙋 升級帆船即可載客"
      : `🙋 乘客 ${count} / ${capacity}`;
    const destText = groups.map((g) => `→ ${g.dest.label}${g.count > 1 ? ` ×${g.count}` : ""}`).join("　");
    if (countText !== this._lastPCount) {
      this._lastPCount = countText;
      this.passengerCountEl.textContent = countText;
    }
    if (destText !== this._lastPDests) {
      this._lastPDests = destText;
      this.passengerDestsEl.textContent = destText;
    }
  }

  // 岸邊等船的乘客頭上顯示目的地
  updatePassengerLabels(camera, playerPos, waiting, canCarry) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const proj = new THREE.Vector3();
    const alive = new Set();

    for (const p of waiting) {
      alive.add(p.id);
      let el = this.passengerDomMap.get(p.id);
      if (!el) {
        el = document.createElement("div");
        el.className = "npc-tag passenger-tag hidden";
        this.bubblesLayer.appendChild(el);
        this.passengerDomMap.set(p.id, el);
      }

      const pos = p.model.position;
      const dist = Math.hypot(pos.x - playerPos.x, pos.z - playerPos.z);
      proj.set(pos.x, pos.y + 1.9, pos.z).project(camera);
      const offscreen = proj.z >= 1 || Math.abs(proj.x) > 1.05 || Math.abs(proj.y) > 1.05;
      if (dist > 70 || offscreen) {
        el.classList.add("hidden");
        continue;
      }

      const text = `想去${p.dest.label}`;
      if (el.textContent !== text) el.textContent = text;
      el.classList.toggle("locked", !canCarry);
      el.style.left = `${(proj.x * 0.5 + 0.5) * w}px`;
      el.style.top = `${(-proj.y * 0.5 + 0.5) * h}px`;
      el.classList.remove("hidden");
    }

    // 已上船或消失的乘客，移除標籤
    for (const [id, el] of this.passengerDomMap) {
      if (!alive.has(id)) {
        el.remove();
        this.passengerDomMap.delete(id);
      }
    }
  }

  // 送達知識卡：全部用 textContent／href 組裝，不用 innerHTML
  showKnowledgeCard(card, { collected, total, isNew }, license) {
    this.knowledgeEyebrowEl.textContent = `${isNew ? "新知識卡" : "知識卡"} ${collected} / ${total}`;
    this.knowledgeTitleEl.textContent = card.title;
    this.knowledgeBodyEl.textContent = card.body;

    this._renderSources(this.knowledgeSourcesEl, card, license);

    this.knowledgeEl.classList.remove("hidden");
    clearTimeout(this.knowledgeTimer);
    this.knowledgeTimer = setTimeout(() => this.hideKnowledgeCard(), 14000);
  }

  hideKnowledgeCard() {
    clearTimeout(this.knowledgeTimer);
    this.knowledgeEl.classList.add("hidden");
  }

  _renderSources(ul, card, license) {
    ul.replaceChildren();
    const addLink = (prefix, src) => {
      const li = document.createElement("li");
      li.append(prefix);
      const a = document.createElement("a");
      a.href = src.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = src.label;
      li.append(a);
      ul.append(li);
    };
    card.sources.forEach((src, i) => addLink(i === 0 ? "來源：" : "核對：", src));
    addLink("授權：", license);
  }

  // 知識卡收藏冊。collected 是 main.js 那份 Set，這裡只讀，清空交給 onClear。
  initCollection({ cards, license, collected, onClear }) {
    this.collection = { cards, license, collected, onClear };
    this.updateCollectionCount();
  }

  updateCollectionCount() {
    const { cards, collected } = this.collection;
    this.collectionCountEl.textContent = `${collected.size} / ${Object.keys(cards).length}`;
  }

  openCollection() {
    if (!this.collection) return;
    this.hideKnowledgeCard();
    this._showCollectionGrid();
    this.collectionEl.classList.remove("hidden");
    document.getElementById("collection-close").focus();
  }

  closeCollection() {
    this.collectionEl.classList.add("hidden");
    this._disarmClear();
    // 焦點不還給 HUD 按鈕：Enter 是登船鍵，留在按鈕上會被當成再點一次
    document.activeElement?.blur();
  }

  _showCollectionGrid() {
    const { cards, collected } = this.collection;
    const keys = Object.keys(cards);
    this.collectionProgressEl.textContent = `已收集 ${collected.size} / ${keys.length} 張，送乘客到目的地就會解鎖。`;

    this.collectionGridEl.replaceChildren();
    for (const key of keys) {
      const card = cards[key];
      const tile = document.createElement("button");
      tile.type = "button";
      tile.className = "collection-tile";
      const title = document.createElement("span");
      title.className = "collection-tile-title";
      const hint = document.createElement("span");
      hint.className = "collection-tile-hint";
      if (collected.has(key)) {
        title.textContent = card.title;
        // 地標卡的卡名就是地名，不重複寫
        const label = destLabel(key, card);
        hint.textContent = label === card.title ? "地標" : label;
        tile.addEventListener("click", () => this._showCollectionDetail(key));
      } else {
        tile.classList.add("locked");
        tile.disabled = true;
        title.textContent = "？？？";
        const name = document.createElement("span");
        name.className = "nowrap";
        name.textContent = `「${destLabel(key, card)}」`;
        hint.append("把乘客送到", name, "解鎖");
      }
      tile.append(title, hint);
      this.collectionGridEl.append(tile);
    }

    this.collectionClearBtn.disabled = collected.size === 0;
    this.collectionGridEl.classList.remove("hidden");
    this.collectionProgressEl.classList.remove("hidden");
    this.collectionFooterEl.classList.remove("hidden");
    this.collectionDetailEl.classList.add("hidden");
  }

  _showCollectionDetail(key) {
    const { cards, license } = this.collection;
    const card = cards[key];
    document.getElementById("collection-detail-title").textContent = card.title;
    document.getElementById("collection-detail-body").textContent = card.body;
    this._renderSources(document.getElementById("collection-detail-sources"), card, license);
    this._disarmClear();
    this.collectionGridEl.classList.add("hidden");
    this.collectionProgressEl.classList.add("hidden");
    this.collectionFooterEl.classList.add("hidden");
    this.collectionDetailEl.classList.remove("hidden");
    document.getElementById("collection-back").focus();
  }

  // 清空要按兩次，避免誤觸；離開收藏冊或切到單張卡時重設
  _onClearClick() {
    if (!this.collectionClearArmed) {
      this.collectionClearArmed = true;
      this.collectionClearBtn.textContent = "確定清空？再按一次";
      this.collectionClearBtn.classList.add("armed");
      return;
    }
    this._disarmClear();
    this.collection.onClear();
    this.updateCollectionCount();
    this._showCollectionGrid();
  }

  _disarmClear() {
    this.collectionClearArmed = false;
    this.collectionClearBtn.textContent = "清空收藏";
    this.collectionClearBtn.classList.remove("armed");
  }

  // 小地圖：以玩家為中心顯示附近約 4 x 4 個街廓，並標出行政區名
  drawMinimap(playerPos, npcs, isNight, { waiting = [], destBlocks = [] } = {}) {
    const ctx = this.minimapCtx;
    const size = this.minimapCanvas.width;
    const view = 210; // 小地圖涵蓋的世界寬度
    const half = view / 2;
    const limit = WORLD_CONFIG.halfExtent + 4 - half;
    const cx = THREE.MathUtils.clamp(playerPos.x, -limit, limit);
    const cz = THREE.MathUtils.clamp(playerPos.z, -limit, limit);
    const scale = size / view;
    const toX = (x) => (x - cx + half) * scale;
    const toY = (z) => (z - cz + half) * scale;
    const k = size / 144; // 畫布解析度放大後，字與點跟著放大

    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = isNight ? "#16304c" : "#5cb9c7";
    ctx.fillRect(0, 0, size, size);

    if (!this._districtCentroids) this._computeDistrictCentroids();

    // 街廓（依行政區上色，公園為綠色）
    const bSize = WORLD_CONFIG.blockHalfSize * 2 * scale;
    for (const b of this.blocks || []) {
      if (Math.abs(b.x - cx) > half + 20 || Math.abs(b.z - cz) > half + 20) continue;
      if (b.isPark) {
        ctx.fillStyle = isNight ? "#33594a" : "#96bfa6";
      } else {
        ctx.fillStyle = isNight ? "#34425e" : DISTRICTS[b.district].map;
      }
      ctx.fillRect(toX(b.x) - bSize / 2, toY(b.z) - bSize / 2, bSize, bSize);
    }

    // 船上乘客的目的地：橘色外框
    if (destBlocks.length) {
      ctx.lineWidth = 2.5 * k;
      ctx.strokeStyle = "#f26b3a";
      for (const b of destBlocks) {
        if (Math.abs(b.x - cx) > half + 20 || Math.abs(b.z - cz) > half + 20) continue;
        ctx.strokeRect(toX(b.x) - bSize / 2, toY(b.z) - bSize / 2, bSize, bSize);
      }
    }

    // 101 標記
    if (Math.abs(100 - cx) < half && Math.abs(50 - cz) < half) {
      ctx.fillStyle = isNight ? "#fff" : "#3f5a6b";
      ctx.font = `bold ${Math.round(10 * k)}px sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText("101", toX(101.5), toY(51.5) + 3 * k);
    }

    // 行政區名
    ctx.font = `bold ${Math.round(13 * k)}px 'Noto Sans TC', sans-serif`;
    ctx.textAlign = "center";
    ctx.lineWidth = 3 * k;
    ctx.strokeStyle = isNight ? "rgba(10,20,40,0.85)" : "rgba(255,255,255,0.9)";
    ctx.fillStyle = isNight ? "#f3e9da" : "#4a3f39";
    for (const [name, [dx, dz]] of this._districtCentroids) {
      if (Math.abs(dx - cx) > half || Math.abs(dz - cz) > half) continue;
      ctx.strokeText(name, toX(dx), toY(dz) + 4 * k);
      ctx.fillText(name, toX(dx), toY(dz) + 4 * k);
    }

    // 岸邊等船的乘客：小橘方塊
    ctx.fillStyle = "#f5a65b";
    for (const p of waiting) {
      const pos = p.model.position;
      if (Math.abs(pos.x - cx) > half || Math.abs(pos.z - cz) > half) continue;
      ctx.fillRect(toX(pos.x) - 2.5 * k, toY(pos.z) - 2.5 * k, 5 * k, 5 * k);
    }

    // NPC 點
    for (const npc of npcs) {
      const p = npc.boat.group.position;
      if (Math.abs(p.x - cx) > half || Math.abs(p.z - cz) > half) continue;
      ctx.beginPath();
      ctx.arc(toX(p.x), toY(p.z), (npc.tier === 2 ? 3.5 : 2.6) * k, 0, Math.PI * 2);
      ctx.fillStyle = npc.friended ? "#ffd166" : "#ffffff";
      ctx.fill();
    }

    // 玩家橘點
    ctx.beginPath();
    ctx.arc(toX(playerPos.x), toY(playerPos.z), 4.8 * k, 0, Math.PI * 2);
    ctx.fillStyle = "#f26b3a";
    ctx.fill();
    ctx.lineWidth = 2 * k;
    ctx.strokeStyle = "#fff";
    ctx.stroke();
  }

  setBlocks(blocks) {
    this.blocks = blocks;
    this._districtCentroids = null;
  }

  _computeDistrictCentroids() {
    const acc = new Map();
    for (const b of this.blocks || []) {
      const a = acc.get(b.district) || [0, 0, 0];
      a[0] += b.x;
      a[1] += b.z;
      a[2] += 1;
      acc.set(b.district, a);
    }
    this._districtCentroids = new Map(
      [...acc].map(([name, [sx, sz, n]]) => [name, [sx / n, sz / n]])
    );
  }
}

// 收藏冊上顯示的目的地名稱，與乘客頭上的字一致（同 passengers.js 的 label）
function destLabel(key, card) {
  if (key.startsWith("district:")) return `${key.slice("district:".length)}區`;
  const lm = Object.values(LANDMARKS).find((l) => `landmark:${l.key}` === key);
  return lm ? lm.name : card.title;
}
