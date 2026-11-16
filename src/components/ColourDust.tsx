"use client";

import { useEffect, useRef } from "react";

// Parked: not on the page for now, kept for a moment that earns it (e.g. sending the contact form).
// Coloured powder, like Holi gulal, kept quiet: nothing follows the cursor; a click releases a single soft
// puff of one colour that spreads and thins as it drifts on the breeze, then is gone. Each click takes the
// next colour along the palette.

const PALETTE = [
  [236, 110, 18], // saffron
  [250, 168, 26], // marigold
  [240, 200, 30], // turmeric
  [222, 44, 36], // vermilion
  [214, 28, 112], // magenta
  [120, 40, 170], // violet
  [36, 70, 190], // indigo
  [30, 150, 80], // leaf green
];
const MAX_CLOUDS = 160;
const CALM = 450; // ms: clicks closer together than this don't stack puffs
const SPRITES_PER_COLOUR = 4;
// The breeze, in px per frame: a steady drift to the right and a touch upward, like air moving across the
// page, which the clouds lean into.
const WIND = { x: 0.9, y: -0.12 };
// Scrolling moves the page sideways through the air: scroll on and the powder streams back past you the way
// the page travels; scroll back and it blows the other way. How strongly the scroll speed (px per frame)
// adds to the breeze.
const SCROLL_DRAG = 0.6;

type Cloud = { x: number; y: number; vx: number; vy: number; age: number; life: number; s0: number; grow: number; rot: number; spin: number; sprite: HTMLCanvasElement };

// smooth value noise, and the curl of it: swirling air that never piles up or empties
const hash = (x: number, y: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
};
const noise = (x: number, y: number) => {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
};
const curl = (x: number, y: number, t: number) => {
  const s = 0.006, e = 0.5, px = x * s + t * 0.12, py = y * s - t * 0.08;
  const dx = noise(px + e, py) - noise(px - e, py), dy = noise(px, py + e) - noise(px, py - e);
  return [dy, -dx];
};

// an irregular, lumpy cloud: dozens of soft blobs clustered towards the middle, faded at the rim
function cloudSprite([r, g, b]: number[]) {
  const S = 160, c = document.createElement("canvas");
  c.width = c.height = S;
  const p = c.getContext("2d")!;
  for (let i = 0; i < 46; i++) {
    const a = Math.random() * Math.PI * 2, d = Math.abs(Math.random() + Math.random() - 1) * S * 0.3;
    const x = S / 2 + Math.cos(a) * d, y = S / 2 + Math.sin(a) * d, rad = S * (0.06 + Math.random() * 0.16);
    const k = 0.75 + Math.random() * 0.45;
    const grad = p.createRadialGradient(x, y, 0, x, y, rad);
    const col = `${Math.min(255, r * k)},${Math.min(255, g * k)},${Math.min(255, b * k)}`;
    grad.addColorStop(0, `rgba(${col},${0.22 + Math.random() * 0.2})`);
    grad.addColorStop(1, `rgba(${col},0)`);
    p.fillStyle = grad;
    p.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
  // a fine grain through the cloud, so it reads as powder rather than smoke
  const img = p.getImageData(0, 0, S, S);
  for (let i = 3; i < img.data.length; i += 4) img.data[i] *= 0.7 + Math.random() * 0.6;
  p.putImageData(img, 0, 0);
  // soften the rim
  p.globalCompositeOperation = "destination-in";
  const rim = p.createRadialGradient(S / 2, S / 2, S * 0.15, S / 2, S / 2, S / 2);
  rim.addColorStop(0, "rgba(0,0,0,1)");
  rim.addColorStop(1, "rgba(0,0,0,0)");
  p.fillStyle = rim;
  p.fillRect(0, 0, S, S);
  return c;
}

export default function ColourDust() {
  const airRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const air = airRef.current!;
    const ctx = air.getContext("2d")!;
    let dpr = 1, vw = 0, vh = 0;
    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      vw = window.innerWidth;
      vh = window.innerHeight;
      air.width = Math.round(vw * dpr);
      air.height = Math.round(vh * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const sprites = PALETTE.map((c) => Array.from({ length: SPRITES_PER_COLOUR }, () => cloudSprite(c)));
    const clouds: Cloud[] = [];
    let hue = Math.random() * PALETTE.length;

    const pick = () => Math.floor(hue + (Math.random() - 0.5) * 1.3 + PALETTE.length) % PALETTE.length;

    const addCloud = (x: number, y: number, vx: number, vy: number, big = false) => {
      if (clouds.length >= MAX_CLOUDS) clouds.shift();
      const c = pick();
      clouds.push({
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 10,
        vx: vx * 0.12 + (Math.random() - 0.5) * (big ? 5 : 1.2),
        vy: vy * 0.12 + (Math.random() - 0.5) * (big ? 5 : 1.2),
        age: 0,
        life: (big ? 3.2 : 2.4) + Math.random() * 1.8,
        s0: (big ? 90 : 34) + Math.random() * (big ? 80 : 40),
        grow: 1.8 + Math.random() * 2.2,
        rot: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.5,
        sprite: sprites[c][Math.floor(Math.random() * SPRITES_PER_COLOUR)],
      });
    };

    // a single soft puff: four large clouds of one colour, settling into one shape
    let lastPuff = -1e9;
    const down = (e: PointerEvent) => {
      const now = performance.now();
      if (now - lastPuff < CALM) return;
      lastPuff = now;
      hue = Math.floor(hue + 1) % PALETTE.length;
      for (let i = 0; i < 4; i++) addCloud(e.clientX, e.clientY, 0, 0, true);
      wake();
    };

    let raf = 0, running = false, prev = 0;
    let lastScroll = 0, scrollV = 0;
    const wake = () => {
      if (running) return;
      running = true;
      prev = performance.now();
      lastScroll = window.scrollY;
      raf = requestAnimationFrame(frame);
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - prev) / 1000), f = dt * 60;
      prev = now;
      const t = now / 1000;
      // the scroll's speed, eased so a flick of the wheel reads as a gust rather than a jolt
      const y = window.scrollY;
      scrollV += ((lastScroll - y) / f - scrollV) * Math.min(1, 0.2 * f);
      lastScroll = y;
      const windX = WIND.x + scrollV * SCROLL_DRAG;
      ctx.clearRect(0, 0, vw, vh);

      // clouds: burst out, then slow and spread, turning as they thin
      for (let i = clouds.length - 1; i >= 0; i--) {
        const c = clouds[i];
        c.age += dt;
        if (c.age >= c.life) {
          clouds.splice(i, 1); // thinned out to nothing: nothing is left on the page
          continue;
        }
        const [cx, cy] = curl(c.x, c.y, t);
        c.vx = c.vx * (1 - 0.05 * f) + (cx * 0.25 + windX * 0.05) * f;
        c.vy = c.vy * (1 - 0.05 * f) + (cy * 0.25 + WIND.y * 0.05) * f;
        c.x += c.vx * f;
        c.y += c.vy * f;
        c.rot += c.spin * dt;
        const k = c.age / c.life;
        const size = c.s0 * (1 + (c.grow - 1) * (1 - (1 - k) ** 3));
        const alpha = Math.min(1, k / 0.05) * (1 - k) ** 1.6;
        ctx.globalAlpha = alpha * 0.55; // soft: a tint, not a splash
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.rot);
        ctx.drawImage(c.sprite, -size / 2, -size / 2, size, size);
        ctx.restore();
      }
      ctx.globalAlpha = 1;

      if (clouds.length) raf = requestAnimationFrame(frame);
      else running = false; // nothing in the air: rest until the next click
    };

    window.addEventListener("pointerdown", down);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    // Multiplied into the page like pigment: it tints the white and the footage, but colour over black
    // type stays black, so the powder reads as behind the text and the words stay crisp.
    <canvas
      ref={airRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-40 h-full w-full mix-blend-multiply"
    />
  );
}
