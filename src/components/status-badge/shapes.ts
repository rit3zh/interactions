import type { IStatusShape, TPoint, TStatus } from "./interface";
import { arc, corner, dot, lerp, line } from "./utils";

function ring(span: number): number[] {
  return Array.from({ length: 8 }, (_, i) => arc(12, 12, 9, i * 45 - span / 2, i * 45 + span / 2)).flat();
}

function triangle(): number[] {
  const top: TPoint = [12, 3];
  const right: TPoint = [21.5, 19.8];
  const left: TPoint = [2.5, 19.8];
  const peak = corner(left, top, right, 2.6, 0.6);
  const rightFoot = corner(top, right, left, 2.6, 0.6);
  const leftFoot = corner(right, left, top, 2.6, 0.6);
  const rightMid = lerp(peak.end, rightFoot.start, 0.5);
  const leftMid = lerp(leftFoot.end, peak.start, 0.5);
  return [
    ...peak.points,
    ...line(peak.end, rightMid),
    ...line(rightMid, rightFoot.start),
    ...rightFoot.points,
    ...line(rightFoot.end, leftFoot.start),
    ...leftFoot.points,
    ...line(leftFoot.end, leftMid),
    ...line(leftMid, peak.start),
  ];
}

function frame(): number[] {
  const tl: TPoint = [3.5, 3.5];
  const tr: TPoint = [20.5, 3.5];
  const br: TPoint = [20.5, 20.5];
  const bl: TPoint = [3.5, 20.5];
  const brackets = [
    corner(tl, tr, br, 4.6, 0.85),
    corner(tr, br, bl, 4.6, 0.85),
    corner(br, bl, tl, 4.6, 0.85),
    corner(bl, tl, tr, 4.6, 0.85),
  ];
  return brackets.flatMap((bracket) => [...dot(bracket.start), ...bracket.points]);
}

const CIRCLE = ring(45);
const DASHED = ring(12);

const CENTER: TPoint = [12, 12];
const NO_GLYPH = [...dot(CENTER), ...dot(CENTER), ...dot(CENTER)];

const EXCLAMATION = [...line([12, 9], [12, 13.2]), ...dot([12, 16.4]), ...dot([12, 16.4])];

const CROSS = [
  ...line([9.3, 9.3], [14.7, 14.7]),
  ...line([14.7, 9.3], [9.3, 14.7]),
  ...dot(CENTER),
];

const CHECK = [
  ...line([8.3, 12.3], [10.9, 14.8]),
  ...line([10.9, 14.8], [15.7, 9.4]),
  ...dot([10.9, 14.8]),
];

const MAGNIFIER = [
  ...arc(11.3, 11.3, 2.6, 270, 450),
  ...arc(11.3, 11.3, 2.6, 90, 270),
  ...line([13.14, 13.14], [15.2, 15.2]),
];

const HANDS = [...line([12, 7.6], [12, 12]), ...line([12, 12], [14.8, 13.8]), ...dot(CENTER)];

const SHAPES: Record<TStatus, IStatusShape> = {
  pending: { points: [...triangle(), ...EXCLAMATION], glyph: true, spins: false },
  failed: { points: [...CIRCLE, ...CROSS], glyph: true, spins: false },
  success: { points: [...CIRCLE, ...CHECK], glyph: true, spins: false },
  progress: { points: [...DASHED, ...NO_GLYPH], glyph: false, spins: true },
  review: { points: [...frame(), ...MAGNIFIER], glyph: true, spins: false },
  expired: { points: [...CIRCLE, ...HANDS], glyph: true, spins: false },
  submitted: { points: [...CIRCLE, ...HANDS], glyph: true, spins: false },
};

export { SHAPES };
