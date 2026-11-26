import * as THREE from "three";
import { WORLD_CONFIG, BOAT_TIERS, TIME_PRESETS } from "./config.js";
import { buildTaipeiCity } from "./city.js";
import { createBoatMesh, createMinimalCharacter } from "./boats.js";
import { NPCManager } from "./npc.js";
import { InputController } from "./controls.js";
import { GameUI } from "./ui.js";
import { PedestrianManager } from "./pedestrians.js";
import { updateSeeThrough } from "./seeThrough.js";
import { PassengerManager } from "./passengers.js";

// ===== 1. 建立 Three.js 場景、紀念碑谷低視角攝影機與渲染器 =====
const container = document.getElementById("canvas-container");
const scene = new THREE.Scene();
scene.background = new THREE.Color(TIME_PRESETS.noon.sky);
scene.fog = new THREE.FogExp2(TIME_PRESETS.noon.fog, TIME_PRESETS.noon.fogDensity);

// 較窄的 FOV (30°) 搭配斜上 45° 俯角，營造紀念碑谷優雅微縮建築感
const camera = new THREE.PerspectiveCamera(
  30,
  window.innerWidth / window.innerHeight,
  1,
  450
);
let zoomFactor = 1.0;
const BASE_CAM_OFFSET = new THREE.Vector3(36, 40, 36);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
container.appendChild(renderer.domElement);

// ===== 2. 光源（支援四時段平滑過渡） =====
const hemiLight = new THREE.HemisphereLight(
  TIME_PRESETS.noon.hemiSky,
  TIME_PRESETS.noon.hemiGround,
  TIME_PRESETS.noon.hemiIntensity
);
scene.add(hemiLight);

const sunLight = new THREE.DirectionalLight(
  TIME_PRESETS.noon.sunColor,
  TIME_PRESETS.noon.sunIntensity
);
sunLight.position.set(...TIME_PRESETS.noon.sunPos);
sunLight.castShadow = true;
sunLight.shadow.mapSize.set(2048, 2048);
sunLight.shadow.camera.near = 10;
sunLight.shadow.camera.far = 260;
const dShadow = 92;
sunLight.shadow.camera.left = -dShadow;
sunLight.shadow.camera.right = dShadow;
sunLight.shadow.camera.top = dShadow;
sunLight.shadow.camera.bottom = -dShadow;
sunLight.shadow.bias = -0.0006;
scene.add(sunLight);
scene.add(sunLight.target); // 陰影範圍跟著玩家移動，大地圖上任何地方都有影子

// 玩家船隻周邊微暖補光（夜晚划船時特別有氛圍）
const playerGlowLight = new THREE.PointLight(0xffb56b, 0, 22, 1.5);
scene.add(playerGlowLight);

// ===== 3. 建置台北運河世界與 NPC =====
const city = buildTaipeiCity(scene);
const npcManager = new NPCManager(scene);
const pedestrians = new PedestrianManager(scene, city.blocks, city.blockTop);

// ===== 4. 玩家狀態與橘船建立 =====
const state = {
  score: 0,
  friendsCount: 0,
  currentTier: 0,
  maxUnlockedTier: 0,
  timeKey: "noon",
  pos: new THREE.Vector3(-25, 0, 40), // 出生在大安森林公園西側運河（鏡頭方向是公園，不會被高樓擋住）
  vel: new THREE.Vector3(),
  yaw: 0,
  boardedNpc: null,
  stowAnimScale: 1,
  passengerBonusTimer: 0,
  district: null
};

let playerBoat = createBoatMesh(0, { isPlayer: true });
playerBoat.group.position.copy(state.pos);
scene.add(playerBoat.group);

// 岸邊等船的乘客與船上乘客
const passengers = new PassengerManager(scene, city.blocks, city.blockTop);
passengers.attachToBoat(playerBoat, BOAT_TIERS[0]);

// 玩家登船後站在對方甲板上的分身小人
const passengerAvatar = createMinimalCharacter({
  cloakColor: 0xfdf5e6,
  hatColor: 0xf26b3a,
  scale: 0.94
});
passengerAvatar.visible = false;
scene.add(passengerAvatar);

// 交友愛心／星光粒子系統
const PARTICLE_GEO = new THREE.OctahedronGeometry(0.24, 0);
const particles = [];
function spawnCelebration(origin, color = 0xf26b3a, count = 14) {
  for (let i = 0; i < count; i++) {
    const mat = new THREE.MeshBasicMaterial({
      color: i % 2 === 0 ? color : 0xffe08a,
      transparent: true,
      opacity: 1
    });
    const m = new THREE.Mesh(PARTICLE_GEO, mat);
    m.position.copy(origin);
    m.position.y += 1.6;
    const ang = (i / count) * Math.PI * 2 + Math.random() * 0.4;
    const spd = 2.5 + Math.random() * 3.5;
    scene.add(m);
    particles.push({
      mesh: m,
      vx: Math.cos(ang) * spd,
      vy: 4.5 + Math.random() * 3.5,
      vz: Math.sin(ang) * spd,
      life: 1.0
    });
  }
}

function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.life -= dt * 0.95;
    p.mesh.position.x += p.vx * dt;
    p.mesh.position.y += p.vy * dt;
    p.mesh.position.z += p.vz * dt;
    p.vy -= 7.5 * dt;
    p.mesh.rotation.y += dt * 5;
    p.mesh.material.opacity = Math.max(0, p.life);
    p.mesh.scale.setScalar(Math.max(0.01, p.life));
    if (p.life <= 0) {
      scene.remove(p.mesh);
      p.mesh.material.dispose();
      particles.splice(i, 1);
    }
  }
}

// ===== 5. 切換自己的橘色船隻尺寸 =====
function switchPlayerBoat(newTier, { announce = false } = {}) {
  if (newTier > state.maxUnlockedTier) {
    const needed = BOAT_TIERS[newTier].unlockScore;
    ui.showToast(`累積 ${needed} 分即可解鎖「${BOAT_TIERS[newTier].name}」！`, { soft: true });
    return;
  }

  if (!passengers.canFit(BOAT_TIERS[newTier])) {
    ui.showToast(`船上有 ${passengers.onboard.length} 位乘客，「${BOAT_TIERS[newTier].name}」坐不下，先送他們到目的地吧！`, { soft: true });
    return;
  }

  state.currentTier = newTier;
  scene.remove(playerBoat.group);
  playerBoat = createBoatMesh(newTier, { isPlayer: true });
  playerBoat.group.position.copy(state.pos);
  playerBoat.group.rotation.y = state.yaw;
  playerBoat.group.visible = !state.boardedNpc;
  scene.add(playerBoat.group);
  passengers.attachToBoat(playerBoat, BOAT_TIERS[newTier]);

  spawnCelebration(state.pos, 0xf26b3a, 18);
  if (announce) {
    ui.showToast(`🎉 解鎖並升級為【${BOAT_TIERS[newTier].name}】！`);
  } else {
    ui.showToast(`已切換為 ${BOAT_TIERS[newTier].name}`, { soft: true });
  }
  ui.updateStats(state);
}

function addScore(points) {
  state.score += points;

  // 檢查是否達成新船升級門檻
  let upgradedTier = null;
  for (const t of BOAT_TIERS) {
    if (t.id > state.maxUnlockedTier && state.score >= t.unlockScore) {
      state.maxUnlockedTier = t.id;
      upgradedTier = t.id;
    }
  }

  ui.updateStats(state);

  if (upgradedTier !== null) {
    if (state.boardedNpc) {
      ui.showToast(`🎉 已解鎖【${BOAT_TIERS[upgradedTier].name}】！下船後即可駕駛！`);
    } else {
      switchPlayerBoat(upgradedTier, { announce: true });
    }
  }
}

// ===== 6. 交朋友與登船／下船邏輯 =====
let currentNearestNpc = null;

function handleGreet() {
  const target = currentNearestNpc;
  if (!target) return;

  if (!target.friended) {
    target.friended = true;
    state.friendsCount += 1;
    const bonus = target.tier === 2 ? 15 : 10;
    const line = target.greetings[Math.floor(Math.random() * target.greetings.length)];
    target.bubbleText = line;
    target.bubbleTimer = 4.2;

    ui.showPlayerBubble("嗨～很高興在台北運河認識你！👋");
    spawnCelebration(target.boat.group.position, 0xff7b54, 16);
    ui.showToast(`與「${target.name}」成為船友！+${bonus} 分`);
    addScore(bonus);
  } else {
    const line = target.reGreet[Math.floor(Math.random() * target.reGreet.length)];
    target.bubbleText = line;
    target.bubbleTimer = 3.5;
    ui.showPlayerBubble("哈囉老朋友！一起享受河風 ✨");
    spawnCelebration(target.boat.group.position, 0xffd166, 8);
    addScore(2);
  }
}

function handleBoardToggle() {
  // 若正在別人的船上 -> 下船並喚回自己的橘船
  if (state.boardedNpc) {
    const host = state.boardedNpc;
    const hostPos = host.boat.group.position;
    const sideOffset = new THREE.Vector3(Math.cos(host.yaw), 0, -Math.sin(host.yaw)).multiplyScalar(3.6);

    state.pos.copy(hostPos).add(sideOffset);
    resolveCityCollision(state.pos, BOAT_TIERS[state.currentTier].radius);
    state.yaw = host.yaw;
    state.vel.set(0, 0, 0);

    // 恢復玩家橘船顯示
    state.boardedNpc = null;
    passengerAvatar.visible = false;
    playerBoat.group.visible = true;
    playerBoat.group.position.copy(state.pos);
    playerBoat.group.scale.setScalar(0.15);
    state.stowAnimScale = 0.15;

    spawnCelebration(state.pos, 0x4db3c4, 12);
    ui.showToast("已重新放下你的橘船，自由啟航！", { soft: true });
    ui.showPlayerBubble("謝謝載我一程～掰掰！");
    return;
  }

  // 否則嘗試登上附近船友的帆船或海盜船
  if (!currentNearestNpc) return;
  if (passengers.onboard.length > 0) {
    ui.showToast("船上還有乘客，先送他們到目的地再去搭便車吧！", { soft: true });
    return;
  }
  if (!currentNearestNpc.tierInfo.canBeBoarded) {
    ui.showToast("這艘單人 SUP 站不下兩個人喔，找帆船或海盜船搭便車吧！", { soft: true });
    return;
  }

  state.boardedNpc = currentNearestNpc;
  state.passengerBonusTimer = 0;

  // 暫時收起自己的橘船
  playerBoat.group.visible = false;
  passengerAvatar.visible = true;

  currentNearestNpc.bubbleText = "歡迎上船！坐好一起欣賞台北運河 ⛵";
  currentNearestNpc.bubbleTimer = 3.8;
  spawnCelebration(currentNearestNpc.boat.group.position, 0x56c5d0, 14);
  ui.showToast(`已收起橘船，登上「${currentNearestNpc.name}」的${currentNearestNpc.tierInfo.shortName}！`);

  // 若還沒認識，登船時自動結為好友
  if (!currentNearestNpc.friended) {
    handleGreet();
  }
}

// ===== 7. UI 與輸入控制器初始化 =====
const ui = new GameUI({
  onSelectTime: (key) => {
    state.timeKey = key;
    ui.setNightTheme(TIME_PRESETS[key].isNight);
  },
  onSelectBoat: (tier) => {
    if (state.boardedNpc) {
      ui.showToast("請先下船再切換自己的船隻喔！", { soft: true });
      return;
    }
    switchPlayerBoat(tier);
  }
});
ui.updateStats(state);
ui.setBlocks(city.blocks);

const input = new InputController({
  onGreet: handleGreet,
  onBoard: handleBoardToggle,
  onZoom: (delta) => {
    zoomFactor = THREE.MathUtils.clamp(zoomFactor + delta, 0.65, 1.55);
  }
});

// ===== 8. 城市街廓與運河岸碰撞處理（順滑貼邊不卡死） =====
function resolveCityCollision(pos, radius) {
  const limit = WORLD_CONFIG.halfExtent - radius;
  pos.x = THREE.MathUtils.clamp(pos.x, -limit, limit);
  pos.z = THREE.MathUtils.clamp(pos.z, -limit, limit);

  const half = WORLD_CONFIG.blockHalfSize + radius;
  for (const bx of WORLD_CONFIG.blockCenters) {
    for (const bz of WORLD_CONFIG.blockCenters) {
      const dx = pos.x - bx;
      const dz = pos.z - bz;
      if (Math.abs(dx) < half && Math.abs(dz) < half) {
        const overlapX = half - Math.abs(dx);
        const overlapZ = half - Math.abs(dz);
        if (overlapX < overlapZ) {
          pos.x = bx + (dx >= 0 ? half : -half);
        } else {
          pos.z = bz + (dz >= 0 ? half : -half);
        }
      }
    }
  }
}

// ===== 9. 晝夜光影平滑插值狀態 =====
const curLight = {
  sky: new THREE.Color(TIME_PRESETS.noon.sky),
  fog: new THREE.Color(TIME_PRESETS.noon.fog),
  sunColor: new THREE.Color(TIME_PRESETS.noon.sunColor),
  sunPos: new THREE.Vector3(...TIME_PRESETS.noon.sunPos),
  hemiSky: new THREE.Color(TIME_PRESETS.noon.hemiSky),
  hemiGround: new THREE.Color(TIME_PRESETS.noon.hemiGround),
  waterColor: new THREE.Color(TIME_PRESETS.noon.waterColor),
  waterEmissive: new THREE.Color(TIME_PRESETS.noon.waterEmissive),
  windowGlow: 0,
  lanternGlow: 0
};

const tmpColor = new THREE.Color();
const tmpVec = new THREE.Vector3();

function updateLighting(dt) {
  const preset = TIME_PRESETS[state.timeKey];
  const t = Math.min(1, dt * 2.6);

  curLight.sky.lerp(tmpColor.setHex(preset.sky), t);
  scene.background.copy(curLight.sky);

  curLight.fog.lerp(tmpColor.setHex(preset.fog), t);
  scene.fog.color.copy(curLight.fog);
  scene.fog.density = THREE.MathUtils.lerp(scene.fog.density, preset.fogDensity, t);

  curLight.sunColor.lerp(tmpColor.setHex(preset.sunColor), t);
  sunLight.color.copy(curLight.sunColor);
  sunLight.intensity = THREE.MathUtils.lerp(sunLight.intensity, preset.sunIntensity, t);

  curLight.sunPos.lerp(tmpVec.set(...preset.sunPos), t);
  sunLight.position.copy(camTarget).add(curLight.sunPos);
  sunLight.target.position.copy(camTarget);

  curLight.hemiSky.lerp(tmpColor.setHex(preset.hemiSky), t);
  curLight.hemiGround.lerp(tmpColor.setHex(preset.hemiGround), t);
  hemiLight.color.copy(curLight.hemiSky);
  hemiLight.groundColor.copy(curLight.hemiGround);
  hemiLight.intensity = THREE.MathUtils.lerp(hemiLight.intensity, preset.hemiIntensity, t);

  curLight.waterColor.lerp(tmpColor.setHex(preset.waterColor), t);
  curLight.waterEmissive.lerp(tmpColor.setHex(preset.waterEmissive), t);
  city.waterMat.color.copy(curLight.waterColor);
  city.waterMat.emissive.copy(curLight.waterEmissive);

  curLight.windowGlow = THREE.MathUtils.lerp(curLight.windowGlow, preset.windowGlow, t);
  curLight.lanternGlow = THREE.MathUtils.lerp(curLight.lanternGlow, preset.lanternGlow, t);

  city.windowMat.emissiveIntensity = curLight.windowGlow;
  city.lanternMat.emissiveIntensity = curLight.lanternGlow;

  playerBoat.lanternLights.forEach((m) => {
    m.emissiveIntensity = Math.max(0.25, curLight.lanternGlow);
  });
  npcManager.setNightGlow(Math.max(0.25, curLight.lanternGlow));

  playerGlowLight.intensity = THREE.MathUtils.lerp(
    playerGlowLight.intensity,
    preset.isNight ? 2.8 : preset.lanternGlow * 0.7,
    t
  );
}

// ===== 10. 主遊戲迴圈 =====
const clock = new THREE.Clock();
const camTarget = new THREE.Vector3().copy(state.pos);
const camDesiredPos = new THREE.Vector3();

// 螢幕座標系轉換至 45° 等距視角世界座標系
// 攝影機在 (+36, +40, +36) 看向原點：
// 螢幕上方 = (-1, -1) 正規化；螢幕右方 = (+1, -1) 正規化
const SCREEN_UP = new THREE.Vector3(-1, 0, -1).normalize();
const SCREEN_RIGHT = new THREE.Vector3(1, 0, -1).normalize();

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  const elapsed = clock.getElapsedTime();

  // 更新光影與水面
  updateLighting(dt);
  city.updateWater(elapsed);

  const tierInfo = BOAT_TIERS[state.currentTier];

  // 先更新 NPC 位置，再讓登船分身同步貼合甲板（零延遲）
  npcManager.update(dt, elapsed, currentNearestNpc ? currentNearestNpc.id : -1);
  pedestrians.update(dt, elapsed);

  if (state.boardedNpc) {
    // ===== 乘客模式：跟著船友一起漂流 =====
    const host = state.boardedNpc;
    host.boat.group.updateMatrixWorld();
    const slotWorld = host.boat.passengerSlot.clone().applyMatrix4(host.boat.group.matrixWorld);
    passengerAvatar.position.copy(slotWorld);
    passengerAvatar.rotation.y = host.yaw;
    state.pos.copy(host.boat.group.position);

    // 搭便車悠閒共乘每 6 秒加一點友誼默契分
    state.passengerBonusTimer += dt;
    if (state.passengerBonusTimer >= 6.0) {
      state.passengerBonusTimer = 0;
      addScore(2);
    }
  } else {
    // ===== 自駕模式：開著橘色船穿梭台北運河 =====
    const move = input.getMoveVector();

    if (move.magnitude > 0.08) {
      const worldDir = new THREE.Vector3()
        .addScaledVector(SCREEN_RIGHT, move.x)
        .addScaledVector(SCREEN_UP, -move.y)
        .normalize();

      const desiredYaw = Math.atan2(worldDir.x, worldDir.z);
      let diff = desiredYaw - state.yaw;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      state.yaw += diff * Math.min(1, dt * tierInfo.turnSpeed);

      const targetSpeed = tierInfo.speed * move.magnitude;
      const forwardX = Math.sin(state.yaw) * targetSpeed;
      const forwardZ = Math.cos(state.yaw) * targetSpeed;
      state.vel.x = THREE.MathUtils.lerp(state.vel.x, forwardX, dt * 4.5);
      state.vel.z = THREE.MathUtils.lerp(state.vel.z, forwardZ, dt * 4.5);
    } else {
      // 水面自然滑行阻力
      state.vel.multiplyScalar(Math.pow(0.14, dt));
    }

    state.pos.x += state.vel.x * dt;
    state.pos.z += state.vel.z * dt;
    resolveCityCollision(state.pos, tierInfo.radius);

    // 喚回船隻的彈出縮放動畫
    if (state.stowAnimScale < 1) {
      state.stowAnimScale = Math.min(1, state.stowAnimScale + dt * 4.2);
      playerBoat.group.scale.setScalar(state.stowAnimScale);
    }

    const speedRatio = Math.min(1, state.vel.length() / tierInfo.speed);
    playerBoat.group.position.set(
      state.pos.x,
      Math.sin(elapsed * 2.4) * 0.09,
      state.pos.z
    );
    playerBoat.group.rotation.y = state.yaw;
    playerBoat.group.rotation.z = Math.sin(elapsed * 2.0) * (0.03 + speedRatio * 0.03);
    playerBoat.group.rotation.x = -speedRatio * 0.04;

    // 划槳與船帆動畫
    const anim = playerBoat.animatedParts;
    if (anim.paddle) {
      anim.paddle.rotation.x = Math.sin(elapsed * (3.2 + speedRatio * 6.5)) * (0.2 + speedRatio * 0.55);
    }
    anim.sails.forEach((s, i) => {
      s.rotation.z = Math.sin(elapsed * 2.2 + i) * (0.03 + speedRatio * 0.05);
    });
    if (anim.flag) {
      anim.flag.rotation.y = Math.sin(elapsed * (4.5 + speedRatio * 5)) * 0.28;
    }

    // 尾波水紋隨船速放大
    playerBoat.wakeRing.scale.setScalar(0.75 + speedRatio * 0.75 + Math.sin(elapsed * 5) * 0.08);
    playerBoat.wakeRing.material.opacity = 0.2 + speedRatio * 0.35;
  }

  // 載客：接人與送達
  const pEvents = passengers.update(dt, elapsed, state.pos, { canInteract: !state.boardedNpc });
  for (const ev of pEvents) {
    if (ev.type === "pickup") {
      ui.showToast(`接到一位乘客，想去「${ev.passenger.dest.label}」`, { soft: true });
      ui.showPlayerBubble(`歡迎上船！我們去${ev.passenger.dest.label} ⛵`);
    } else if (ev.type === "deliver") {
      spawnCelebration(state.pos, 0x56c5d0, 14);
      ui.showToast(`送達${ev.passenger.dest.label}！+${ev.points} 分`);
      ui.showPlayerBubble("到囉～路上小心！");
      addScore(ev.points);
    } else if (ev.type === "needBigger") {
      ui.showToast("有人想搭船！升級成帆船或海盜船才能載客喔", { soft: true });
    } else if (ev.type === "full") {
      ui.showToast("船上客滿了，先送一些乘客到目的地吧", { soft: true });
    }
  }

  // 尋找最近船友（供下一幀互動與光環提示）
  currentNearestNpc = npcManager.findNearest(state.pos, 12.5);

  // 更新粒子與燈光位置
  updateParticles(dt);
  playerGlowLight.position.set(state.pos.x, 3.2, state.pos.z);

  // 平滑追蹤攝影機
  camTarget.lerp(state.pos, Math.min(1, dt * 5.2));
  camDesiredPos
    .copy(camTarget)
    .addScaledVector(BASE_CAM_OFFSET, zoomFactor);
  camera.position.lerp(camDesiredPos, Math.min(1, dt * 5.2));
  camera.lookAt(camTarget.x, camTarget.y + 1.4, camTarget.z);
  camera.updateMatrixWorld();
  updateSeeThrough(camera, state.pos, renderer);

  // 更新 HUD、路名、漂浮泡泡與小地圖
  ui.updateInteraction({
    nearestNpc: currentNearestNpc,
    boardedNpc: state.boardedNpc
  });
  const district = ui.updateLocationName(state.pos);
  if (district !== state.district) {
    if (state.district) ui.showToast(`進入${district}區`, { soft: true });
    state.district = district;
  }
  ui.updateFloatingLabels(dt, camera, state.pos, npcManager.npcs, currentNearestNpc);
  const onboardGroups = passengers.onboardSummary();
  ui.updatePassengerStatus(onboardGroups, passengers.onboard.length, passengers.capacity);
  ui.updatePassengerLabels(camera, state.pos, passengers.waiting, passengers.capacity > 0);
  ui.drawMinimap(state.pos, npcManager.npcs, TIME_PRESETS[state.timeKey].isNight, {
    waiting: passengers.waiting,
    destBlocks: onboardGroups.flatMap((g) => g.dest.blocks)
  });

  renderer.render(scene, camera);
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();

// 測試用：網址加上 ?debug 才會開放，讓自動化測試能直接移動船與加分
if (new URLSearchParams(location.search).has("debug")) {
  window.__game = { state, passengers, addScore, switchPlayerBoat, getBoat: () => playerBoat };
}
