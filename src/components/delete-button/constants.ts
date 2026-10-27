import { Easing } from "react-native-reanimated";

import type { IDeleteColors, TDeleteLabels } from "./interface";

const LABELS: TDeleteLabels = {
  idle: "Delete Account",
  confirm: "Hold to Delete",
  deleting: "Deleting…",
  deleted: "Account Deleted",
};

const TITLE = "Delete account?";
const MESSAGE =
  "This permanently removes your account and everyone on your family plan. It can't be undone.";
const CANCEL_LABEL = "Cancel";

const LIGHT_COLORS: IDeleteColors = {
  danger: "#F0283C",
  onDanger: "#FFFFFF",
  dangerTint: "rgba(240, 40, 60, 0.12)",
  holdFill: "rgba(110, 0, 12, 0.32)",
  card: "#FFFFFF",
  cardBorder: "rgba(20, 20, 26, 0.06)",
  shadow: "0 24px 48px -20px rgba(20, 20, 40, 0.28)",
  title: "#14141A",
  message: "#6E6E7A",
  neutral: "#14141A",
  onNeutral: "#FFFFFF",
};
const DARK_COLORS: IDeleteColors = {
  danger: "#FF3B4F",
  onDanger: "#FFFFFF",
  dangerTint: "rgba(255, 59, 79, 0.16)",
  holdFill: "rgba(70, 0, 8, 0.38)",
  card: "#1A1A21",
  cardBorder: "rgba(255, 255, 255, 0.08)",
  shadow: "0 24px 48px -20px rgba(0, 0, 0, 0.7)",
  title: "#F2F2F5",
  message: "#8C8C99",
  neutral: "#F2F2F5",
  onNeutral: "#14141A",
};

const SHIMMER_COLORS = [
  "rgba(255, 255, 255, 0)",
  "rgba(255, 255, 255, 0.3)",
  "rgba(255, 255, 255, 0)",
] as const;

const SIZES = {
  pill: 54,
  button: 48,
  padding: 16,
  gap: 10,
  headerGap: 22,
  radius: 40,
  tile: 44,
  tileRadius: 14,
  icon: 24,
  idleIcon: 19,
  idleGap: 7,
  stroke: 1.9,
  fontSize: 16,
  lineHeight: 22,
  shimmer: 96,
  shake: 6,
} as const;

const TIMING = {
  hold: 1400,
  label: 320,
  tint: 360,
  wiggleDelay: 140,
  wiggle: 170,
  minPending: 1100,
  doneHold: 2200,
  shimmer: 1150,
  shake: 55,
} as const;

const HOLD_TICKS = 10;

const TAP_THRESHOLD = 0.12;

const BLUR = 8;
const LABEL_BLUR = 4;
const LABEL_RISE = 7;

const LID_PIVOT = [20.5, 7] as const;
const LID_ANGLE = 30;
const LID_LIFT = 2.2;

const CHECK_LENGTH = 21;

const OPEN_SPRING = {
  damping: 19,
  stiffness: 190,
  mass: 1,
} as const;

const COMMIT_SPRING = {
  damping: 22,
  stiffness: 240,
  mass: 0.9,
} as const;

const DRAIN_SPRING = {
  damping: 20,
  stiffness: 220,
  mass: 0.8,
} as const;

const LID_SPRING = {
  damping: 7,
  stiffness: 340,
  mass: 0.5,
} as const;

const PRESS_SPRING = {
  damping: 18,
  stiffness: 320,
  mass: 0.6,
} as const;

const WIDTH_SPRING = {
  damping: 20,
  stiffness: 220,
  mass: 0.9,
} as const;

const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1);

export {
  LABELS,
  TITLE,
  MESSAGE,
  CANCEL_LABEL,
  LIGHT_COLORS,
  DARK_COLORS,
  SHIMMER_COLORS,
  SIZES,
  TIMING,
  HOLD_TICKS,
  TAP_THRESHOLD,
  BLUR,
  LABEL_BLUR,
  LABEL_RISE,
  LID_PIVOT,
  LID_ANGLE,
  LID_LIFT,
  CHECK_LENGTH,
  OPEN_SPRING,
  COMMIT_SPRING,
  DRAIN_SPRING,
  LID_SPRING,
  PRESS_SPRING,
  WIDTH_SPRING,
  EASE_OUT,
};
