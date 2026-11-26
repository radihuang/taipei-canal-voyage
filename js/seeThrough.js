import * as THREE from "three";

// 視線穿透：鏡頭到玩家之間被擋住的建築與樹，用網點透掉一部分，看起來像半透明。
// 城市幾何已依材質合併成大塊（bake.js），沒辦法逐棟調透明度，
// 所以改在 shader 裡判斷：這個像素在畫面上是否蓋住玩家周圍一圈，而且比玩家更靠近鏡頭。
// （用 3D 視線圓柱判斷會誤傷船前方地面上的樹，因為鏡頭是斜著往下看）
// 用網點（dither）而不是真透明，才不必處理透明物件的排序問題。

export const seeThroughUniforms = {
  uSeeCam: { value: new THREE.Vector3() },
  uSeeTarget: { value: new THREE.Vector3() },
  uSeeScreen: { value: new THREE.Vector2() }, // 玩家在畫布上的像素位置（gl_FragCoord 座標系）
  uSeeRadius: { value: 100.0 }, // 畫面上的穿透半徑（像素），每幀依畫布高度更新
  uSeeStrength: { value: 0.85 } // 最多透掉八成五像素
};

const patched = new WeakSet();

export function applySeeThrough(material) {
  if (patched.has(material)) return;
  patched.add(material);

  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, seeThroughUniforms);

    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vSeeWorld;")
      .replace(
        "#include <project_vertex>",
        "#include <project_vertex>\nvSeeWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;"
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
varying vec3 vSeeWorld;
uniform vec3 uSeeCam;
uniform vec3 uSeeTarget;
uniform vec2 uSeeScreen;
uniform float uSeeRadius;
uniform float uSeeStrength;

float seeBayer4(vec2 p) {
  int x = int(mod(p.x, 4.0));
  int y = int(mod(p.y, 4.0));
  int i = x + y * 4;
  float m[16] = float[16](0.0, 8.0, 2.0, 10.0, 12.0, 4.0, 14.0, 6.0,
                          3.0, 11.0, 1.0, 9.0, 15.0, 7.0, 13.0, 5.0);
  return (m[i] + 0.5) / 16.0;
}`
      )
      .replace(
        "#include <clipping_planes_fragment>",
        `#include <clipping_planes_fragment>
{
  vec3 seg = uSeeTarget - uSeeCam;
  float segLen = length(seg);
  vec3 dir = seg / max(segLen, 0.001);
  vec3 rel = vSeeWorld - uSeeCam;
  float t = dot(rel, dir);
  // 只處理地面以上、而且比玩家更靠近鏡頭的像素
  if (vSeeWorld.y > 1.6 && t > 0.0 && t < segLen - 2.5) {
    float px = distance(gl_FragCoord.xy, uSeeScreen);
    float fade = 1.0 - smoothstep(uSeeRadius * 0.55, uSeeRadius, px);
    if (fade * uSeeStrength > seeBayer4(gl_FragCoord.xy)) discard;
  }
}`
      );
  };
  material.needsUpdate = true;
}

const _ndc = new THREE.Vector3();
const _size = new THREE.Vector2();

// 每幀更新：視線兩端、玩家在畫布上的位置與穿透半徑
export function updateSeeThrough(camera, playerPos, renderer) {
  const u = seeThroughUniforms;
  u.uSeeCam.value.copy(camera.position);
  u.uSeeTarget.value.set(playerPos.x, 1.0, playerPos.z);

  renderer.getDrawingBufferSize(_size);
  _ndc.set(playerPos.x, 1.2, playerPos.z).project(camera);
  // gl_FragCoord 原點在左下角，NDC 的 y 向上，兩者方向一致
  u.uSeeScreen.value.set((_ndc.x * 0.5 + 0.5) * _size.x, (_ndc.y * 0.5 + 0.5) * _size.y);
  u.uSeeRadius.value = _size.y * 0.16;
}
