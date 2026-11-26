import * as THREE from "three";
import { WORLD_CONFIG, BOAT_TIERS } from "./config.js";

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

  updateLocationName(pos) {
    // 找出目前最接近的東西向與南北向運河
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

    if (minEw < 9 && minNs < 9) {
      this.locationTag.textContent = `${ew.name.replace("運河", "")} × ${ns.name.replace("運河", "")}`;
    } else if (minEw < minNs) {
      this.locationTag.textContent = ew.name;
    } else {
      this.locationTag.textContent = ns.name;
    }
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

  drawMinimap(playerPos, npcs, isNight) {
    const ctx = this.minimapCtx;
    const size = this.minimapCanvas.width;
    const pad = 10;
    const span = WORLD_CONFIG.halfExtent * 2;
    const toMap = (v) => pad + ((v + WORLD_CONFIG.halfExtent) / span) * (size - pad * 2);

    ctx.clearRect(0, 0, size, size);

    // 水底背景
    ctx.fillStyle = isNight ? "#16304c" : "#5cb9c7";
    ctx.fillRect(0, 0, size, size);

    // 九大建築街廓
    const bSize = ((WORLD_CONFIG.blockHalfSize * 2) / span) * (size - pad * 2);
    WORLD_CONFIG.blockCenters.forEach((bx, ix) => {
      WORLD_CONFIG.blockCenters.forEach((bz, iz) => {
        const mx = toMap(bx) - bSize / 2;
        const my = toMap(bz) - bSize / 2;
        if (ix === 1 && iz === 1) {
          ctx.fillStyle = isNight ? "#33594a" : "#96bfa6"; // 大安公園
        } else if (ix === 2 && iz === 2) {
          ctx.fillStyle = isNight ? "#4f7a80" : "#8cc2bf"; // 台北 101 區
        } else {
          ctx.fillStyle = isNight ? "#34425e" : "#f2e7da";
        }
        ctx.fillRect(mx, my, bSize, bSize);
      });
    });

    // 101 標記
    ctx.fillStyle = "#fff";
    ctx.font = "bold 9px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("101", toMap(50), toMap(50) + 3);

    // NPC 點
    for (const npc of npcs) {
      const nx = toMap(npc.boat.group.position.x);
      const ny = toMap(npc.boat.group.position.z);
      ctx.beginPath();
      ctx.arc(nx, ny, npc.tier === 2 ? 3.5 : 2.6, 0, Math.PI * 2);
      ctx.fillStyle = npc.friended ? "#ffd166" : "#ffffff";
      ctx.fill();
    }

    // 玩家橘點
    const px = toMap(playerPos.x);
    const py = toMap(playerPos.z);
    ctx.beginPath();
    ctx.arc(px, py, 4.8, 0, Math.PI * 2);
    ctx.fillStyle = "#f26b3a";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#fff";
    ctx.stroke();
  }
}
