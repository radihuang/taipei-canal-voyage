import * as THREE from "three";

// 共用材質：同色同粗糙度只建一份，合併幾何時才能併成同一批
const matCache = new Map();
export function makeMat(color, roughness = 0.82) {
  const key = `${color}-${roughness}`;
  let m = matCache.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({
      color,
      roughness,
      metalness: 0.02,
      flatShading: true
    });
    matCache.set(key, m);
  }
  return m;
}

// 共用幾何（單位尺寸，靠 scale 調整）
const GEO = {
  trunk: new THREE.CylinderGeometry(0.13, 0.2, 1, 6),
  blob: new THREE.DodecahedronGeometry(1, 0),
  ico: new THREE.IcosahedronGeometry(1, 0),
  cone: new THREE.ConeGeometry(1, 1, 7),
  disc: new THREE.CylinderGeometry(1, 1, 1, 8),
  drop: new THREE.ConeGeometry(1, 1, 5),
  dot: new THREE.OctahedronGeometry(1, 0),
  // 葉片從根部往外長，旋轉時以葉柄為支點
  frond: new THREE.BoxGeometry(1, 1, 1).translate(0.5, 0, 0)
};

function part(g, geo, mat, [x, y, z], [sx, sy, sz], rotY = 0) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.scale.set(sx, sy, sz);
  m.rotation.y = rotY;
  g.add(m);
  return m;
}

const BARK = 0x8f735f;

// 八種台北常見行道樹的幾何造型（11 月底的樣子）
const BUILDERS = {
  // 樟樹：深綠、圓潤厚實的大樹冠
  camphor(g) {
    part(g, GEO.trunk, makeMat(BARK), [0, 0.8, 0], [1.25, 1.6, 1.25]);
    part(g, GEO.blob, makeMat(0x5d8f5e), [0, 2.35, 0], [1.25, 1.0, 1.25]);
    part(g, GEO.blob, makeMat(0x6e9f68), [0.55, 2.9, 0.2], [0.8, 0.7, 0.8]);
    part(g, GEO.blob, makeMat(0x5d8f5e), [-0.6, 2.7, -0.3], [0.75, 0.65, 0.75]);
  },

  // 臺灣欒樹：綠色樹冠頂上冒出金黃花序與粉紅蒴果
  goldenrain(g) {
    part(g, GEO.trunk, makeMat(BARK), [0, 0.8, 0], [1.1, 1.6, 1.1]);
    part(g, GEO.blob, makeMat(0x7da36a), [0, 2.4, 0], [1.15, 0.95, 1.15]);
    part(g, GEO.blob, makeMat(0xe8c547), [0.45, 3.1, 0.2], [0.55, 0.45, 0.55]);
    part(g, GEO.blob, makeMat(0xd98c7a), [-0.5, 3.0, -0.15], [0.55, 0.45, 0.55]);
    part(g, GEO.blob, makeMat(0xe8c547), [-0.1, 3.25, 0.55], [0.4, 0.35, 0.4]);
  },

  // 小葉欖仁：筆直主幹，枝葉一層層水平展開像塔
  terminalia(g) {
    part(g, GEO.trunk, makeMat(0x9a8f86), [0, 1.6, 0], [0.9, 3.2, 0.9]);
    [
      [1.55, 1.2],
      [1.25, 2.0],
      [0.95, 2.75],
      [0.6, 3.4]
    ].forEach(([r, y], i) => {
      part(g, GEO.disc, makeMat(i % 2 ? 0xa9cc85 : 0x98c27a), [0, y, 0], [r, 0.16, r], i * 0.3);
    });
  },

  // 白千層：米白樹皮，高瘦、灰綠微垂的樹冠
  melaleuca(g) {
    part(g, GEO.trunk, makeMat(0xe6dccb), [0, 1.1, 0], [1.3, 2.2, 1.3]);
    part(g, GEO.blob, makeMat(0x8fa88a), [0, 2.9, 0], [0.8, 1.25, 0.8]);
    part(g, GEO.blob, makeMat(0x9db597), [0.3, 2.2, 0.15], [0.6, 0.75, 0.6]);
    part(g, GEO.blob, makeMat(0x8fa88a), [-0.25, 3.7, -0.1], [0.5, 0.6, 0.5]);
  },

  // 楓香：三角錐樹形，11 月底開始轉橘紅
  sweetgum(g) {
    part(g, GEO.trunk, makeMat(BARK), [0, 0.7, 0], [1, 1.4, 1]);
    part(g, GEO.cone, makeMat(0x8aa35f), [0, 1.9, 0], [1.2, 1.6, 1.2]);
    part(g, GEO.cone, makeMat(0xdb8a4a), [0, 2.85, 0], [0.95, 1.4, 0.95], 0.4);
    part(g, GEO.cone, makeMat(0xc9643c), [0, 3.65, 0], [0.6, 1.0, 0.6], 0.8);
  },

  // 阿勃勒：圓樹冠下垂掛一串串黃花（花期在初夏，這裡取它最好認的樣子）
  goldenshower(g) {
    part(g, GEO.trunk, makeMat(BARK), [0, 0.8, 0], [1, 1.6, 1]);
    part(g, GEO.blob, makeMat(0x7aa262), [0, 2.55, 0], [1.1, 0.8, 1.1]);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const drop = part(
        g, GEO.drop, makeMat(0xf2cf3a, 0.6),
        [Math.cos(a) * 0.85, 1.75, Math.sin(a) * 0.85],
        [0.2, 0.75, 0.2]
      );
      drop.rotation.x = Math.PI;
    }
  },

  // 茄苳：粗壯樹幹，又大又圓的亮綠樹冠
  bishopwood(g) {
    part(g, GEO.trunk, makeMat(0x7d6553), [0, 0.8, 0], [1.6, 1.6, 1.6]);
    part(g, GEO.ico, makeMat(0x6aa257), [0, 2.55, 0], [1.45, 1.15, 1.45]);
    part(g, GEO.ico, makeMat(0x7bb265), [0.2, 3.25, 0.1], [0.9, 0.6, 0.9]);
  },

  // 大王椰子：灰白光滑的高瘦樹幹，頂端綠色葉鞘與一圈下垂的羽狀葉
  royalpalm(g) {
    part(g, GEO.trunk, makeMat(0xcfc8bd), [0, 2.1, 0], [1.25, 4.2, 1.25]);
    part(g, GEO.trunk, makeMat(0xc4bcb0), [0, 0.6, 0], [1.75, 1.2, 1.75]); // 基部略膨大
    part(g, GEO.disc, makeMat(0x7fa36a), [0, 4.55, 0], [0.2, 0.75, 0.2]); // 葉鞘
    const frondMats = [makeMat(0x6f9e5c), makeMat(0x82ad6a)];
    for (let i = 0; i < 8; i++) {
      const f = new THREE.Mesh(GEO.frond, frondMats[i % 2]);
      f.position.set(0, 4.95, 0);
      f.scale.set(1.9, 0.06, 0.42);
      f.rotation.order = "YZX"; // 先往下垂（z），再繞樹幹轉（y）
      f.rotation.y = (i / 8) * Math.PI * 2;
      f.rotation.z = i % 2 ? -0.55 : -0.25;
      g.add(f);
    }
  },

  // 苦楝：細枝撐開的傘形淡綠樹冠，點綴淡紫
  chinaberry(g) {
    part(g, GEO.trunk, makeMat(BARK), [0, 1.0, 0], [0.85, 2.0, 0.85]);
    part(g, GEO.blob, makeMat(0xa3c48a), [0, 2.55, 0], [1.35, 0.55, 1.35]);
    part(g, GEO.blob, makeMat(0xb1cf97), [0.3, 2.95, -0.2], [0.8, 0.4, 0.8]);
    [[0.7, 0.4], [-0.6, 0.5], [0.1, -0.8]].forEach(([x, z]) => {
      part(g, GEO.dot, makeMat(0xb9a3d6, 0.6), [x, 2.95, z], [0.22, 0.22, 0.22]);
    });
  }
};

export const SPECIES_KEYS = Object.keys(BUILDERS);

export function createTreeSpecies(species, x, y, z, scale = 1, rotY = 0) {
  const g = new THREE.Group();
  (BUILDERS[species] || BUILDERS.camphor)(g);
  g.position.set(x, y, z);
  g.rotation.y = rotY;
  g.scale.setScalar(scale);
  return g;
}
