import { Skia } from "@shopify/react-native-skia";

import type { TVec3 } from "./interface";

function clamp(value: number, min: number, max: number) {
  "worklet";
  return Math.min(Math.max(value, min), max);
}

function toRGB<T extends string>(color: T): TVec3 {
  const [r, g, b] = Skia.Color(color);
  return [r, g, b];
}

export { clamp, toRGB };
