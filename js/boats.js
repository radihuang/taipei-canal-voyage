import * as THREE from "three";

// 統一的紀念碑谷質感橘色系調色盤
const ORANGE_MAIN = 0xf26b3a;
const ORANGE_LIGHT = 0xff8d5e;
const ORANGE_DEEP = 0xc94d24;
const CREAM = 0xfdf5e6;
const WOOD = 0xd9a066;
const GOLD = 0xf5c469;
const SAIL_STRIPE = 0xf7b292;

function matte(color, roughness = 0.72) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness: 0.04,
    flatShading: true
  });
}

// 紀念碑谷風格極簡幾何小人（戴圓錐帽 / 披風剪影）
export function createMinimalCharacter({
  cloakColor = 0xfdf5e6,
  hatColor = 0xf26b3a,
  scale = 1
} = {}) {
  const group = new THREE.Group();

  // 身體披風圓錐
  const body = new THREE.Mesh(
    new THREE.ConeGeometry(0.32, 0.95, 8),
    matte(cloakColor, 0.75)
  );
  body.position.y = 0.48;
  body.castShadow = true;
  group.add(body);

  // 圓球頭
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 10, 10),
    matte(0x374151, 0.6)
  );
  head.position.y = 1.04;
  head.castShadow = true;
  group.add(head);

  // 幾何圓錐小帽
  const hat = new THREE.Mesh(
    new THREE.ConeGeometry(0.3, 0.42, 8),
    matte(hatColor, 0.65)
  );
  hat.position.y = 1.32;
  hat.castShadow = true;
  group.add(hat);

  group.scale.setScalar(scale);
  return group;
}

/**
 * 建立三種尺寸的橘色船隻
 * tier: 0 = 單人 SUP, 1 = 五人帆船, 2 = 十人海盜船
 */
export function createBoatMesh(tier, { isPlayer = false, accentColor = null } = {}) {
  const root = new THREE.Group();
  const hullColor = isPlayer ? ORANGE_MAIN : ORANGE_LIGHT;
  const trimColor = accentColor ?? (isPlayer ? CREAM : 0xf9e8d2);
  const hatColor = isPlayer ? 0xf26b3a : (accentColor ?? 0x4ca6b5);

  const lanternLights = [];
  const animatedParts = {
    paddle: null,
    sails: [],
    flag: null
  };

  // 乘客站位槽（供玩家登船搭便車使用）
  const passengerSlot = new THREE.Vector3(0, 0.6, 0.2);

  if (tier === 0) {
    // ===== 1. 單人立槳 SUP =====
    const boardGroup = new THREE.Group();

    const boardBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.95, 0.16, 2.7),
      matte(hullColor, 0.55)
    );
    boardBody.position.y = 0.12;
    boardBody.castShadow = true;
    boardBody.receiveShadow = true;
    boardGroup.add(boardBody);

    // 圓潤船頭與船尾
    const nose = new THREE.Mesh(
      new THREE.CylinderGeometry(0.47, 0.47, 0.16, 12),
      matte(hullColor, 0.55)
    );
    nose.position.set(0, 0.12, 1.35);
    nose.castShadow = true;
    boardGroup.add(nose);

    const tail = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.42, 0.16, 12),
      matte(ORANGE_DEEP, 0.6)
    );
    tail.position.set(0, 0.12, -1.3);
    boardGroup.add(tail);

    // 止滑墊
    const pad = new THREE.Mesh(
      new THREE.BoxGeometry(0.68, 0.04, 1.7),
      matte(trimColor, 0.85)
    );
    pad.position.set(0, 0.22, -0.05);
    boardGroup.add(pad);

    root.add(boardGroup);

    // 划船小人
    const rider = createMinimalCharacter({
      cloakColor: isPlayer ? CREAM : 0xeff6f8,
      hatColor,
      scale: 0.92
    });
    rider.position.set(0, 0.22, -0.1);
    root.add(rider);

    // 木質立槳
    const paddlePivot = new THREE.Group();
    paddlePivot.position.set(0.42, 0.95, 0.1);

    const shaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 1.8, 6),
      matte(WOOD, 0.7)
    );
    shaft.position.y = -0.3;
    paddlePivot.add(shaft);

    const blade = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.45, 0.04),
      matte(ORANGE_DEEP, 0.6)
    );
    blade.position.y = -1.15;
    paddlePivot.add(blade);

    root.add(paddlePivot);
    animatedParts.paddle = paddlePivot;
  } else if (tier === 1) {
    // ===== 2. 五人優雅帆船 =====
    // 橘色船身
    const hull = new THREE.Mesh(
      new THREE.BoxGeometry(2.0, 0.65, 4.0),
      matte(hullColor, 0.6)
    );
    hull.position.y = 0.28;
    hull.castShadow = true;
    hull.receiveShadow = true;
    root.add(hull);

    // 尖形船頭（先在幾何階段轉 45° 再朝前平放，確保完全對稱）
    const bowGeo = new THREE.ConeGeometry(1.42, 1.8, 4);
    bowGeo.rotateY(Math.PI / 4);
    const bow = new THREE.Mesh(bowGeo, matte(hullColor, 0.6));
    bow.rotation.x = Math.PI / 2;
    bow.scale.set(1.0, 1.0, 0.46);
    bow.position.set(0, 0.28, 2.88);
    bow.castShadow = true;
    root.add(bow);

    // 甲板與船舷飾條
    const deck = new THREE.Mesh(
      new THREE.BoxGeometry(1.72, 0.12, 3.65),
      matte(trimColor, 0.8)
    );
    deck.position.y = 0.62;
    deck.receiveShadow = true;
    root.add(deck);

    // 座位長凳（可容納五人）
    [-1.1, 0.9].forEach((zPos) => {
      const bench = new THREE.Mesh(
        new THREE.BoxGeometry(1.55, 0.14, 0.45),
        matte(WOOD, 0.75)
      );
      bench.position.set(0, 0.74, zPos);
      root.add(bench);
    });

    // 桅杆
    const mast = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.1, 5.2, 8),
      matte(CREAM, 0.65)
    );
    mast.position.set(0, 3.1, 0.15);
    mast.castShadow = true;
    root.add(mast);

    // 主三角帆（朝向船尾 -Z 展開）
    const mainSailShape = new THREE.Shape();
    mainSailShape.moveTo(0, 0);
    mainSailShape.lineTo(0, 4.1);
    mainSailShape.lineTo(2.15, 0.25);
    mainSailShape.closePath();

    const mainSail = new THREE.Mesh(
      new THREE.ExtrudeGeometry(mainSailShape, { depth: 0.05, bevelEnabled: false }),
      new THREE.MeshStandardMaterial({
        color: CREAM,
        roughness: 0.78,
        side: THREE.DoubleSide
      })
    );
    mainSail.rotation.y = Math.PI / 2;
    mainSail.position.set(-0.02, 1.2, 0.12);
    mainSail.castShadow = true;
    root.add(mainSail);
    animatedParts.sails.push(mainSail);

    // 前帆（朝向船頭 +Z 展開，柔珊瑚橘）
    const jibShape = new THREE.Shape();
    jibShape.moveTo(0, 0);
    jibShape.lineTo(0, 3.2);
    jibShape.lineTo(-1.7, 0.1);
    jibShape.closePath();

    const jibSail = new THREE.Mesh(
      new THREE.ExtrudeGeometry(jibShape, { depth: 0.04, bevelEnabled: false }),
      new THREE.MeshStandardMaterial({
        color: SAIL_STRIPE,
        roughness: 0.75,
        side: THREE.DoubleSide
      })
    );
    jibSail.rotation.y = Math.PI / 2;
    jibSail.position.set(-0.02, 1.3, 0.3);
    jibSail.castShadow = true;
    root.add(jibSail);
    animatedParts.sails.push(jibSail);

    // 舵手
    const captain = createMinimalCharacter({
      cloakColor: CREAM,
      hatColor,
      scale: 0.9
    });
    captain.position.set(0, 0.68, -1.25);
    root.add(captain);

    // 船頭暖光提燈
    const lanternMat = new THREE.MeshStandardMaterial({
      color: 0xffe4a1,
      emissive: 0xffb347,
      emissiveIntensity: 0.4
    });
    const lantern = new THREE.Mesh(new THREE.OctahedronGeometry(0.18, 0), lanternMat);
    lantern.position.set(0, 1.15, 2.35);
    root.add(lantern);
    lanternLights.push(lanternMat);

    passengerSlot.set(0.35, 0.68, 0.75);
  } else {
    // ===== 3. 十人海盜船 =====
    // 寬敞的橘木大船身
    const lowerHull = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 1.1, 6.2),
      matte(hullColor, 0.62)
    );
    lowerHull.position.y = 0.5;
    lowerHull.castShadow = true;
    lowerHull.receiveShadow = true;
    root.add(lowerHull);

    // 船舷金橘裝飾條
    const trimBand = new THREE.Mesh(
      new THREE.BoxGeometry(3.34, 0.2, 6.3),
      matte(GOLD, 0.5)
    );
    trimBand.position.y = 0.92;
    root.add(trimBand);

    // 船首衝角與船頭
    const pBowGeo = new THREE.ConeGeometry(2.26, 2.5, 4);
    pBowGeo.rotateY(Math.PI / 4);
    const bow = new THREE.Mesh(pBowGeo, matte(hullColor, 0.62));
    bow.rotation.x = Math.PI / 2;
    bow.scale.set(1.0, 1.0, 0.49);
    bow.position.set(0, 0.52, 4.35);
    bow.castShadow = true;
    root.add(bow);

    const bowsprit = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.13, 2.6, 8),
      matte(WOOD, 0.7)
    );
    bowsprit.rotation.x = Math.PI / 2 - 0.25;
    bowsprit.position.set(0, 1.35, 4.85);
    root.add(bowsprit);

    // 主甲板
    const mainDeck = new THREE.Mesh(
      new THREE.BoxGeometry(2.9, 0.14, 5.8),
      matte(WOOD, 0.8)
    );
    mainDeck.position.y = 1.08;
    mainDeck.receiveShadow = true;
    root.add(mainDeck);

    // 挑高船尾樓（Quarterdeck）
    const sternDeck = new THREE.Mesh(
      new THREE.BoxGeometry(3.25, 0.85, 2.1),
      matte(ORANGE_DEEP, 0.65)
    );
    sternDeck.position.set(0, 1.48, -2.15);
    sternDeck.castShadow = true;
    root.add(sternDeck);

    const sternRail = new THREE.Mesh(
      new THREE.BoxGeometry(3.3, 0.2, 2.15),
      matte(GOLD, 0.5)
    );
    sternRail.position.set(0, 1.98, -2.15);
    root.add(sternRail);

    // 雙桅杆 + 鼓脹方帆（高度設計為 7.6，優雅穿過高拱橋）
    const mastConfigs = [
      { z: 1.25, h: 6.2, sailW: 2.8, sailH: 2.5, sailY: 4.1 },
      { z: -0.95, h: 5.2, sailW: 2.3, sailH: 2.0, sailY: 3.6 }
    ];

    mastConfigs.forEach((mc, idx) => {
      const mast = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.14, mc.h, 8),
        matte(WOOD, 0.72)
      );
      mast.position.set(0, 1.1 + mc.h / 2, mc.z);
      mast.castShadow = true;
      root.add(mast);

      // 橫桁
      const yard = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, mc.sailW + 0.4, 6),
        matte(WOOD, 0.72)
      );
      yard.rotation.z = Math.PI / 2;
      yard.position.set(0, mc.sailY + mc.sailH / 2, mc.z + 0.1);
      root.add(yard);

      // 幾何弧形帆面
      const sail = new THREE.Mesh(
        new THREE.BoxGeometry(mc.sailW, mc.sailH, 0.14),
        matte(idx === 0 ? CREAM : 0xfde2cf, 0.8)
      );
      sail.position.set(0, mc.sailY, mc.z + 0.2);
      sail.castShadow = true;
      root.add(sail);
      animatedParts.sails.push(sail);

      // 橘色幾何徽章條紋
      const emblem = new THREE.Mesh(
        new THREE.BoxGeometry(mc.sailW * 0.48, 0.35, 0.18),
        matte(ORANGE_MAIN, 0.65)
      );
      emblem.position.set(0, mc.sailY, mc.z + 0.21);
      root.add(emblem);
    });

    // 主桅瞭望台（Crow's Nest）
    const nest = new THREE.Mesh(
      new THREE.CylinderGeometry(0.48, 0.38, 0.4, 8),
      matte(ORANGE_DEEP, 0.7)
    );
    nest.position.set(0, 6.2, 1.25);
    root.add(nest);

    // 飄揚旗幟
    const flag = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.48, 1.25),
      matte(ORANGE_MAIN, 0.6)
    );
    flag.position.set(0, 7.15, 0.65);
    root.add(flag);
    animatedParts.flag = flag;

    // 船長站在尾樓
    const captain = createMinimalCharacter({
      cloakColor: CREAM,
      hatColor: isPlayer ? 0xf26b3a : 0x2c3e50,
      scale: 0.98
    });
    captain.position.set(0, 1.92, -2.1);
    root.add(captain);

    // 幾位同行小船員（增加熱鬧感）
    const crewSpots = [
      [-0.85, 1.14, 0.3],
      [0.85, 1.14, 2.1]
    ];
    crewSpots.forEach(([cx, cy, cz], i) => {
      const crew = createMinimalCharacter({
        cloakColor: i === 0 ? 0xf5e6d3 : 0xdceef2,
        hatColor: i === 0 ? 0x4ca6b5 : 0xf5a65b,
        scale: 0.78
      });
      crew.position.set(cx, cy, cz);
      root.add(crew);
    });

    // 船尾與船頭三盞暖光船燈
    const lanternPositions = [
      [-1.35, 2.25, -3.05],
      [1.35, 2.25, -3.05],
      [0, 1.65, 3.85]
    ];
    lanternPositions.forEach(([lx, ly, lz]) => {
      const lMat = new THREE.MeshStandardMaterial({
        color: 0xffe8a3,
        emissive: 0xffad33,
        emissiveIntensity: 0.5
      });
      const lMesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.22, 0), lMat);
      lMesh.position.set(lx, ly, lz);
      root.add(lMesh);
      lanternLights.push(lMat);
    });

    passengerSlot.set(-0.75, 1.14, 2.35);
  }

  // 柔和尾波水環
  const wakeRing = new THREE.Mesh(
    new THREE.RingGeometry(0.55 + tier * 0.35, 0.85 + tier * 0.42, 24),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide
    })
  );
  wakeRing.rotation.x = -Math.PI / 2;
  wakeRing.position.set(0, 0.06, -(1.2 + tier * 1.1));
  root.add(wakeRing);

  return {
    group: root,
    animatedParts,
    lanternLights,
    wakeRing,
    passengerSlot
  };
}
