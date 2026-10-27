import type { IStretchConfig } from "./interface";

const DEFAULT_CONFIG: IStretchConfig = {
  width: 0.62,
  aspect: 1.38,
  depth: 0.3,
  lift: 0,
  fov: 2,
  radius: 32,
  sheen: 0.2,
  zone: 0.1,
  flip: 1,
  flipCurve: 2,
  stretch: 1.5,
  flare: 2.62,
  flarePow: 1.8,
  aberration: 2.03,
  blur: 12.6,
  smear: 0.14,
  saturation: 0.45,
  rim: 0.9,
  rimWidth: 0.2,
  rimHue: 52,
  speedZone: 0.1,
};
const DEFAULT_GAP = 16;
const MAX_FLIP = 0.5;
const MAX_HEIGHT = 0.9;
const FULL_SPEED = 4;
const VISIBLE_REACH = 2.5;
const FLING_CARRY = 0.16;
const SNAP_SPRING = {
  damping: 22,
  stiffness: 180,
  mass: 0.9,
} as const;
const DRAG_ACTIVATION = 28;
const DRAG_FAIL_Y = 4;

export {
  DEFAULT_CONFIG,
  DEFAULT_GAP,
  DRAG_ACTIVATION,
  DRAG_FAIL_Y,
  FLING_CARRY,
  FULL_SPEED,
  MAX_FLIP,
  MAX_HEIGHT,
  SNAP_SPRING,
  VISIBLE_REACH,
};
