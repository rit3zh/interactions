import type { IPaperConfig } from "./interface";

const DEFAULT_CONFIG: IPaperConfig = {
  width: 0.7,
  aspect: 1.25,
  amount: 0.85,
  release: "restore",
  crease: 0.18,
  folds: 6,
  sharpness: 0.6,
  depth: 0.65,
  detail: 16,
  seed: 7,
  paper: "#F4F0E8",
  lightAngle: -35,
  ambient: 0.38,
  tilt: 10,
  returnToOrigin: true,
  shadow: 0.22,
};
const CRUMPLE_SPRING = { damping: 20, stiffness: 120, mass: 1 } as const;
const RELEASE_SPRING = { damping: 24, stiffness: 150, mass: 1 } as const;
const MOVE_SPRING = { damping: 20, stiffness: 170, mass: 0.9 } as const;
const TILT_SPRING = { damping: 22, stiffness: 240, mass: 0.6 } as const;
const FOCAL = 900;
const OCCLUSION = 0.35;
const MAX_HEIGHT = 0.82;
const TILT_SPEED = 1800;
const EDGE = 16;
const CRINKLE_STEP = 0.12;

export {
  CRINKLE_STEP,
  CRUMPLE_SPRING,
  DEFAULT_CONFIG,
  EDGE,
  FOCAL,
  MAX_HEIGHT,
  MOVE_SPRING,
  OCCLUSION,
  RELEASE_SPRING,
  TILT_SPEED,
  TILT_SPRING,
};
