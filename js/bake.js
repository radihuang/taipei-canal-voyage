import * as THREE from "three";

// 把一整群不會動的物件，依材質合併成少數幾個 Mesh。
// 地圖放大到 49 個街廓後，窗格與行道樹會有數萬個小物件；
// 每個物件一次 draw call 的話手機撐不住，合併後每個街廓只剩十幾次。
const nonIndexedCache = new WeakMap();

function getNonIndexed(geo) {
  let g = nonIndexedCache.get(geo);
  if (!g) {
    g = geo.index ? geo.toNonIndexed() : geo;
    if (!g.attributes.normal) g.computeVertexNormals();
    nonIndexedCache.set(geo, g);
  }
  return g;
}

export function bakeStatic(root, { castShadow = true, receiveShadow = true } = {}) {
  root.updateMatrixWorld(true);

  const buckets = new Map();
  root.traverse((o) => {
    if (!o.isMesh) return;
    const g = getNonIndexed(o.geometry);
    let b = buckets.get(o.material);
    if (!b) {
      b = { items: [], count: 0 };
      buckets.set(o.material, b);
    }
    b.items.push({ g, matrix: o.matrixWorld });
    b.count += g.attributes.position.count;
  });

  const out = new THREE.Group();
  const v = new THREE.Vector3();
  const nm = new THREE.Matrix3();

  for (const [material, b] of buckets) {
    const pos = new Float32Array(b.count * 3);
    const nor = new Float32Array(b.count * 3);
    let off = 0;
    for (const { g, matrix } of b.items) {
      const p = g.attributes.position;
      const n = g.attributes.normal;
      nm.getNormalMatrix(matrix);
      for (let i = 0; i < p.count; i++) {
        v.fromBufferAttribute(p, i).applyMatrix4(matrix);
        pos[off * 3] = v.x;
        pos[off * 3 + 1] = v.y;
        pos[off * 3 + 2] = v.z;
        v.fromBufferAttribute(n, i).applyMatrix3(nm).normalize();
        nor[off * 3] = v.x;
        nor[off * 3 + 1] = v.y;
        nor[off * 3 + 2] = v.z;
        off++;
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
    geo.computeBoundingSphere();
    const mesh = new THREE.Mesh(geo, material);
    mesh.castShadow = castShadow;
    mesh.receiveShadow = receiveShadow;
    out.add(mesh);
  }
  return out;
}
