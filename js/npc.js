import * as THREE from "three";
import { WORLD_CONFIG, BOAT_TIERS, NPC_ROSTER } from "./config.js";
import { createBoatMesh } from "./boats.js";

const NPC_ACCENTS = [0x4ca6b5, 0xe38b9c, 0x7cb092, 0xf2b857, 0x8994c7, 0xe07a5f];

// 取得運河交叉口節點座標
const GRID = WORLD_CONFIG.canalLines; // [-75, -25, 25, 75]

function getAdjacentIntersections(gx, gz) {
  const res = [];
  if (gx > 0) res.push({ gx: gx - 1, gz });
  if (gx < GRID.length - 1) res.push({ gx: gx + 1, gz });
  if (gz > 0) res.push({ gx, gz: gz - 1 });
  if (gz < GRID.length - 1) res.push({ gx, gz: gz + 1 });
  return res;
}

export class NPCManager {
  constructor(scene) {
    this.scene = scene;
    this.npcs = [];
    this._spawnAll();
  }

  _spawnAll() {
    NPC_ROSTER.forEach((profile, idx) => {
      // 分散在整張地圖的運河交叉口
      const gx = (idx * 3 + 1) % GRID.length;
      const gz = (idx * 5 + 2 + Math.floor(idx / GRID.length)) % GRID.length;
      const neighbors = getAdjacentIntersections(gx, gz);
      const target = neighbors[idx % neighbors.length];

      const accent = NPC_ACCENTS[idx % NPC_ACCENTS.length];
      const boatObj = createBoatMesh(profile.tier, {
        isPlayer: false,
        accentColor: accent
      });

      const startX = GRID[gx];
      const startZ = GRID[gz];
      const endX = GRID[target.gx];
      const endZ = GRID[target.gz];

      // 稍微靠右航行，雙向交會更優雅
      const dx = endX - startX;
      const dz = endZ - startZ;
      const len = Math.hypot(dx, dz) || 1;
      const laneOffset = 2.8;
      const ox = (-dz / len) * laneOffset;
      const oz = (dx / len) * laneOffset;

      const tInit = 0.25 + (idx % 3) * 0.22;
      boatObj.group.position.set(
        THREE.MathUtils.lerp(startX, endX, tInit) + ox,
        0,
        THREE.MathUtils.lerp(startZ, endZ, tInit) + oz
      );
      const initYaw = Math.atan2(dx, dz);
      boatObj.group.rotation.y = initYaw;

      this.scene.add(boatObj.group);

      // 靠近時的柔光互動水環
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(2.6 + profile.tier * 1.1, 3.0 + profile.tier * 1.1, 32),
        new THREE.MeshBasicMaterial({
          color: 0xffd27d,
          transparent: true,
          opacity: 0,
          side: THREE.DoubleSide
        })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.14;
      boatObj.group.add(ring);

      this.npcs.push({
        id: idx,
        name: profile.name,
        tier: profile.tier,
        tierInfo: BOAT_TIERS[profile.tier],
        greetings: profile.greetings,
        reGreet: profile.reGreet,
        boat: boatObj,
        highlightRing: ring,
        fromNode: { gx, gz },
        toNode: target,
        speed: 4.8 + (idx % 3) * 0.75 + profile.tier * 0.4,
        yaw: initYaw,
        friended: false,
        bubbleText: "",
        bubbleTimer: 0,
        phaseOffset: idx * 1.3
      });
    });
  }

  setNightGlow(intensity) {
    for (const npc of this.npcs) {
      npc.boat.lanternLights.forEach((mat) => {
        mat.emissiveIntensity = intensity;
      });
    }
  }

  update(dt, elapsed, nearestNpcId) {
    const laneOffset = 2.8;

    for (const npc of this.npcs) {
      const fromX = GRID[npc.fromNode.gx];
      const fromZ = GRID[npc.fromNode.gz];
      const toX = GRID[npc.toNode.gx];
      const toZ = GRID[npc.toNode.gz];

      const segDx = toX - fromX;
      const segDz = toZ - fromZ;
      const segLen = Math.hypot(segDx, segDz) || 1;

      // 靠右車道目標點
      const ox = (-segDz / segLen) * laneOffset;
      const oz = (segDx / segLen) * laneOffset;
      const targetX = toX + ox;
      const targetZ = toZ + oz;

      const pos = npc.boat.group.position;
      const dx = targetX - pos.x;
      const dz = targetZ - pos.z;
      const dist = Math.hypot(dx, dz);

      if (dist < 2.2) {
        // 抵達交叉口，選擇下一段運河（盡量避免立刻原地折返）
        const options = getAdjacentIntersections(npc.toNode.gx, npc.toNode.gz);
        const nonReverse = options.filter(
          (o) => !(o.gx === npc.fromNode.gx && o.gz === npc.fromNode.gz)
        );
        const pool = nonReverse.length > 0 ? nonReverse : options;
        const next = pool[Math.floor(Math.random() * pool.length)];
        npc.fromNode = npc.toNode;
        npc.toNode = next;
      } else {
        const desiredYaw = Math.atan2(dx, dz);
        let diff = desiredYaw - npc.yaw;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        npc.yaw += diff * Math.min(1, dt * 3.8);

        pos.x += Math.sin(npc.yaw) * npc.speed * dt;
        pos.z += Math.cos(npc.yaw) * npc.speed * dt;
      }

      // 輕盈浮動與船身搖擺
      const bob = Math.sin(elapsed * 2.1 + npc.phaseOffset) * 0.09;
      pos.y = bob;
      npc.boat.group.rotation.y = npc.yaw;
      npc.boat.group.rotation.z = Math.sin(elapsed * 1.6 + npc.phaseOffset) * 0.035;

      // 船槳、船帆、旗幟動態
      const anim = npc.boat.animatedParts;
      if (anim.paddle) {
        anim.paddle.rotation.x = Math.sin(elapsed * 4.0 + npc.phaseOffset) * 0.55;
      }
      anim.sails.forEach((s, si) => {
        s.rotation.z = Math.sin(elapsed * 1.8 + npc.phaseOffset + si) * 0.04;
      });
      if (anim.flag) {
        anim.flag.rotation.y = Math.sin(elapsed * 5.2 + npc.phaseOffset) * 0.22;
      }

      // 尾波脈動
      const pulse = 0.85 + Math.sin(elapsed * 3.2 + npc.phaseOffset) * 0.2;
      npc.boat.wakeRing.scale.setScalar(pulse);

      // 靠近提示光環
      const isTarget = npc.id === nearestNpcId;
      npc.highlightRing.material.opacity = THREE.MathUtils.lerp(
        npc.highlightRing.material.opacity,
        isTarget ? 0.65 : 0,
        dt * 8
      );
      if (isTarget) {
        npc.highlightRing.scale.setScalar(1 + Math.sin(elapsed * 4) * 0.05);
      }

      if (npc.bubbleTimer > 0) {
        npc.bubbleTimer = Math.max(0, npc.bubbleTimer - dt);
      }
    }
  }

  findNearest(worldPos, maxDist = 11.5) {
    let best = null;
    let bestDist = maxDist;
    for (const npc of this.npcs) {
      const d = worldPos.distanceTo(npc.boat.group.position);
      if (d < bestDist) {
        bestDist = d;
        best = npc;
      }
    }
    return best;
  }
}
