// 岸邊樹上的尋寶：在玩家附近隨機挑幾棵行道樹藏動物，靠近才冒出「！」，點了就發現。
const ACTIVE_COUNT = 6; // 同時藏著的寶數量
const SPAWN_MIN = 30; // 新的寶離玩家至少這麼遠，不會一生出來就被看見
const SPAWN_MAX = 120;
const DESPAWN = 170; // 玩家走遠了就換個地方藏
const REVEAL = 13; // 運河寬 16，樹在岸邊；船開到樹旁的河道上就算靠近
const MARK_VISIBLE = 40; // 冒出「！」後，走開這麼遠才收起來

let nextId = 1;

export class TreasureManager {
  /**
   * @param trees 行道樹世界座標 [{x,y,z}]
   * @param animalKeys 可以藏的動物卡 key
   * @param isCollected (key) => 是否已收集；優先藏還沒收集的
   */
  constructor(trees, animalKeys, isCollected) {
    this.trees = trees;
    this.animalKeys = animalKeys;
    this.isCollected = isCollected;
    this.active = [];
  }

  update(playerPos) {
    const dist = (t) => Math.hypot(t.tree.x - playerPos.x, t.tree.z - playerPos.z);
    this.active = this.active.filter((t) => dist(t) < DESPAWN);
    for (const t of this.active) {
      const d = dist(t);
      if (d < REVEAL) t.revealed = true;
      t.distance = d;
    }
    while (this.active.length < ACTIVE_COUNT) {
      const t = this._spawn(playerPos);
      if (!t) break;
      this.active.push(t);
    }
    return this.active.filter((t) => t.revealed && t.distance < MARK_VISIBLE);
  }

  // 玩家點了「！」：拿走這個寶，回傳動物 key
  claim(id) {
    const i = this.active.findIndex((t) => t.id === id && t.revealed);
    if (i < 0) return null;
    const [t] = this.active.splice(i, 1);
    return { key: t.key, tree: t.tree };
  }

  _spawn(playerPos) {
    const usedTrees = new Set(this.active.map((t) => t.tree));
    const candidates = this.trees.filter((tr) => {
      if (usedTrees.has(tr)) return false;
      const d = Math.hypot(tr.x - playerPos.x, tr.z - playerPos.z);
      return d >= SPAWN_MIN && d <= SPAWN_MAX;
    });
    if (!candidates.length) return null;
    const tree = candidates[Math.floor(Math.random() * candidates.length)];

    const usedKeys = new Set(this.active.map((t) => t.key));
    const free = this.animalKeys.filter((k) => !usedKeys.has(k));
    const fresh = free.filter((k) => !this.isCollected(k));
    const pool = fresh.length ? fresh : free.length ? free : this.animalKeys;
    const key = pool[Math.floor(Math.random() * pool.length)];
    return { id: nextId++, tree, key, revealed: false, distance: Infinity };
  }
}
