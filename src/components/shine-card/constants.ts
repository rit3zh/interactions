import { FilterMode, MipmapMode } from "@shopify/react-native-skia";

import type { IShineConfig } from "./interface";

const DEFAULT_CONFIG: IShineConfig = {
  aspect: 1.4,
  radius: 28,
  color: "#FFF1DC",
  strength: 1.6,
  reach: 0.55,
  falloff: 2,
  glare: 0.35,
  tilt: 8,
};
const PRESS_SPRING = {
  damping: 18,
  stiffness: 260,
  mass: 0.6,
} as const;
const RELEASE_SPRING = {
  damping: 24,
  stiffness: 140,
  mass: 0.9,
} as const;
const PERSPECTIVE = 900;
const PRESSED_SCALE = 0.98;
const SHADOW = "0 18px 36px -12px rgba(0, 0, 0, 0.45)";
const SAMPLING = { filter: FilterMode.Linear, mipmap: MipmapMode.Linear };

export {
  DEFAULT_CONFIG,
  PERSPECTIVE,
  PRESSED_SCALE,
  PRESS_SPRING,
  RELEASE_SPRING,
  SAMPLING,
  SHADOW,
};
