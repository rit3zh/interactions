import { LID_ANGLE, LID_LIFT, LID_PIVOT, SIZES } from "./constants";
import type { TPoint } from "./interface";

function mix(t: number, from: number, to: number) {
  "worklet";
  return from + (to - from) * t;
}

function clamp01(value: number) {
  "worklet";
  return Math.min(Math.max(value, 0), 1);
}

function cardHeight(header: number) {
  "worklet";
  return SIZES.padding * 2 + header + SIZES.headerGap + SIZES.button;
}

function buttonRow(width: number) {
  "worklet";
  const inner = Math.max(width - SIZES.padding * 2, 0);
  return { inner, half: Math.max((inner - SIZES.gap) / 2, 0) };
}

function dangerFrame(width: number, open: number, commit: number) {
  "worklet";
  const { inner, half } = buttonRow(width);
  const height = mix(open, SIZES.pill, SIZES.button);
  return {
    left: mix(open, 0, mix(commit, SIZES.padding + half + SIZES.gap, SIZES.padding)),
    width: mix(open, width, mix(commit, half, inner)),
    bottom: mix(open, 0, SIZES.padding),
    height,
  };
}

function lidPath(t: number) {
  "worklet";
  const angle = (t * LID_ANGLE * Math.PI) / 180;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const lift = t * LID_LIFT;
  const at = (x: number, y: number) => {
    const dx = x - LID_PIVOT[0];
    const dy = y - LID_PIVOT[1];
    const px = LID_PIVOT[0] + dx * cos - dy * sin;
    const py = LID_PIVOT[1] + dx * sin + dy * cos - lift;
    return `${px.toFixed(2)} ${py.toFixed(2)}`;
  };
  return (
    `M${at(3.5, 7)} L${at(20.5, 7)} ` +
    `M${at(9, 7)} L${at(9, 5)} Q${at(9, 3.8)} ${at(10.2, 3.8)} ` +
    `L${at(13.8, 3.8)} Q${at(15, 3.8)} ${at(15, 5)} L${at(15, 7)}`
  );
}

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function iconCenter(width: number, labelWidth: number, header: number, open: number): TPoint {
  "worklet";
  const group = SIZES.idleIcon + SIZES.idleGap + labelWidth;
  const closed: TPoint = [width / 2 - group / 2 + SIZES.idleIcon / 2, SIZES.pill / 2];
  const opened: TPoint = [
    SIZES.padding + SIZES.tile / 2,
    cardHeight(header) - SIZES.padding - SIZES.tile / 2,
  ];
  const across = 1 - (1 - open) * (1 - open);
  return [mix(across, closed[0], opened[0]), mix(open, closed[1], opened[1])];
}

export { mix, clamp01, cardHeight, buttonRow, dangerFrame, lidPath, wait, iconCenter };
