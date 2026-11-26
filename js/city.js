import * as THREE from "three";
import { WORLD_CONFIG } from "./config.js";

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

function makeMat(color, roughness = 0.82) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness: 0.02,
    flatShading: true
  });
}

// 幾何柏樹 / 行道樹（紀念碑谷俐落剪影）
function createTree(x, z, scale = 1, variant = 0) {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.22, 1.1, 6),
    makeMat(0x9b7e6b, 0.85)
  );
  trunk.position.y = 0.55;
  trunk.castShadow = true;
  g.add(trunk);

  const foliageColor = variant % 2 === 0 ? 0x6f9e8c : 0x88b39a;
  if (variant % 3 === 0) {
    // 尖塔柏樹
    const crown = new THREE.Mesh(
      new THREE.ConeGeometry(0.85, 2.8, 7),
      makeMat(foliageColor, 0.8)
    );
    crown.position.y = 2.25;
    crown.castShadow = true;
    g.add(crown);
  } else {
    // 雙球幾何樹
    const c1 = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.92, 0),
      makeMat(foliageColor, 0.82)
    );
    c1.position.y = 1.95;
    c1.castShadow = true;
    g.add(c1);
    const c2 = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.62, 0),
      makeMat(0x9fc2a9, 0.82)
    );
    c2.position.set(0.38, 2.55, 0.2);
    c2.castShadow = true;
    g.add(c2);
  }

  g.position.set(x, 1.2, z);
  g.scale.setScalar(scale);
  return g;
}

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

  const winGeo = new THREE.BoxGeometry(0.55, 0.95, 0.12);
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

// 建立完整台北運河城市與動態水面
export function buildTaipeiCity(scene) {
  const cityGroup = new THREE.Group();

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

  // ===== 1. 動態幾何水面 =====
  const waterGeo = new THREE.PlaneGeometry(320, 320, 56, 56);
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

  // ===== 2. 外圍運河護岸邊框 =====
  const outerR = WORLD_CONFIG.halfExtent;
  const rimThickness = 18;
  const rimLen = outerR * 2 + rimThickness * 2;
  const rimConfigs = [
    [0, -(outerR + rimThickness / 2), rimLen, rimThickness],
    [0, outerR + rimThickness / 2, rimLen, rimThickness],
    [-(outerR + rimThickness / 2), 0, rimThickness, outerR * 2],
    [outerR + rimThickness / 2, 0, rimThickness, outerR * 2]
  ];
  rimConfigs.forEach(([rx, rz, rw, rd]) => {
    const rim = new THREE.Mesh(
      new THREE.BoxGeometry(rw, 1.8, rd),
      makeMat(PALETTE.quayWall)
    );
    rim.position.set(rx, 0.5, rz);
    rim.receiveShadow = true;
    cityGroup.add(rim);
  });

  // 外岸點綴遠景輪廓山與幾何塔群
  for (let i = -3; i <= 3; i++) {
    const p = i * 24;
    cityGroup.add(createTree(p, -(outerR + 5), 1.35, Math.abs(i)));
    cityGroup.add(createTree(p, outerR + 5, 1.25, Math.abs(i) + 1));
    cityGroup.add(createTree(-(outerR + 5), p, 1.3, Math.abs(i) + 2));
    cityGroup.add(createTree(outerR + 5, p, 1.3, Math.abs(i)));
  }

  // ===== 3. 九大台北幾何街廓 =====
  const blockSize = WORLD_CONFIG.blockHalfSize * 2; // 34
  const pastelColors = [
    PALETTE.stone,
    PALETTE.blush,
    PALETTE.sand,
    PALETTE.terracotta,
    PALETTE.slate,
    PALETTE.ivory
  ];

  let colorIdx = 0;

  WORLD_CONFIG.blockCenters.forEach((bx, ix) => {
    WORLD_CONFIG.blockCenters.forEach((bz, iz) => {
      const block = new THREE.Group();
      block.position.set(bx, 0, bz);

      // 河岸石砌基座 + 親水階梯邊緣
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(blockSize, 1.4, blockSize),
        makeMat(PALETTE.quayWall, 0.85)
      );
      base.position.y = 0.5;
      base.receiveShadow = true;
      block.add(base);

      const topPlaza = new THREE.Mesh(
        new THREE.BoxGeometry(blockSize - 1.6, 0.2, blockSize - 1.6),
        makeMat(ix === 1 && iz === 1 ? 0xb4cfb8 : PALETTE.ivory, 0.88)
      );
      topPlaza.position.y = 1.25;
      topPlaza.receiveShadow = true;
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

      // --- 依照台北方位放置特色地標 ---
      if (ix === 2 && iz === 2) {
        // 東南角（信義區）：台北 101 廣場
        const t101 = createTaipei101(windowMat, lanternMat);
        t101.position.set(1.5, 1.3, 1.5);
        block.add(t101);

        const annex = createMinimalBuilding({
          w: 8.5, h: 11, d: 8.5,
          color: PALETTE.blush,
          windowMat,
          hasArch: true
        });
        annex.position.set(-9.5, 1.3, -9.2);
        block.add(annex);

        block.add(createTree(-10, 9.5, 1.25, 0));
        block.add(createTree(10, -10, 1.2, 1));
      } else if (ix === 0 && iz === 2) {
        // 西南角（中正區）：紀念堂白藍穹頂廣場
        const hall = createMemorialHall(lanternMat);
        hall.position.set(0, 1.3, 0);
        block.add(hall);
        block.add(createTree(-12.5, -12.5, 1.2, 0));
        block.add(createTree(12.5, -12.5, 1.2, 0));
        block.add(createTree(-12.5, 12.5, 1.2, 0));
        block.add(createTree(12.5, 12.5, 1.2, 0));
      } else if (ix === 1 && iz === 1) {
        // 市中心：大安水岸森林公園（綠意幾何涼亭與樹林）
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
        pavRoof.castShadow = true;
        block.add(pavRoof);

        const treeCoords = [
          [-10.5, -10.5], [10.5, -10.5], [-10.5, 10.5], [10.5, 10.5],
          [-11.5, 0.5], [11.5, -0.5], [0.5, -11.5], [-0.5, 11.5],
          [-6.5, -6.5], [7.0, 6.0]
        ];
        treeCoords.forEach(([tx, tz], ti) => {
          block.add(createTree(tx, tz, 1.05 + (ti % 3) * 0.22, ti));
        });
      } else {
        // 其餘台北幾何街廓（忠孝、敦化、松菸、中山風建築群）
        const layouts = [
          { x: -7.5, z: -7.5, w: 9.2, d: 8.8, h: 10 + ((ix + iz * 2) % 4) * 4.2 },
          { x: 7.8, z: -6.8, w: 8.4, d: 9.5, h: 8 + ((ix * 2 + iz) % 3) * 4.5 },
          { x: -6.8, z: 7.8, w: 9.0, d: 8.2, h: 12 + ((ix + iz) % 3) * 3.5 },
          { x: 7.6, z: 7.6, w: 7.6, d: 7.6, h: 7 + ((ix * 3 + iz) % 3) * 3.0 }
        ];

        layouts.forEach((b, bi) => {
          const bld = createMinimalBuilding({
            w: b.w,
            h: b.h,
            d: b.d,
            color: pastelColors[(colorIdx + bi) % pastelColors.length],
            windowMat,
            hasArch: bi === 0,
            hasStairs: bi === 2
          });
          bld.position.set(b.x, 1.3, b.z);
          block.add(bld);
        });
        colorIdx += 2;

        // 街廓中庭小樹
        block.add(createTree(0, 0, 1.2, ix + iz));
        block.add(createTree(0, -11.5, 0.95, ix + 1));
        block.add(createTree(0, 11.5, 0.95, iz + 2));
      }

      cityGroup.add(block);
    });
  });

  // ===== 4. 跨運河優雅高拱橋 =====
  const bridges = [
    { x: 0, z: -25, rot: Math.PI / 2 },  // 忠孝運河中段
    { x: 0, z: 25, rot: Math.PI / 2 },   // 仁愛運河中段
    { x: -25, z: 0, rot: 0 },            // 復興運河中段
    { x: 25, z: 0, rot: 0 },             // 敦化運河中段
    { x: 50, z: 25, rot: Math.PI / 2 },  // 通往 101 橋
    { x: -50, z: 25, rot: Math.PI / 2 }  // 通往紀念堂橋
  ];
  bridges.forEach((br) => {
    cityGroup.add(createCanalBridge(br.x, br.z, br.rot, lanternMat));
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
    updateWater
  };
}
