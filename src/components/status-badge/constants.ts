import { Easing } from "react-native-reanimated";

import type { TStatus, TStatusTones } from "./interface";

const STATUSES: TStatus[] = [
  "pending",
  "failed",
  "success",
  "progress",
  "review",
  "expired",
  "submitted",
];

const LABELS: Record<TStatus, string> = {
  pending: "Pending",
  failed: "Failed",
  success: "Success",
  progress: "In progress",
  review: "In review",
  expired: "Expired",
  submitted: "Submitted",
};

const TONES: TStatusTones = {
  pending: { background: "#FFF5EA", foreground: "#E3A15F" },
  failed: { background: "#FCEFF0", foreground: "#CF6E62" },
  success: { background: "#EDFAF2", foreground: "#6BB872" },
  progress: { background: "#E2EFFC", foreground: "#3E8BEB" },
  review: { background: "#FEFCEA", foreground: "#E5B44C" },
  expired: { background: "#F3F3F3", foreground: "#7A7A7A" },
  submitted: { background: "#F4F2FE", foreground: "#6A3DE8" },
};

const SIZES = {
  height: 36,
  radius: 14,
  padding: 14,
  icon: 18,
  gap: 7,
  stroke: 2,
  fontSize: 16,
  lineHeight: 22,
} as const;

const OUTLINE_SEGMENTS = 8;
const GLYPH_SEGMENTS = 3;

const TIMING = {
  tint: 320,
  label: 280,
  glyphFade: 220,
  spin: 1400,
  settle: 520,
} as const;

const MORPH_SPRING = {
  damping: 15,
  stiffness: 200,
  mass: 0.8,
} as const;

const WIDTH_SPRING = {
  damping: 20,
  stiffness: 220,
  mass: 0.9,
} as const;

const PRESS_SPRING = {
  damping: 18,
  stiffness: 320,
  mass: 0.6,
} as const;

const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1);

export {
  STATUSES,
  LABELS,
  TONES,
  SIZES,
  OUTLINE_SEGMENTS,
  GLYPH_SEGMENTS,
  TIMING,
  MORPH_SPRING,
  WIDTH_SPRING,
  PRESS_SPRING,
  EASE_OUT,
};
