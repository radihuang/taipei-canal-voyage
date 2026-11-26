import * as THREE from "three";
import { DISTRICTS, LANDMARKS, PASSENGER_CONFIG, WORLD_CONFIG } from "./config.js";
import { createMinimalCharacter } from "./boats.js";

const CLOAKS = [0xfdf5e6, 0xeac2bd, 0x99b8a9, 0x8fa3ba, 0xe9d8c5, 0xb9a3d6, 0xf2b857];
const HATS = [0x4ca6b5, 0xe38b9c, 0x7cb092, 0x8994c7, 0xe07a5f, 0x374151, 0xf5a65b];

const EDGE = WORLD_CONFIG.blockHalfSize - 0.7; // 站在街廓岸邊，靠近水
const SPOTS = [-10, -6, -2, 2, 6, 10]; // 錯開行道樹（每 4 單位一棵，從 -12 開始）

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 建立所有可去的目的地：12 個行政區 + 3 個地標
function buildDestinations(blocks) {
  const list = [];
  Object.keys(DISTRICTS).forEach((name) => {
    list.push({
      key: `district:${name}`,
      label: `${name}區`,
      blocks: blocks.filter((b) => b.district === name)
    });
  });
  Object.entries(LANDMARKS).forEach(([pos, lm]) => {
    const [ix, iz] = pos.split(",").map(Number);
    list.push({
      key: `landmark:${lm.key}`,
      label: lm.name,
      blocks: blocks.filter((b) => b.ix === ix && b.iz === iz),
      isLandmark: true
    });
  });
  return list;
}

// 舉手招呼的乘客小人：在極簡小人身上加一隻會揮的手
function createWaver() {
  const fig = createMinimalCharacter({
    cloakColor: pick(CLOAKS),
    hatColor: pick(HATS),
    scale: 0.85
  });
  const armPivot = new THREE.Group();
  armPivot.position.set(0.2, 0.78, 0);
  const arm = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 0.55, 5),
    new THREE.MeshStandardMaterial({ color: 0x374151, roughness: 0.6, flatShading: true })
  );
  arm.position.y = 0.27;
  armPivot.add(arm);
  armPivot.rotation.z = -0.4;
  fig.add(armPivot);
  fig.userData.armPivot = armPivot;
  return fig;
}

export class PassengerManager {
  constructor(scene, blocks, groundY) {
    this.scene = scene;
    this.blocks = blocks;
    this.groundY = groundY;
    this.destinations = buildDestinations(blocks);
    this.waiting = [];
    this.onboard = [];
    this.boat = null;
    this.capacity = 0;
    this.respawnTimer = 0;
    this._nextId = 1;
    this._hintCooldown = 0;

    for (let i = 0; i < PASSENGER_CONFIG.waitingCount; i++) this._spawnWaiting();
  }

  _spawnWaiting() {
    // 挑一個目前沒有人在等的街廓
    const used = new Set(this.waiting.map((w) => w.block));
    const free = this.blocks.filter((b) => !used.has(b));
    const block = pick(free.length ? free : this.blocks);

    const candidates = this.destinations.filter(
      (d) => !d.blocks.includes(block) && !(d.key === `district:${block.district}`)
    );
    // 地標比較熱門，權重加倍
    const weighted = candidates.flatMap((d) => (d.isLandmark ? [d, d] : [d]));
    const dest = pick(weighted);

    const side = Math.floor(Math.random() * 4);
    const t = pick(SPOTS);
    const local = [
      [t, -EDGE, 0],
      [t, EDGE, Math.PI],
      [-EDGE, t, Math.PI / 2],
      [EDGE, t, -Math.PI / 2]
    ][side];

    const fig = createWaver();
    fig.position.set(block.x + local[0], this.groundY, block.z + local[1]);
    fig.rotation.y = local[2]; // 面朝運河
    this.scene.add(fig);

    this.waiting.push({
      id: this._nextId++,
      block,
      dest,
      model: fig,
      phase: Math.random() * Math.PI * 2
    });
  }

  // 換船時把乘客搬到新船的甲板上
  attachToBoat(boatObj, tierInfo) {
    this.boat = boatObj;
    this.capacity = Math.max(0, tierInfo.capacity - 1);
    this.onboard.forEach((p, i) => {
      boatObj.group.add(p.model);
      const slot = boatObj.cargoSlots[i];
      if (slot) p.model.position.copy(slot);
    });
  }

  canFit(tierInfo) {
    return this.onboard.length <= Math.max(0, tierInfo.capacity - 1);
  }

  _distanceToDest(pos, dest) {
    let best = Infinity;
    for (const b of dest.blocks) {
      const d = Math.max(Math.abs(pos.x - b.x), Math.abs(pos.z - b.z));
      if (d < best) best = d;
    }
    return best;
  }

  // 回傳本幀發生的事件：pickup / deliver / needBigger / full
  update(dt, elapsed, playerPos, { canInteract }) {
    const events = [];
    this._hintCooldown = Math.max(0, this._hintCooldown - dt);

    // 岸邊乘客揮手
    for (const w of this.waiting) {
      const arm = w.model.userData.armPivot;
      arm.rotation.z = -0.35 - Math.abs(Math.sin(elapsed * 4 + w.phase)) * 0.6;
      w.model.position.y = this.groundY + Math.abs(Math.sin(elapsed * 2 + w.phase)) * 0.05;
    }

    // 船上乘客輕輕晃
    this.onboard.forEach((p, i) => {
      const slot = this.boat?.cargoSlots[i];
      if (slot) p.model.position.y = slot.y + Math.abs(Math.sin(elapsed * 3 + p.phase)) * 0.04;
    });

    if (canInteract) {
      // 接人
      for (let i = this.waiting.length - 1; i >= 0; i--) {
        const w = this.waiting[i];
        const d = Math.hypot(w.model.position.x - playerPos.x, w.model.position.z - playerPos.z);
        if (d > PASSENGER_CONFIG.pickupRange) continue;

        if (this.capacity === 0) {
          if (this._hintCooldown === 0) {
            events.push({ type: "needBigger", passenger: w });
            this._hintCooldown = 6;
          }
          continue;
        }
        if (this.onboard.length >= this.capacity) {
          if (this._hintCooldown === 0) {
            events.push({ type: "full", passenger: w });
            this._hintCooldown = 6;
          }
          continue;
        }

        this.waiting.splice(i, 1);
        const slot = this.boat.cargoSlots[this.onboard.length];
        w.model.userData.armPivot.rotation.z = -0.2;
        w.model.rotation.y = 0;
        w.model.scale.setScalar(0.75);
        this.boat.group.add(w.model);
        w.model.position.copy(slot);
        const fromBlock = w.block;
        this.onboard.push({ ...w, fromBlock });
        events.push({ type: "pickup", passenger: w });
        this.respawnTimer = Math.max(this.respawnTimer, 4);
      }

      // 送達
      for (let i = this.onboard.length - 1; i >= 0; i--) {
        const p = this.onboard[i];
        if (this._distanceToDest(playerPos, p.dest) > PASSENGER_CONFIG.dropRange) continue;

        this.onboard.splice(i, 1);
        this.boat.group.remove(p.model);
        // 依起訖距離給分：越遠越多（以街廓數計）
        const blocksAway = Math.round(
          Math.min(...p.dest.blocks.map((b) => Math.abs(b.ix - p.fromBlock.ix) + Math.abs(b.iz - p.fromBlock.iz)))
        );
        const points = Math.min(20, 6 + blocksAway * 2);
        events.push({ type: "deliver", passenger: p, points });
      }
      // 送達後把剩下的乘客往前補位
      this.onboard.forEach((p, i) => {
        const slot = this.boat.cargoSlots[i];
        if (slot) p.model.position.copy(slot);
      });
    }

    // 補充岸邊乘客
    if (this.waiting.length < PASSENGER_CONFIG.waitingCount) {
      this.respawnTimer -= dt;
      if (this.respawnTimer <= 0) {
        this._spawnWaiting();
        this.respawnTimer = 2;
      }
    }

    return events;
  }

  // 船上乘客的目的地，依目的地分組（給 HUD 與小地圖用）
  onboardSummary() {
    const groups = new Map();
    for (const p of this.onboard) {
      const g = groups.get(p.dest.key) || { dest: p.dest, count: 0 };
      g.count++;
      groups.set(p.dest.key, g);
    }
    return [...groups.values()];
  }
}
