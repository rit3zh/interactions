import type { IGlyph, TPoint } from "./interface";

function lerp(a: TPoint, b: TPoint, t: number): TPoint {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

function toward(from: TPoint, to: TPoint, distance: number): TPoint {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const length = Math.hypot(dx, dy);
  return [from[0] + (dx / length) * distance, from[1] + (dy / length) * distance];
}

function line(from: TPoint, to: TPoint): number[] {
  return [...from, ...lerp(from, to, 1 / 3), ...lerp(from, to, 2 / 3), ...to];
}

function dot(at: TPoint): number[] {
  return line(at, [at[0], at[1] + 0.01]);
}

function arc(cx: number, cy: number, r: number, from: number, to: number): number[] {
  const a0 = (from * Math.PI) / 180;
  const a1 = (to * Math.PI) / 180;
  const k = (4 / 3) * Math.tan((a1 - a0) / 4) * r;
  const p0: TPoint = [cx + r * Math.sin(a0), cy - r * Math.cos(a0)];
  const p3: TPoint = [cx + r * Math.sin(a1), cy - r * Math.cos(a1)];
  return [
    ...p0,
    p0[0] + k * Math.cos(a0),
    p0[1] + k * Math.sin(a0),
    p3[0] - k * Math.cos(a1),
    p3[1] - k * Math.sin(a1),
    ...p3,
  ];
}

function corner(prev: TPoint, vertex: TPoint, next: TPoint, reach: number, pull: number) {
  const start = toward(vertex, prev, reach);
  const end = toward(vertex, next, reach);
  return {
    start,
    end,
    points: [...start, ...lerp(start, vertex, pull), ...lerp(end, vertex, pull), ...end],
  };
}

function buildPath(from: number[], to: number[], t: number, start: number, end: number) {
  "worklet";
  let d = "";
  for (let i = start * 8; i < end * 8; i++) {
    const k = i % 8;
    if (k === 0) d += "M";
    else if (k === 2) d += "C";
    d += (from[i] + (to[i] - from[i]) * t).toFixed(2) + " ";
  }
  return d;
}

function toGlyphs(text: string): IGlyph[] {
  const seen: Record<string, number> = {};
  return Array.from(text).map((char) => {
    const count = seen[char] ?? 0;
    seen[char] = count + 1;
    return { char, key: `${char}-${count}` };
  });
}

export { lerp, line, dot, arc, corner, buildPath, toGlyphs };
