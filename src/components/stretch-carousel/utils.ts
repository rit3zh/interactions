import { FULL_SPEED, MAX_FLIP, MAX_HEIGHT, VISIBLE_REACH } from "./constants";
import type { IStretchConfig, IStretchFrame, IStretchLayout, TVec3 } from "./interface";

function wrap(slot: number, count: number) {
  "worklet";
  return slot - count * Math.floor(slot / count + 0.5);
}

function clamp(value: number, min: number, max: number) {
  "worklet";
  return Math.min(Math.max(value, min), max);
}

function measure(
  width: number,
  height: number,
  gap: number,
  config: IStretchConfig,
): IStretchLayout {
  const cardWidth = Math.min(width * config.width, (height * MAX_HEIGHT) / config.aspect);
  const cardHeight = cardWidth * config.aspect;
  const focal = height / 2 / Math.tan((config.fov * Math.PI) / 360);

  return {
    width,
    height,
    cardWidth,
    cardHeight,
    step: cardWidth + gap,
    focal,
  };
}

function frame(
  index: number,
  count: number,
  offset: number,
  velocity: number,
  layout: IStretchLayout,
  config: IStretchConfig,
): IStretchFrame {
  "worklet";
  const slot = wrap(index - offset, count);
  const distance = Math.abs(slot);
  const side = slot >= 0 ? 1 : -1;

  const rush = Math.min(Math.abs(velocity) / FULL_SPEED, 1);
  const zone = Math.max(0, config.zone - config.speedZone * rush);
  const raw = clamp((distance - zone) / Math.max(1 - zone, 0.001), 0, 1);
  const amount = raw * raw * (3 - 2 * raw);
  const angle = side * config.flip * MAX_FLIP * Math.pow(amount, config.flipCurve);

  const z = layout.focal + config.depth * layout.cardWidth * Math.min(distance, 1.5);
  const scale = z / layout.focal;
  const half = layout.cardWidth / 2;
  const inner = (slot * layout.step - side * half) * scale;
  const y = config.lift * layout.height * scale;

  return {
    center: [inner + side * half * Math.cos(angle), y, z + half * Math.abs(Math.sin(angle))],
    angle,
    side,
    amount,
    speed: Math.min(Math.abs(velocity), FULL_SPEED * 2),
    visible: distance < Math.min(VISIBLE_REACH, count / 2 - 0.5) ? 1 : 0,
  };
}

function rimColor(hue: number): TVec3 {
  const s = 0.9;
  const l = 0.62;
  const a = s * Math.min(l, 1 - l);
  const channel = (n: number) => {
    const k = (n + hue / 30) % 12;
    return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return [channel(0), channel(8), channel(4)];
}

function drawOrder(count: number, center: number) {
  return Array.from({ length: count }, (_, i) => i).sort(
    (a, b) => Math.abs(wrap(b - center, count)) - Math.abs(wrap(a - center, count)),
  );
}

export { wrap, clamp, measure, frame, rimColor, drawOrder };
