import gsap from "gsap";

// how much of the page's scroll the work takes, per step of it, in screen heights (as HorizontalPage gives it)
export const PER = 0.9;

// A drawer pulled out, drawn as a cabinet-maker would sketch it: in oblique, the front coming toward you
// down and to the left, the box's open top and right side showing behind it. DX and DY are how far the front
// has come at full pull, as shares of the drawer's own width and height.
const DX = -0.11, DY = 0.4;
// each card's place in the drawer, from its back (0) to its front (1), the front card first
const DEPTH = [0.8, 0.64, 0.48, 0.32, 0.2];

// every drawer's rig, by its element (so the opened one can start from where its cabinet one was)
export const rigOf = new WeakMap<HTMLElement, DrawerRig>();

type Raise = { duration: number; ease: string; stagger?: number; delay?: number; backFirst?: boolean };

// One drawer's moving parts (see Work.tsx for the markup): the front, the open top (the floor seen from
// above), the right side, and the cards standing inside. Everything moves by tweens with real easing (so a
// drawer gathers speed, glides and settles, the same at any frame rate): `pull` slides the drawer out (0, in
// its slot, to 1, all the way), `raise` lifts the cards out of it one after another, `pick` lifts one card
// further. Each sets a target and the tween takes over from wherever things are, so a move can be
// interrupted midway without a jump. It's drawn once a frame, only when something changed.
export class DrawerRig {
  s = { t: 0 };
  lifts: { v: number }[];
  picks: { v: number }[];
  W = 0;
  H = 0;
  private front: HTMLElement | null;
  private floor: SVGPolygonElement | null;
  private shade: SVGPolygonElement | null;
  private side: SVGPolygonElement | null;
  private svgs: SVGSVGElement[];
  private cards: HTMLElement[];
  private ro: ResizeObserver;
  private dirty = true;
  private mark = () => { this.dirty = true; };
  private tick = () => {
    if (!this.dirty) return;
    this.dirty = false;
    this.draw();
  };

  constructor(public el: HTMLElement) {
    this.front = el.querySelector("[data-dr-front]");
    this.floor = el.querySelector("[data-dr-floor]");
    this.shade = el.querySelector("[data-dr-shade]");
    this.side = el.querySelector("[data-dr-side]");
    this.svgs = [...el.querySelectorAll<SVGSVGElement>("[data-dr-svg]")];
    this.cards = [...el.querySelectorAll<HTMLElement>("[data-dr-card]")];
    this.lifts = this.cards.map(() => ({ v: 0 }));
    this.picks = this.cards.map(() => ({ v: 0 }));
    this.ro = new ResizeObserver(() => this.measure());
    this.ro.observe(el);
    this.measure();
    gsap.ticker.add(this.tick);
    rigOf.set(el, this);
  }

  get t() {
    return this.s.t;
  }

  private measure() {
    this.W = this.el.offsetWidth;
    this.H = this.el.offsetHeight;
    // the cards: a little narrower than the drawer, and never taller than it (so none shows under the front)
    const cw = this.W * 0.74, ch = this.H * 0.92;
    this.cards.forEach((c) => {
      c.style.width = `${cw}px`;
      c.style.height = `${ch}px`;
    });
    this.svgs.forEach((s) => {
      s.setAttribute("width", String(this.W));
      s.setAttribute("height", String(this.H));
    });
    this.draw();
  }

  // straight to a state, no motion
  set(t: number, lifts: number[] = []) {
    gsap.killTweensOf([this.s, ...this.lifts, ...this.picks]);
    this.s.t = t;
    this.lifts.forEach((l, i) => { l.v = lifts[i] ?? 0; });
    this.picks.forEach((p) => { p.v = 0; });
    this.mark();
  }

  // slide the drawer to `t`
  pull(t: number, duration: number, ease: string, delay = 0) {
    return gsap.to(this.s, { t, duration, ease, delay, overwrite: true, onUpdate: this.mark });
  }

  // lift the cards to their heights (in drawer heights), one after another
  raise(height: (i: number) => number, { duration, ease, stagger = 0, delay = 0, backFirst = false }: Raise) {
    const n = this.lifts.length;
    this.lifts.forEach((l, i) => {
      gsap.to(l, {
        v: height(i),
        duration,
        ease,
        delay: delay + stagger * (backFirst ? n - 1 - i : i),
        overwrite: true,
        onUpdate: this.mark,
      });
    });
  }

  // lift one card a little further out than the rest (-1: none)
  pick(k: number, reduce = false) {
    this.picks.forEach((p, i) => {
      const up = i === k;
      if ((up ? 1 : 0) === p.v) return;
      gsap.to(p, {
        v: up ? 1 : 0,
        duration: reduce ? 0 : up ? 0.3 : 0.25,
        ease: "power3.inOut",
        overwrite: true,
        onUpdate: this.mark,
      });
    });
  }

  draw() {
    const { W, H, t } = this;
    if (!W) return;
    const dx = DX * W * t, dy = DY * H * t;
    if (this.front) this.front.style.transform = `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0)`;
    const top = `0,0 ${W},0 ${W + dx},${dy} ${dx},${dy}`;
    this.floor?.setAttribute("points", top);
    this.shade?.setAttribute("points", top);
    this.side?.setAttribute("points", `${W + dx},${dy} ${W},0 ${W},${H} ${W + dx},${dy + H}`);
    // in its slot, it's only its front: flat, nothing behind it drawn
    const shown = t > 0.002 ? "1" : "0";
    this.svgs.forEach((s) => { s.style.opacity = shown; });
    // pulled out, or its files up, it comes over its neighbours
    this.el.style.zIndex = t > 0.002 || this.lifts.some((l) => l.v > 0.001) ? "2" : "";
    const cw = W * 0.74;
    this.cards.forEach((c, i) => {
      const f = DEPTH[i] ?? DEPTH[DEPTH.length - 1];
      const x = (W - cw) / 2 + dx * f;
      // standing on the floor at its depth, lifted out of it by its own lift, and further if picked
      const y = dy * f - H * (this.lifts[i].v + 0.3 * this.picks[i].v);
      c.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
    });
  }

  destroy() {
    gsap.ticker.remove(this.tick);
    gsap.killTweensOf([this.s, ...this.lifts, ...this.picks]);
    this.ro.disconnect();
    rigOf.delete(this.el);
  }
}

// The cabinet, through the work's stop (see Work.tsx). At rest every drawer is shut, flush with the cabinet.
// Under the cursor (or the keyboard) one slides out partway, quickly, eased in and out, and its files rise
// a touch inside it; leaving, they sink and it slides shut. Clicking opens it, which Work itself does.
export function workMotion(section: HTMLElement, reduce: boolean) {
  const d = (s: number) => (reduce ? 0 : s);
  const rigs = [...section.querySelectorAll<HTMLElement>("[data-wk-drawer]")].map((el) => new DrawerRig(el));
  const cleanups = rigs.map((r) => {
    let near = false;
    const on = () => {
      if (near || section.dataset.open !== undefined) return;
      near = true;
      // it slides out partway, and its files rise a touch inside it, back ones first, tabs showing
      r.pull(0.32, d(0.36), "power3.inOut");
      r.raise((i) => 0.03 + 0.035 * i, { duration: d(0.32), ease: "power3.inOut", stagger: d(0.03), delay: d(0.08), backFirst: true });
    };
    const off = () => {
      if (!near) return;
      near = false;
      r.raise(() => 0, { duration: d(0.2), ease: "power3.inOut", stagger: d(0.015) });
      r.pull(0, d(0.32), "power3.inOut", d(0.05));
    };
    const enter = (e: PointerEvent) => { if (e.pointerType === "mouse") on(); };
    r.el.addEventListener("pointerenter", enter);
    r.el.addEventListener("pointerleave", off);
    r.el.addEventListener("focusin", on);
    r.el.addEventListener("focusout", off);
    // (taken out of the cabinet, it forgets it was being pointed at: it comes back shut)
    const reset = () => { near = false; };
    r.el.addEventListener("drawer:reset", reset);
    return () => {
      r.el.removeEventListener("pointerenter", enter);
      r.el.removeEventListener("pointerleave", off);
      r.el.removeEventListener("focusin", on);
      r.el.removeEventListener("focusout", off);
      r.el.removeEventListener("drawer:reset", reset);
    };
  });

  // (the scroll through the stop no longer moves the drawers: at rest the cabinet stays flat)
  const draw = (progress: number) => { void progress; };
  return Object.assign(draw, {
    kill: () => {
      cleanups.forEach((c) => c());
      rigs.forEach((r) => r.destroy());
    },
  });
}
