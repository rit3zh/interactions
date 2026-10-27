import { Skia } from "@shopify/react-native-skia";

import type { TVec3, TVec4 } from "./interface";

function clamp(value: number, min: number, max: number) {
  "worklet";
  return Math.min(Math.max(value, min), max);
}

function rubberBand(value: number, min: number, max: number, reach: number) {
  "worklet";
  if (value >= min && value <= max) return value;
  const over = value < min ? min - value : value - max;
  const eased = reach * (1 - 1 / (over / reach + 1));
  return value < min ? min - eased : max + eased;
}

function toRGB(color: string): TVec3 {
  const [r, g, b] = Skia.Color(color);
  return [r, g, b];
}

function toRGBA(color: string): TVec4 {
  const [r, g, b, a] = Skia.Color(color);
  return [r, g, b, a];
}

export { clamp, rubberBand, toRGB, toRGBA };
