import * as THREE from "three";
import { WALK_RADIUS } from "./city.js";

// 地面上隨機散步的行人：沿每個街廓外圈步道走，
// 能穿越的街廓會偶爾走中央十字步道。
// 全部行人共用三個 InstancedMesh（身體、頭、帽子），只佔三次 draw call。

const CLOTHES = [0xfdf5e6, 0x8fa3ba, 0xeac2bd, 0x99b8a9, 0xe9d8c5, 0x6f86a6, 0xd98c7a, 0xb9a3d6, 0xf2b857];
const HATS = [0xf2b857, 0x4ca6b5, 0xe38b9c, 0x7cb092, 0xfdf5e6, 0x8994c7, 0xe07a5f, 0x374151];

const R = WALK_RADIUS;
// 外圈 8 個節點（順時針），第 9 個是中心
const RING = [
  [-R, -R], [0, -R], [R, -R], [R, 0],
  [R, R], [0, R], [-R, R], [-R, 0]
];
const CENTER = 8;

function neighbors(node, allowCross) {
  if (node === CENTER) return [1, 3, 5, 7];
  const res = [(node + 1) % 8, (node + 7) % 8];
  if (allowCross && node % 2 === 1) res.push(CENTER);
  return res;
}

function nodePos(node) {
  return node === CENTER ? [0, 0] : RING[node];
}

export class PedestrianManager {
  constructor(scene, blocks, groundY) {
    this.groundY = groundY;
    this.people = [];

    blocks.forEach((b) => {
      const n = b.isPark ? 6 : 4;
      for (let i = 0; i < n; i++) {
        const from = Math.floor(Math.random() * 8);
        const nb = neighbors(from, b.allowCross);
        const to = nb[Math.floor(Math.random() * nb.length)];
        const t = Math.random();
        const [fx, fz] = nodePos(from);
        const [tx, tz] = nodePos(to);
        this.people.push({
          block: b,
          from,
          to,
          x: b.x + fx + (tx - fx) * t,
          z: b.z + fz + (tz - fz) * t,
          yaw: 0,
          speed: 1.1 + Math.random() * 0.9,
          pause: Math.random() < 0.3 ? Math.random() * 3 : 0,
          phase: Math.random() * Math.PI * 2,
          scale: 0.8 + Math.random() * 0.25,
          // 每人偏離步道中線一點，才不會排成一直線
          lane: (Math.random() * 2 - 1) * 0.6
        });
      }
    });

    const count = this.people.length;
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.72, metalness: 0.04, flatShading: true });
    const headMat = new THREE.MeshStandardMaterial({ color: 0x374151, roughness: 0.6, metalness: 0.04, flatShading: true });

    const bodyGeo = new THREE.ConeGeometry(0.32, 0.95, 8);
    const headGeo = new THREE.SphereGeometry(0.2, 8, 8);
    const hatGeo = new THREE.ConeGeometry(0.3, 0.42, 8);

    this.parts = [
      { mesh: new THREE.InstancedMesh(bodyGeo, whiteMat, count), y: 0.48 },
      { mesh: new THREE.InstancedMesh(headGeo, headMat, count), y: 1.04 },
      { mesh: new THREE.InstancedMesh(hatGeo, whiteMat, count), y: 1.32 }
    ];

    const c = new THREE.Color();
    this.people.forEach((p, i) => {
      this.parts[0].mesh.setColorAt(i, c.setHex(CLOTHES[Math.floor(Math.random() * CLOTHES.length)]));
      this.parts[2].mesh.setColorAt(i, c.setHex(HATS[Math.floor(Math.random() * HATS.length)]));
    });

    this.parts.forEach(({ mesh }) => {
      mesh.castShadow = true;
      mesh.frustumCulled = false; // 行人散在整張地圖，不能用單一包圍球裁切
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      scene.add(mesh);
    });

    this._m = new THREE.Matrix4();
    this._q = new THREE.Quaternion();
    this._s = new THREE.Vector3();
    this._v = new THREE.Vector3();
    this._up = new THREE.Vector3(0, 1, 0);
    this.update(0, 0);
  }

  update(dt, elapsed) {
    const { _m, _q, _s, _v, _up } = this;

    this.people.forEach((p, i) => {
      let walking = false;

      if (p.pause > 0) {
        p.pause -= dt;
      } else {
        const [tx, tz] = nodePos(p.to);
        // 依行進方向往右偏 lane，讓雙向行人錯開
        const [fx, fz] = nodePos(p.from);
        const len = Math.hypot(tx - fx, tz - fz) || 1;
        const ox = (-(tz - fz) / len) * p.lane;
        const oz = ((tx - fx) / len) * p.lane;
        const gx = p.block.x + tx + ox;
        const gz = p.block.z + tz + oz;
        const dx = gx - p.x;
        const dz = gz - p.z;
        const d = Math.hypot(dx, dz);

        if (d < 0.25) {
          const nb = neighbors(p.to, p.block.allowCross).filter((n) => n !== p.from);
          p.from = p.to;
          p.to = nb[Math.floor(Math.random() * nb.length)];
          if (Math.random() < 0.18) p.pause = 1 + Math.random() * 3;
        } else {
          const step = Math.min(d, p.speed * dt);
          p.x += (dx / d) * step;
          p.z += (dz / d) * step;
          const desired = Math.atan2(dx, dz);
          let diff = desired - p.yaw;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          p.yaw += diff * Math.min(1, dt * 8);
          walking = true;
        }
      }

      const bob = walking ? Math.abs(Math.sin(elapsed * 7 * p.speed + p.phase)) * 0.07 : 0;
      _q.setFromAxisAngle(_up, p.yaw);
      _s.setScalar(p.scale);

      this.parts.forEach(({ mesh, y }) => {
        _v.set(p.x, this.groundY + bob + y * p.scale, p.z);
        _m.compose(_v, _q, _s);
        mesh.setMatrixAt(i, _m);
      });
    });

    this.parts.forEach(({ mesh }) => {
      mesh.instanceMatrix.needsUpdate = true;
    });
  }
}
