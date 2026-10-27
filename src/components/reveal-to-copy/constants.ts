import { Easing } from "react-native-reanimated";

const MASK_GLYPH = "•";

const SIZES = {
  height: 52,
  button: 36,
  ring: 44,
  ringStroke: 2,
  fontSize: 17,
} as const;

const COLORS = {
  tint: "#0A84FF",
  success: "#30D158",
  ringTrack: "rgba(10, 132, 255, 0.18)",
} as const;

const TIMING = {
  revealDuration: 5000,
  copiedHold: 500,
  stagger: 28,
  hideStagger: 14,
  shimmerDelay: 160,
  shimmerDuration: 1520,
} as const;

const SHIMMER_BAND = 0.1;

const SHIMMER_DEPTH = 0.55;

const MORPH_SPRING = {
  damping: 15,
  stiffness: 190,
  mass: 0.9,
} as const;

const GLYPH_SPRING = {
  damping: 18,
  stiffness: 240,
  mass: 0.8,
} as const;

const ICON_SPRING = {
  damping: 16,
  stiffness: 260,
  mass: 0.7,
} as const;

const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1);

export {
  MASK_GLYPH,
  SIZES,
  COLORS,
  TIMING,
  SHIMMER_BAND,
  SHIMMER_DEPTH,
  MORPH_SPRING,
  GLYPH_SPRING,
  ICON_SPRING,
  EASE_OUT,
};
