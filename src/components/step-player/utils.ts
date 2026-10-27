import { BAR, DOT, GAP, WAKE } from "./constants";
import type { IWake, IWave, TSlot } from "./interface";

function clamp01(value: number) {
  "worklet";
  return Math.min(1, Math.max(0, value));
}

function layout(count: number, at: number): TSlot[] {
  const slots: TSlot[] = [];
  let x = 0;
  for (let i = 0; i < count; i++) {
    const width = i === at ? BAR : DOT;
    slots.push([x, x + width]);
    x += width + GAP;
  }
  return slots;
}

function trackWidth(count: number) {
  return count > 0 ? (count - 1) * (DOT + GAP) + BAR : 0;
}

function getWake(index: number, wave: IWave): IWake | null {
  const span = Math.abs(wave.origin - wave.from);
  const skip = Math.max(0, span - WAKE.reach);
  const lo = Math.min(wave.from, wave.origin);
  const hi = Math.max(wave.from, wave.origin);

  if (index === wave.origin) {
    return { delay: Math.min(span, WAKE.reach) * WAKE.stagger, share: WAKE.self };
  }
  if (index >= lo && index <= hi) {
    const k = Math.abs(index - wave.from);
    if (span - k <= WAKE.reach) return { delay: (k - skip) * WAKE.stagger, share: 1 };
  }
  return null;
}

export { clamp01, layout, trackWidth, getWake };
