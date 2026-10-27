import { Easing } from "react-native-reanimated";

import type { TQuad } from "./interface";

const DOT = 8;
const BAR = 36;
const GAP = 8;
const PAD = 14;
const HEIGHT = DOT + PAD * 2;

const CANVAS = DOT * 2;

const MARK_SIZE = 14;

const TIMING = {
  move: 520,
  lead: 60,
  rise: 300,
  ink: 260,
  mark: 300,
} as const;

const WAKE = {
  amp: 0.34,
  reach: 8,
  self: 0.3,
  stagger: 55,
} as const;

const EASE_MOVE = Easing.out(Easing.cubic);
const EASE_SWING = Easing.inOut(Easing.cubic);
const EASE_INK = Easing.bezier(0.25, 1, 0.5, 1);

const PRESS_SPRING = {
  damping: 16,
  stiffness: 260,
  mass: 0.7,
} as const;

const PAUSE_LEFT: TQuad = [6, 4, 10, 4, 10, 20, 6, 20];
const PLAY_LEFT: TQuad = [6.5, 4, 13.25, 8, 13.25, 16, 6.5, 20];
const PAUSE_RIGHT: TQuad = [14, 4, 18, 4, 18, 20, 14, 20];
const PLAY_RIGHT: TQuad = [13.25, 8, 20, 12, 20, 12, 13.25, 16];

const COLORS = {
  light: {
    track: "rgba(120, 120, 128, 0.28)",
    trackPressed: "rgba(120, 120, 128, 0.5)",
    fill: "#1C1C1E",
  },
  dark: {
    track: "rgba(120, 120, 128, 0.44)",
    trackPressed: "rgba(120, 120, 128, 0.7)",
    fill: "#FFFFFF",
  },
} as const;

export {
  DOT,
  BAR,
  GAP,
  PAD,
  HEIGHT,
  CANVAS,
  MARK_SIZE,
  TIMING,
  WAKE,
  EASE_MOVE,
  EASE_SWING,
  EASE_INK,
  PRESS_SPRING,
  PAUSE_LEFT,
  PLAY_LEFT,
  PAUSE_RIGHT,
  PLAY_RIGHT,
  COLORS,
};
