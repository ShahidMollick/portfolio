import { heroHold } from "@/components/Hero";

// The horizontal track, as scroll: after the hero's own sequence, each px scrolled carries the track one px
// sideways, except at its stops, where it holds still for a stretch. The named ones are sections that play
// while the page holds (About's timeline, the work's projects); the short ones, the detents, are a little
// friction at the start of a section, so it isn't left by accident (the page rests there for a moment's
// scroll before moving on). HorizontalPage sets them; everything that turns a place on the track into a
// scroll position (the dial, links to a section, the reveals) goes through here.
type Stop = { at: number; length: number; name?: string };
const named: Record<string, Stop> = {};
let detents: Stop[] = [];

export const setStop = (name: string, at: number, length: number) => { named[name] = { at, length, name }; };
export const setTrackHold = (at: number, length: number) => setStop("about", at, length);
export const setDetents = (ats: number[], length: number) => { detents = ats.map((at) => ({ at, length })); };
export const trackHold = () => named.about ?? { at: Infinity, length: 0 };

// every stop, in order along the track
const stops = () =>
  [...detents, ...Object.values(named)].filter((s) => s.length > 0 && Number.isFinite(s.at)).sort((a, b) => a.at - b.at);

// all the scroll the stops take between them
export const totalHold = () => stops().reduce((sum, s) => sum + s.length, 0);

// the page scroll at which the track has carried a point x px along it to the left edge (at a stop's place,
// the start of its stretch)
export const scrollForX = (x: number) => heroHold() + x + stops().reduce((sum, s) => sum + (x > s.at ? s.length : 0), 0);

// and back: how far along the track is at a page scroll, and how far through each named stop (0 before it,
// 1 past it); `hold` is About's
export function trackAt(scroll: number) {
  const s = Math.max(0, scroll - heroHold());
  const progress: Record<string, number> = {};
  for (const n of Object.keys(named)) progress[n] = 0;
  let held = 0, x: number | null = null;
  for (const stop of stops()) {
    const at = s - held; // where the track would be, past the stops so far
    if (at <= stop.at) break;
    if (at <= stop.at + stop.length) {
      x = stop.at;
      if (stop.name) progress[stop.name] = (at - stop.at) / stop.length;
      break;
    }
    held += stop.length;
    if (stop.name) progress[stop.name] = 1;
  }
  return { x: x ?? s - held, hold: progress.about ?? 0, progress };
}
