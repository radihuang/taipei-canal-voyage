// 鍵盤（WASD / 方向鍵）＋ 手機觸控虛擬搖桿與互動控制

export class InputController {
  constructor({ onGreet, onBoard, onZoom }) {
    this.keys = new Set();
    this.joyVec = { x: 0, y: 0 };
    this.onGreet = onGreet;
    this.onBoard = onBoard;
    this.onZoom = onZoom;

    this._bindKeyboard();
    this._bindJoystick();
    this._bindActionButtons();
    this._bindZoom();
  }

  _bindKeyboard() {
    window.addEventListener("keydown", (e) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) {
        e.preventDefault();
      }
      this.keys.add(e.code);

      if (e.code === "Space" && !e.repeat) {
        this.onGreet?.();
      }
      if ((e.code === "KeyE" || e.code === "Enter") && !e.repeat) {
        this.onBoard?.();
      }
    });

    window.addEventListener("keyup", (e) => {
      this.keys.delete(e.code);
    });

    window.addEventListener("blur", () => {
      this.keys.clear();
    });
  }

  _bindJoystick() {
    const zone = document.getElementById("joystick-zone");
    const base = document.getElementById("joystick-base");
    const knob = document.getElementById("joystick-knob");
    if (!zone || !base || !knob) return;

    let activePointerId = null;
    const maxRadius = 36;

    const updateStick = (clientX, clientY) => {
      const rect = base.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      let dx = clientX - cx;
      let dy = clientY - cy;
      const dist = Math.hypot(dx, dy);

      if (dist > maxRadius) {
        dx = (dx / dist) * maxRadius;
        dy = (dy / dist) * maxRadius;
      }

      knob.style.transform = `translate(${dx}px, ${dy}px)`;
      this.joyVec.x = dx / maxRadius;
      this.joyVec.y = dy / maxRadius;
    };

    const resetStick = () => {
      activePointerId = null;
      knob.style.transform = "translate(0px, 0px)";
      this.joyVec.x = 0;
      this.joyVec.y = 0;
    };

    zone.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      activePointerId = e.pointerId;
      zone.setPointerCapture(e.pointerId);
      updateStick(e.clientX, e.clientY);
    });

    zone.addEventListener("pointermove", (e) => {
      if (e.pointerId !== activePointerId) return;
      e.preventDefault();
      updateStick(e.clientX, e.clientY);
    });

    zone.addEventListener("pointerup", (e) => {
      if (e.pointerId !== activePointerId) return;
      resetStick();
    });

    zone.addEventListener("pointercancel", (e) => {
      if (e.pointerId !== activePointerId) return;
      resetStick();
    });
  }

  _bindActionButtons() {
    const greetBtn = document.getElementById("btn-greet");
    const boardBtn = document.getElementById("btn-board");

    greetBtn?.addEventListener("click", () => this.onGreet?.());
    boardBtn?.addEventListener("click", () => this.onBoard?.());
  }

  _bindZoom() {
    window.addEventListener(
      "wheel",
      (e) => {
        if (Math.abs(e.deltaY) > 0) {
          this.onZoom?.(e.deltaY * 0.0015);
        }
      },
      { passive: true }
    );

    // 雙指捏合縮放（手機支援）
    let prevPinchDist = null;
    const canvasEl = document.getElementById("canvas-container");
    canvasEl?.addEventListener(
      "touchmove",
      (e) => {
        if (e.touches.length === 2) {
          const d = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
          );
          if (prevPinchDist !== null) {
            this.onZoom?.((prevPinchDist - d) * 0.004);
          }
          prevPinchDist = d;
        }
      },
      { passive: true }
    );

    canvasEl?.addEventListener("touchend", () => {
      prevPinchDist = null;
    });

    // iPhone Safari 的整頁縮放走 gesture 事件（只有 WebKit 有），擋掉它不影響上面用 touchmove 做的鏡頭縮放。
    // 已經被放大時不擋，讓玩家還能捏回去。
    const blockPageZoom = (e) => {
      if ((window.visualViewport?.scale ?? 1) <= 1.01) e.preventDefault();
    };
    for (const type of ["gesturestart", "gesturechange"]) {
      document.addEventListener(type, blockPageZoom, { passive: false });
    }

    // iPhone 連點兩下會放大整頁（double-tap zoom），gesture 事件與 touch-action 都擋不到它。
    // 兩次觸控結束間隔很短時，取消第二下的預設行為；取消後 Safari 不會再送 click，
    // 所以第二下若點在按鈕或連結上，自己補一次 click，連點按鈕照樣有反應。
    let lastTouchEnd = 0;
    document.addEventListener(
      "touchend",
      (e) => {
        const now = performance.now();
        if (e.touches.length === 0 && e.changedTouches.length === 1 && now - lastTouchEnd < 350) {
          e.preventDefault();
          e.target.closest?.("button, a[href]")?.click();
        }
        lastTouchEnd = now;
      },
      { passive: false }
    );

    this._bindPageZoomRecovery();
  }

  // 還是被放大時的退路：整頁放行雙指（css 的 html.page-zoomed），並在可見範圍上方顯示「還原畫面大小」
  _bindPageZoomRecovery() {
    const vv = window.visualViewport;
    const btn = document.getElementById("zoom-reset");
    if (!vv || !btn) return;
    const root = document.documentElement;
    const sync = () => {
      const zoomed = vv.scale > 1.01;
      root.classList.toggle("page-zoomed", zoomed);
      btn.classList.toggle("hidden", !zoomed);
      if (zoomed) {
        // 放大時 position: fixed 是對整頁定位，要換算到使用者正在看的那一塊，並縮回正常大小
        btn.style.left = `${vv.offsetLeft + vv.width / 2}px`;
        btn.style.top = `${vv.offsetTop + 12 / vv.scale}px`;
        btn.style.transform = `translateX(-50%) scale(${1 / vv.scale})`;
        btn.style.transformOrigin = "top center";
      }
    };
    vv.addEventListener("resize", sync);
    vv.addEventListener("scroll", sync);
    btn.addEventListener("click", () => {
      // 改一次 viewport 設定會讓 Safari 重新套用縮放上限、跳回原尺寸；之後換回原本的設定
      const meta = document.querySelector('meta[name="viewport"]');
      if (!meta) return;
      const original = meta.getAttribute("content");
      meta.setAttribute("content", "width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover");
      setTimeout(() => {
        meta.setAttribute("content", original);
        sync();
      }, 400);
    });
    sync();
  }

  /**
   * 回傳螢幕平面方向向量 { x: 右正左負, y: 下正上負 }
   */
  getMoveVector() {
    let x = this.joyVec.x;
    let y = this.joyVec.y;

    if (this.keys.has("KeyW") || this.keys.has("ArrowUp")) y -= 1;
    if (this.keys.has("KeyS") || this.keys.has("ArrowDown")) y += 1;
    if (this.keys.has("KeyA") || this.keys.has("ArrowLeft")) x -= 1;
    if (this.keys.has("KeyD") || this.keys.has("ArrowRight")) x += 1;

    const mag = Math.hypot(x, y);
    if (mag > 1) {
      x /= mag;
      y /= mag;
    }
    return { x, y, magnitude: Math.min(1, mag) };
  }
}
