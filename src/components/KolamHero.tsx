"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

const PLASTER = "#f4f1ec";
const INK = "52, 46, 40"; // rgb of the kolam powder: a warm graphite
const SPACING = 34; // px between pulli (dots)
const REACH = 150; // px around the pointer where the kolam is drawn
const FADE = 0.985; // per-frame ink decay: the pattern lingers a few seconds, then returns to dots
const MIRROR_CHANCE = 0.32; // how often the line turns back between two dots (more = more closed loops)

type Piece = { ax: number; ay: number; cx: number; cy: number; bx: number; by: number; w: number; ink: number };

// A sikku (interlaced) kolam on an n×m grid of dots, traced with the mirror method: one line runs
// diagonally between the dots and reflects wherever it meets a mirror on the grid's edges. The border
// is always mirrored, so every path closes. Mirrors are placed with four-fold symmetry, as kolams are.
function traceKolam(n: number, m: number) {
  const V = Array.from({ length: n + 1 }, () => new Array<boolean>(m).fill(false)); // edges at x = i
  const Hz = Array.from({ length: n }, () => new Array<boolean>(m + 1).fill(false)); // edges at y = j
  for (let j = 0; j < m; j++) V[0][j] = V[n][j] = true;
  for (let i = 0; i < n; i++) Hz[i][0] = Hz[i][m] = true;
  for (let i = 1; i <= Math.floor(n / 2); i++)
    for (let j = 0; j < Math.ceil(m / 2); j++)
      if (Math.random() < MIRROR_CHANCE) V[i][j] = V[n - i][j] = V[i][m - 1 - j] = V[n - i][m - 1 - j] = true;
  for (let i = 0; i < Math.ceil(n / 2); i++)
    for (let j = 1; j <= Math.floor(m / 2); j++)
      if (Math.random() < MIRROR_CHANCE) Hz[i][j] = Hz[n - 1 - i][j] = Hz[i][m - j] = Hz[n - 1 - i][m - j] = true;

  // positions are in half units (×2) so every edge midpoint has integer coordinates
  const mirrored = (X: number, Y: number) => (X % 2 === 0 ? V[X / 2][(Y - 1) / 2] : Hz[(X - 1) / 2][Y / 2]);
  const seen = new Set<string>();
  const segKey = (x1: number, y1: number, x2: number, y2: number) =>
    x1 < x2 || (x1 === x2 && y1 < y2) ? `${x1},${y1},${x2},${y2}` : `${x2},${y2},${x1},${y1}`;
  const loops: [number, number][][] = [];
  const starts: [number, number][] = [];
  for (let X = 0; X <= 2 * n; X++) for (let Y = 0; Y <= 2 * m; Y++) if ((X + Y) % 2 === 1) starts.push([X, Y]);
  for (const [sx, sy] of starts)
    for (const [ddx, ddy] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
      const nx = sx + ddx, ny = sy + ddy;
      if (nx < 0 || ny < 0 || nx > 2 * n || ny > 2 * m || seen.has(segKey(sx, sy, nx, ny))) continue;
      const path: [number, number][] = [[sx, sy]];
      let x = sx, y = sy, dx = ddx, dy = ddy;
      for (let guard = 0; guard < 100000; guard++) {
        const x2 = x + dx, y2 = y + dy;
        seen.add(segKey(x, y, x2, y2));
        x = x2; y = y2;
        if (mirrored(x, y)) { if (x % 2 === 0) dx = -dx; else dy = -dy; }
        if (x === sx && y === sy && dx === ddx && dy === ddy) break;
        path.push([x, y]);
      }
      loops.push(path);
    }
  return loops;
}

export default function KolamHero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const canvas = el.querySelector("canvas")!;
      const ctx = canvas.getContext("2d")!;
      // the kolam is drawn on its own layer first, then broken up by powder grain before it reaches the screen
      const layer = document.createElement("canvas");
      const lctx = layer.getContext("2d")!;
      let grain: CanvasPattern | null = null;
      let pieces: Piece[] = [];
      let dots: { x: number; y: number; glow: number }[] = [];
      let w = 0, h = 0;

      // Build the grid to cover the hero, and turn each kolam loop into short curve pieces that can be
      // inked one by one: each piece runs between the midpoints of two steps, bending at the step's point.
      const build = () => {
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        w = el.clientWidth; h = el.clientHeight;
        canvas.width = layer.width = w * dpr; canvas.height = layer.height = h * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        lctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        // rice-flour grain: speckled alpha, mostly solid with scattered gaps and a few denser flecks
        const tile = document.createElement("canvas");
        tile.width = tile.height = 192;
        const tctx = tile.getContext("2d")!;
        const img = tctx.createImageData(192, 192);
        for (let i = 0; i < img.data.length; i += 4) {
          const r = Math.random();
          img.data[i + 3] = 255 * (r < 0.18 ? r * 1.5 : 0.55 + 0.45 * r);
        }
        tctx.putImageData(img, 0, 0);
        grain = lctx.createPattern(tile, "repeat");
        grain?.setTransform(new DOMMatrix().scale(1 / dpr));
        const n = Math.ceil(w / SPACING) + 1, m = Math.ceil(h / SPACING) + 1;
        const ox = (w - n * SPACING) / 2, oy = (h - m * SPACING) / 2;
        const at = (X: number, Y: number) => [ox + (X / 2) * SPACING, oy + (Y / 2) * SPACING];
        pieces = [];
        for (const loop of traceKolam(n, m)) {
          const L = loop.length, phase = Math.random() * 6;
          for (let k = 0; k < L; k++) {
            const [px, py] = at(...loop[(k - 1 + L) % L]), [qx, qy] = at(...loop[k]), [rx, ry] = at(...loop[(k + 1) % L]);
            pieces.push({
              ax: (px + qx) / 2, ay: (py + qy) / 2, bx: (qx + rx) / 2, by: (qy + ry) / 2,
              // a hand-drawn wobble at each bend (the shared ends stay put so the line stays continuous)
              cx: qx + (Math.random() - 0.5) * 2.6, cy: qy + (Math.random() - 0.5) * 2.6,
              // pressure swells and thins gently along the loop
              w: 2.1 + 0.6 * Math.sin(k * 0.55 + phase),
              ink: 0,
            });
          }
        }
        dots = [];
        for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) dots.push({ x: ox + (i + 0.5) * SPACING, y: oy + (j + 0.5) * SPACING, glow: 0 });
      };

      const pen = { x: -1e4, y: -1e4, on: false };
      const inkAround = (x: number, y: number) => {
        for (const p of pieces) {
          const d = Math.hypot(p.cx - x, p.cy - y);
          if (d < REACH) p.ink = Math.min(1, p.ink + (1 - d / REACH) ** 2 * 0.22);
        }
        for (const d of dots) {
          const r = Math.hypot(d.x - x, d.y - y);
          if (r < REACH) d.glow = Math.min(1, d.glow + (1 - r / REACH) ** 2 * 0.22);
        }
      };

      let blank = true;
      const draw = () => {
        if (pen.on) inkAround(pen.x, pen.y);
        let any = false;
        lctx.clearRect(0, 0, w, h);
        lctx.lineCap = "round";
        // dots exist only where the pen has been: small powder dabs
        for (const d of dots) {
          if (d.glow < 0.01) { d.glow = 0; continue; }
          any = true;
          lctx.fillStyle = `rgba(${INK}, ${d.glow * 0.75})`;
          lctx.beginPath();
          lctx.arc(d.x, d.y, 1.6 + d.glow * 0.9, 0, Math.PI * 2);
          lctx.fill();
          d.glow *= FADE;
        }
        for (const p of pieces) {
          if (p.ink < 0.01) { p.ink = 0; continue; }
          any = true;
          lctx.beginPath();
          lctx.moveTo(p.ax, p.ay);
          lctx.quadraticCurveTo(p.cx, p.cy, p.bx, p.by);
          // a soft spread of loose powder, then the line itself
          lctx.strokeStyle = `rgba(${INK}, ${p.ink * 0.12})`;
          lctx.lineWidth = p.w * 2.6;
          lctx.stroke();
          lctx.strokeStyle = `rgba(${INK}, ${p.ink * 0.78})`;
          lctx.lineWidth = p.w;
          lctx.stroke();
          p.ink *= FADE;
        }
        if (!any && blank) return; // nothing inked: leave the plain plaster alone
        blank = !any;
        if (grain) {
          lctx.globalCompositeOperation = "destination-in";
          lctx.fillStyle = grain;
          lctx.fillRect(0, 0, w, h);
          lctx.globalCompositeOperation = "source-over";
        }
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(layer, 0, 0, w, h);
      };

      const local = (e: PointerEvent) => { const b = el.getBoundingClientRect(); pen.x = e.clientX - b.left; pen.y = e.clientY - b.top; };
      const move = (e: PointerEvent) => { local(e); pen.on = true; ghost.kill(); };
      const leave = () => { pen.on = false; };

      build();
      // a ghost pen traces one loop after the preloader, so visitors see that the page responds
      const g = { t: 0 };
      const ghost = gsap.to(g, {
        t: 1, duration: 2.6, delay: 5.2, ease: "power1.inOut",
        onStart: () => { pen.on = true; },
        onUpdate: () => {
          const a = g.t * Math.PI * 2;
          pen.x = w * (0.5 + 0.22 * Math.sin(a)); pen.y = h * (0.55 + 0.16 * Math.sin(2 * a));
        },
        onComplete: () => { pen.on = false; },
      });

      const onResize = () => build();
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerdown", move);
      el.addEventListener("pointerleave", leave);
      window.addEventListener("resize", onResize);
      gsap.ticker.add(draw);
      return () => {
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerdown", move);
        el.removeEventListener("pointerleave", leave);
        window.removeEventListener("resize", onResize);
        gsap.ticker.remove(draw);
        ghost.kill();
      };
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative h-svh overflow-hidden" style={{ backgroundColor: PLASTER }}>
      <canvas aria-hidden="true" className="absolute inset-0 h-full w-full" />
    </section>
  );
}
