import * as THREE from "three";
import { WORLD_CONFIG, DISTRICT_GRID, DISTRICTS, LANDMARKS } from "./config.js";
import { makeMat, createTreeSpecies, SPECIES_KEYS } from "./trees.js";
import { bakeStatic } from "./bake.js";
import { applySeeThrough } from "./seeThrough.js";

// 紀念碑谷柔和建築色盤（溫潤莫蘭迪粉橘、砂岩米、灰藍、豆沙綠）
const PALETTE = {
  stone: 0xf4ece1,
  sand: 0xe9d8c5,
  terracotta: 0xe39d85,
  blush: 0xeac2bd,
  sage: 0x99b8a9,
  slate: 0x8fa3ba,
  ivory: 0xfbf7f0,
  roofBlue: 0x5f7da1,
  jadeGlass: 0x8cc2bf,
  quayWall: 0xdccbb8,
  bridge: 0xf6efe6
};

const winGeo = new THREE.BoxGeometry(0.55, 0.95, 0.12);

// 建立一棟帶發光窗格的紀念碑谷建築
function createMinimalBuilding({
  w, h, d, color, windowMat, hasArch = false, hasStairs = false
}) {
  const g = new THREE.Group();

  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), makeMat(color));
  body.position.y = h / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  g.add(body);

  // 屋頂女兒牆邊框
  const parapet = new THREE.Mesh(
    new THREE.BoxGeometry(w + 0.35, 0.38, d + 0.35),
    makeMat(PALETTE.ivory)
  );
  parapet.position.y = h + 0.16;
  parapet.castShadow = true;
  g.add(parapet);

  // 極簡規則發光窗洞
  const floors = Math.max(1, Math.floor((h - 1.5) / 2.2));
  const colsX = Math.max(1, Math.floor((w - 1.6) / 2.1));
  const colsZ = Math.max(1, Math.floor((d - 1.6) / 2.1));

  for (let f = 0; f < floors; f++) {
    const wy = 2.0 + f * 2.15;
    if (wy > h - 1.0) break;

    for (let c = 0; c < colsX; c++) {
      const wx = -((colsX - 1) * 1.8) / 2 + c * 1.8;
      // 前後兩面
      const wFront = new THREE.Mesh(winGeo, windowMat);
      wFront.position.set(wx, wy, d / 2 + 0.02);
      g.add(wFront);

      const wBack = new THREE.Mesh(winGeo, windowMat);
      wBack.position.set(wx, wy, -d / 2 - 0.02);
      g.add(wBack);
    }

    for (let c = 0; c < colsZ; c++) {
      const wz = -((colsZ - 1) * 1.8) / 2 + c * 1.8;
      const wRight = new THREE.Mesh(winGeo, windowMat);
      wRight.rotation.y = Math.PI / 2;
      wRight.position.set(w / 2 + 0.02, wy, wz);
      g.add(wRight);

      const wLeft = new THREE.Mesh(winGeo, windowMat);
      wLeft.rotation.y = Math.PI / 2;
      wLeft.position.set(-w / 2 - 0.02, wy, wz);
      g.add(wLeft);
    }
  }

  // 紀念碑谷經典元素：底部拱門裝飾
  if (hasArch) {
    const archFrame = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 2.8, 0.45),
      makeMat(PALETTE.ivory)
    );
    archFrame.position.set(0, 1.4, d / 2 + 0.15);
    g.add(archFrame);

    const archDoor = new THREE.Mesh(
      new THREE.CylinderGeometry(0.75, 0.75, 0.52, 14),
      makeMat(0x4c5d75)
    );
    archDoor.rotation.x = Math.PI / 2;
    archDoor.position.set(0, 1.6, d / 2 + 0.16);
    g.add(archDoor);

    const doorLower = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 1.6, 0.5),
      makeMat(0x4c5d75)
    );
    doorLower.position.set(0, 0.8, d / 2 + 0.16);
    g.add(doorLower);
  }

  // 外掛極簡幾何階梯
  if (hasStairs) {
    for (let s = 0; s < 5; s++) {
      const step = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.32, 0.55),
        makeMat(PALETTE.ivory)
      );
      step.position.set(w / 2 + 0.55, 0.25 + s * 0.34, -d * 0.25 + s * 0.52);
      step.castShadow = true;
      g.add(step);
    }
  }

  return g;
}

// 台北 101（紀念碑谷幾何疊斗風格）
function createTaipei101(windowMat, lanternMat) {
  const g = new THREE.Group();

  // 基座
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(5.6, 6.8, 7.5, 4),
    makeMat(PALETTE.stone, 0.75)
  );
  base.rotation.y = Math.PI / 4;
  base.position.y = 3.75;
  base.castShadow = true;
  base.receiveShadow = true;
  g.add(base);

  // 八層倒梯形竹節斗拱模組
  const segCount = 8;
  const segHeight = 3.5;
  for (let i = 0; i < segCount; i++) {
    const scale = 1 - i * 0.025;
    const seg = new THREE.Mesh(
      new THREE.CylinderGeometry(4.4 * scale, 3.65 * scale, segHeight, 4),
      makeMat(i % 2 === 0 ? PALETTE.jadeGlass : 0x99cbc7, 0.55)
    );
    seg.rotation.y = Math.PI / 4;
    seg.position.y = 7.5 + segHeight / 2 + i * segHeight;
    seg.castShadow = true;
    g.add(seg);

    // 層間暖白發光腰帶
    const band = new THREE.Mesh(
      new THREE.BoxGeometry(5.7 * scale, 0.32, 5.7 * scale),
      windowMat
    );
    band.position.y = 7.5 + (i + 1) * segHeight - 0.15;
    g.add(band);
  }

  // 觀景冠層與高塔尖頂
  const topY = 7.5 + segCount * segHeight;
  const crown1 = new THREE.Mesh(
    new THREE.BoxGeometry(4.2, 2.2, 4.2),
    makeMat(PALETTE.ivory)
  );
  crown1.position.y = topY + 1.1;
  g.add(crown1);

  const crown2 = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 2.2, 2.4),
    makeMat(PALETTE.jadeGlass)
  );
  crown2.position.y = topY + 3.2;
  g.add(crown2);

  const spire = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.42, 7.2, 8),
    makeMat(PALETTE.ivory)
  );
  spire.position.y = topY + 7.4;
  g.add(spire);

  // 塔頂發光幾何晶體
  const beacon = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.65, 0),
    lanternMat
  );
  beacon.position.y = topY + 11.4;
  g.add(beacon);

  return g;
}

// 紀念堂白藍穹頂與牌樓（極簡紀念碑谷地標）
function createMemorialHall(lanternMat) {
  const g = new THREE.Group();

  // 三層白色幾何台階
  [
    { w: 18, h: 1.0, y: 0.5 },
    { w: 14.5, h: 1.1, y: 1.55 },
    { w: 11.5, h: 1.1, y: 2.65 }
  ].forEach((step) => {
    const m = new THREE.Mesh(
      new THREE.BoxGeometry(step.w, step.h, step.w),
      makeMat(PALETTE.ivory, 0.78)
    );
    m.position.y = step.y;
    m.castShadow = true;
    m.receiveShadow = true;
    g.add(m);
  });

  // 主廳白牆
  const hall = new THREE.Mesh(
    new THREE.BoxGeometry(9.2, 6.2, 9.2),
    makeMat(PALETTE.ivory, 0.75)
  );
  hall.position.y = 6.3;
  hall.castShadow = true;
  g.add(hall);

  // 八角藍琉璃屋頂
  const roofLower = new THREE.Mesh(
    new THREE.ConeGeometry(7.8, 3.2, 8),
    makeMat(PALETTE.roofBlue, 0.62)
  );
  roofLower.position.y = 10.9;
  roofLower.castShadow = true;
  g.add(roofLower);

  const roofUpper = new THREE.Mesh(
    new THREE.ConeGeometry(5.1, 3.4, 8),
    makeMat(0x4b6a91, 0.58)
  );
  roofUpper.position.y = 13.4;
  roofUpper.castShadow = true;
  g.add(roofUpper);

  const finial = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.6, 0),
    lanternMat
  );
  finial.position.y = 15.6;
  g.add(finial);

  return g;
}

// 優雅高拱運河橋（海盜船桅杆可輕鬆穿越）
function createCanalBridge(x, z, rotateY, lanternMat) {
  const g = new THREE.Group();
  const span = WORLD_CONFIG.canalWidth + 2.4;
  const clearance = 9.0; // 足夠海盜船高 7.6 的旗幟自由穿過

  // 雙側橋墩
  [-span / 2, span / 2].forEach((px) => {
    const pier = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, clearance * 0.56, 3.2),
      makeMat(PALETTE.bridge)
    );
    pier.position.set(px, clearance * 0.28, 0);
    pier.castShadow = true;
    pier.receiveShadow = true;
    g.add(pier);

    // 橋頭暖燈柱
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.14, 1.8, 6),
      makeMat(PALETTE.slate)
    );
    post.position.set(px, clearance * 0.56 + 0.9, 1.35);
    g.add(post);

    const lamp = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.26, 0),
      lanternMat
    );
    lamp.position.set(px, clearance * 0.56 + 1.95, 1.35);
    g.add(lamp);
  });

  // 階梯式優雅拱橋面（紀念碑谷幾何切面）
  const segments = 9;
  for (let i = 0; i < segments; i++) {
    const t = i / (segments - 1);
    const sx = -span / 2 + t * span;
    const archY = Math.sin(t * Math.PI) * 3.8 + clearance * 0.54;
    const seg = new THREE.Mesh(
      new THREE.BoxGeometry(span / segments + 0.45, 0.55, 2.7),
      makeMat(PALETTE.bridge)
    );
    seg.position.set(sx, archY, 0);
    seg.castShadow = true;
    g.add(seg);

    // 柔和粉橘護欄點綴
    [-1.22, 1.22].forEach((rz) => {
      const rail = new THREE.Mesh(
        new THREE.BoxGeometry(span / segments + 0.35, 0.55, 0.18),
        makeMat(PALETTE.terracotta)
      );
      rail.position.set(sx, archY + 0.48, rz);
      g.add(rail);
    });
  }

  g.position.set(x, 0, z);
  g.rotation.y = rotateY;
  return g;
}

// 固定種子的亂數：每次載入地圖長得一樣
function seededRandom(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const BLOCK_TOP = 1.35; // 街廓廣場地面高度
export const WALK_RADIUS = 13.2; // 行人沿街廓外圈散步的半徑


// 建立完整台北運河城市與動態水面
export function buildTaipeiCity(scene) {
  const cityGroup = new THREE.Group();
  const rand = seededRandom(20261126);

  // 共用自發光材質（隨晝夜自動切換亮度）
  const windowMat = new THREE.MeshStandardMaterial({
    color: 0xfff0c2,
    emissive: 0xffc66d,
    emissiveIntensity: 0.0,
    roughness: 0.4
  });

  const lanternMat = new THREE.MeshStandardMaterial({
    color: 0xffe8ad,
    emissive: 0xffad42,
    emissiveIntensity: 0.0,
    roughness: 0.3
  });

  const outerR = WORLD_CONFIG.halfExtent;
  const rimThickness = 18;

  // ===== 1. 動態幾何水面 =====
  const waterSize = (outerR + rimThickness) * 2 + 40;
  const waterGeo = new THREE.PlaneGeometry(waterSize, waterSize, 84, 84);
  waterGeo.rotateX(-Math.PI / 2);
  const waterPos = waterGeo.attributes.position;
  const baseY = new Float32Array(waterPos.count);
  for (let i = 0; i < waterPos.count; i++) {
    baseY[i] = waterPos.getY(i);
  }

  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x4db3c4,
    emissive: 0x0e333e,
    roughness: 0.24,
    metalness: 0.12,
    flatShading: true
  });
  const waterMesh = new THREE.Mesh(waterGeo, waterMat);
  waterMesh.receiveShadow = true;
  scene.add(waterMesh);

  // ===== 2. 外圍運河護岸與遠景樹列 =====
  const rimGroup = new THREE.Group();
  const rimLen = outerR * 2 + rimThickness * 2;
  [
    [0, -(outerR + rimThickness / 2), rimLen, rimThickness],
    [0, outerR + rimThickness / 2, rimLen, rimThickness],
    [-(outerR + rimThickness / 2), 0, rimThickness, outerR * 2],
    [outerR + rimThickness / 2, 0, rimThickness, outerR * 2]
  ].forEach(([rx, rz, rw, rd]) => {
    const rim = new THREE.Mesh(
      new THREE.BoxGeometry(rw, 1.8, rd),
      makeMat(PALETTE.quayWall)
    );
    rim.position.set(rx, 0.5, rz);
    rimGroup.add(rim);
  });
  for (let p = -outerR + 8; p <= outerR - 8; p += 12) {
    const sp = () => SPECIES_KEYS[Math.floor(rand() * SPECIES_KEYS.length)];
    const s = () => 1.2 + rand() * 0.4;
    rimGroup.add(createTreeSpecies(sp(), p, 1.4, -(outerR + 5), s(), rand() * 6));
    rimGroup.add(createTreeSpecies(sp(), p, 1.4, outerR + 5, s(), rand() * 6));
    rimGroup.add(createTreeSpecies(sp(), -(outerR + 5), 1.4, p, s(), rand() * 6));
    rimGroup.add(createTreeSpecies(sp(), outerR + 5, 1.4, p, s(), rand() * 6));
  }
  cityGroup.add(bakeStatic(rimGroup));

  // ===== 3. 7 x 7 台北行政區街廓 =====
  const blockSize = WORLD_CONFIG.blockHalfSize * 2; // 34
  const blocks = [];
  let streetTreeCount = 0;
  const streetTrees = []; // 沿岸行道樹的世界座標，給尋寶用

  const centers = WORLD_CONFIG.blockCenters;
  centers.forEach((bz, iz) => {
    centers.forEach((bx, ix) => {
      const districtName = DISTRICT_GRID[iz][ix];
      const district = DISTRICTS[districtName];
      const landmark = LANDMARKS[`${ix},${iz}`]?.key || null;
      const isPark = landmark === "daanPark" || (!landmark && rand() < district.park);

      const block = new THREE.Group();
      block.position.set(bx, 0, bz);

      // 河岸石砌基座 + 廣場地坪（依行政區上色）
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(blockSize, 1.4, blockSize),
        makeMat(PALETTE.quayWall, 0.85)
      );
      base.position.y = 0.5;
      block.add(base);

      const topPlaza = new THREE.Mesh(
        new THREE.BoxGeometry(blockSize - 1.6, 0.2, blockSize - 1.6),
        makeMat(isPark ? 0xb4cfb8 : district.plaza, 0.88)
      );
      topPlaza.position.y = 1.25;
      block.add(topPlaza);

      // 四角水岸提燈
      const corner = blockSize / 2 - 1.3;
      [
        [-corner, -corner],
        [corner, -corner],
        [-corner, corner],
        [corner, corner]
      ].forEach(([lx, lz]) => {
        const post = new THREE.Mesh(
          new THREE.CylinderGeometry(0.08, 0.11, 2.2, 6),
          makeMat(PALETTE.slate)
        );
        post.position.set(lx, 2.3, lz);
        block.add(post);

        const bulb = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.24, 0),
          lanternMat
        );
        bulb.position.set(lx, 3.55, lz);
        block.add(bulb);
      });

      // --- 沿岸行道樹：每一邊種它面對那條運河的樹種 ---
      const sides = [
        { canal: WORLD_CONFIG.ewCanals[iz], along: "x", fixed: -15.2 }, // 北岸
        { canal: WORLD_CONFIG.ewCanals[iz + 1], along: "x", fixed: 15.2 }, // 南岸
        { canal: WORLD_CONFIG.nsCanals[ix], along: "z", fixed: -15.2 }, // 西岸
        { canal: WORLD_CONFIG.nsCanals[ix + 1], along: "z", fixed: 15.2 } // 東岸
      ];
      sides.forEach(({ canal, along, fixed }) => {
        let k = 0;
        for (let t = -12; t <= 12; t += 4) {
          const species = canal.trees[k % canal.trees.length];
          const tx = along === "x" ? t : fixed;
          const tz = along === "x" ? fixed : t;
          block.add(createTreeSpecies(species, tx, BLOCK_TOP, tz, 0.95 + rand() * 0.25, rand() * 6));
          streetTrees.push({ x: bx + tx, y: BLOCK_TOP, z: bz + tz });
          k++;
          streetTreeCount++;
        }
      });

      // 行人能不能穿越街廓中央的十字步道
      let allowCross = true;

      if (landmark === "taipei101") {
        const t101 = createTaipei101(windowMat, lanternMat);
        t101.position.set(1.5, 1.3, 1.5);
        block.add(t101);

        const annex = createMinimalBuilding({
          w: 8.5, h: 11, d: 8.5,
          color: PALETTE.blush,
          windowMat,
          hasArch: true
        });
        annex.position.set(-8.3, 1.3, -8.3);
        block.add(annex);
        allowCross = false;
      } else if (landmark === "memorial") {
        const hall = createMemorialHall(lanternMat);
        hall.position.set(0, 1.3, 0);
        block.add(hall);
        [[-11.5, -11.5], [11.5, -11.5], [-11.5, 11.5], [11.5, 11.5]].forEach(([tx, tz]) => {
          block.add(createTreeSpecies("camphor", tx, BLOCK_TOP, tz, 1.1, rand() * 6));
        });
        allowCross = false;
      } else if (landmark === "daanPark") {
        // 大安森林公園：幾何涼亭與混種樹林
        const pavilionBase = new THREE.Mesh(
          new THREE.CylinderGeometry(4.6, 5.2, 0.8, 8),
          makeMat(PALETTE.ivory)
        );
        pavilionBase.position.set(0, 1.7, 0);
        block.add(pavilionBase);

        for (let p = 0; p < 6; p++) {
          const ang = (p / 6) * Math.PI * 2;
          const col = new THREE.Mesh(
            new THREE.CylinderGeometry(0.18, 0.2, 3.6, 6),
            makeMat(PALETTE.terracotta)
          );
          col.position.set(Math.cos(ang) * 3.4, 3.8, Math.sin(ang) * 3.4);
          block.add(col);
        }

        const pavRoof = new THREE.Mesh(
          new THREE.ConeGeometry(5.4, 2.4, 8),
          makeMat(PALETTE.terracotta)
        );
        pavRoof.position.y = 6.7;
        block.add(pavRoof);

        [
          [-10, -10], [10, -10], [-10, 10], [10, 10],
          [-10.5, -4], [10.5, 4], [4, -10.5], [-4, 10.5],
          [-6.8, -6.8], [7, 6.5], [-7, 6], [6.5, -7]
        ].forEach(([tx, tz], ti) => {
          block.add(createTreeSpecies(SPECIES_KEYS[ti % SPECIES_KEYS.length], tx, BLOCK_TOP, tz, 1.0 + rand() * 0.3, rand() * 6));
        });
        allowCross = false;
      } else if (isPark) {
        // 一般公園街廓：混種樹林，北投、文山多了幾座小山丘
        const hilly = districtName === "北投" || districtName === "文山";
        if (hilly) {
          [[-6.5, -6.5], [6.5, 6.5]].forEach(([hx, hz], hi) => {
            const hill = new THREE.Mesh(
              new THREE.DodecahedronGeometry(1, 0),
              makeMat(hi ? 0x99b8a9 : 0x8aae95)
            );
            hill.position.set(hx, BLOCK_TOP, hz);
            hill.scale.set(4.2, 2.6 + rand() * 1.4, 4.2);
            block.add(hill);
          });
        }
        for (let n = 0; n < 14; n++) {
          const tx = (rand() * 2 - 1) * 10.5;
          const tz = (rand() * 2 - 1) * 10.5;
          if (Math.abs(tx) < 1.8 || Math.abs(tz) < 1.8) continue; // 留出步道
          if (hilly && (Math.hypot(tx + 6.5, tz + 6.5) < 4.5 || Math.hypot(tx - 6.5, tz - 6.5) < 4.5)) continue;
          const sp = SPECIES_KEYS[Math.floor(rand() * SPECIES_KEYS.length)];
          block.add(createTreeSpecies(sp, tx, BLOCK_TOP, tz, 0.95 + rand() * 0.35, rand() * 6));
        }
      } else {
        // 一般街廓：四棟建築，高度與配色依行政區而不同
        const [hMin, hMax] = district.heights;
        const slots = [
          { x: -7.5, z: -7.5 },
          { x: 7.6, z: -7.2 },
          { x: -7.2, z: 7.6 },
          { x: 7.5, z: 7.5 }
        ];
        slots.forEach((slot, bi) => {
          const bld = createMinimalBuilding({
            w: 6.6 + rand() * 2.8,
            d: 6.6 + rand() * 2.8,
            h: hMin + rand() * (hMax - hMin),
            color: district.palette[Math.floor(rand() * district.palette.length)],
            windowMat,
            hasArch: bi === 0,
            hasStairs: bi === 2
          });
          bld.position.set(slot.x, 1.3, slot.z);
          block.add(bld);
        });
      }

      block.updateMatrixWorld(true);
      cityGroup.add(bakeStatic(block));

      blocks.push({ ix, iz, x: bx, z: bz, district: districtName, landmark, isPark, allowCross });
    });
  });

  // ===== 4. 跨運河高拱橋（散布在各段運河中間） =====
  const bridgeGroup = new THREE.Group();
  WORLD_CONFIG.ewCanals.slice(1, -1).forEach((c, k) => {
    centers.forEach((cx, j) => {
      if ((j + k) % 3 === 0) {
        bridgeGroup.add(createCanalBridge(cx, c.z, Math.PI / 2, lanternMat));
      }
    });
  });
  WORLD_CONFIG.nsCanals.slice(1, -1).forEach((c, k) => {
    centers.forEach((cz, j) => {
      if ((j + k + 1) % 3 === 0) {
        bridgeGroup.add(createCanalBridge(c.x, cz, 0, lanternMat));
      }
    });
  });
  cityGroup.add(bakeStatic(bridgeGroup));

  // 城市所有靜態材質都套上視線穿透（水面另外建，不受影響）
  cityGroup.traverse((o) => {
    if (o.isMesh) applySeeThrough(o.material);
  });

  scene.add(cityGroup);

  // 水面輕微波動更新函式
  function updateWater(elapsed) {
    const pos = waterGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vz = pos.getZ(i);
      const wave =
        Math.sin(vx * 0.09 + elapsed * 1.4) * 0.14 +
        Math.cos(vz * 0.08 + elapsed * 1.1) * 0.12;
      pos.setY(i, baseY[i] + wave);
    }
    pos.needsUpdate = true;
    waterGeo.computeVertexNormals();
  }

  return {
    waterMat,
    windowMat,
    lanternMat,
    updateWater,
    blocks,
    blockTop: BLOCK_TOP,
    streetTreeCount,
    streetTrees
  };
}
