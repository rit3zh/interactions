import type { IGlowSliderColors, IGlowSliderConfig } from "./interface";

const DEFAULT_CONFIG: IGlowSliderConfig = {
  height: 44,
  inset: 5,
  tint: "#8C72E0",
  knob: "#FFFFFF",
};
const COLORS: Record<"light" | "dark", IGlowSliderColors> = {
  light: {
    track: "rgba(120, 120, 128, 0.16)",
    mark: "rgba(60, 60, 67, 0.3)",
    markLit: "rgba(255, 255, 255, 0.6)",
  },
  dark: {
    track: "rgba(255, 255, 255, 0.07)",
    mark: "rgba(255, 255, 255, 0.3)",
    markLit: "rgba(255, 255, 255, 0.55)",
  },
};

const FOLLOW_SPRING = {
  damping: 26,
  stiffness: 520,
  mass: 0.5,
} as const;
const SNAP_SPRING = {
  damping: 18,
  stiffness: 240,
  mass: 0.7,
} as const;
const PRESS_SPRING = {
  damping: 18,
  stiffness: 260,
  mass: 0.6,
} as const;

const OVERDRAG = 0.35;
const PROJECTION = 0.08;

export { COLORS, DEFAULT_CONFIG, FOLLOW_SPRING, OVERDRAG, PRESS_SPRING, PROJECTION, SNAP_SPRING };
