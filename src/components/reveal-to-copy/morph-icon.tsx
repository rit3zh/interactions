import { useEffect } from "react";
import Animated, {
  interpolateColor,
  useAnimatedProps,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle, Path } from "react-native-svg";

import { EASE_OUT, MORPH_SPRING } from "./constants";
import type { IMorphIconProps, TPoint, TRevealState } from "./interface";

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function line(from: TPoint, to: TPoint): number[] {
  const at = (t: number) => [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t];
  return [...at(1 / 3), ...at(2 / 3), ...to];
}

const SHAPES: Record<TRevealState, number[]> = {
  hidden: [
    12, 5.5,
    8, 5.5, 4.5, 8, 2, 12,
    4.5, 16, 8, 18.5, 12, 18.5,
    16, 18.5, 19.5, 16, 22, 12,
    19.5, 8, 16, 5.5, 12, 5.5,
  ],
  revealed: [
    14, 7.5,
    9.3, 7.5, 8.5, 8.3, 8.5, 14,
    8.5, 19.7, 9.3, 20.5, 14, 20.5,
    18.7, 20.5, 19.5, 19.7, 19.5, 14,
    19.5, 8.3, 18.7, 7.5, 14, 7.5,
  ],
  copied: [
    5, 12.5,
    ...line([5, 12.5], [7.5, 15]),
    ...line([7.5, 15], [10, 17.5]),
    ...line([10, 17.5], [14.75, 12.25]),
    ...line([14.75, 12.25], [19.5, 7]),
  ],
};

const BACK_DOCUMENT = "M4.5 16 V7 Q4.5 4.5 7 4.5 H15";
const BACK_DOCUMENT_LENGTH = 21;

function buildPath(from: number[], to: number[], t: number) {
  "worklet";
  let d = "";
  for (let i = 0; i < from.length; i++) {
    if (i === 0) d += "M";
    else if (i % 6 === 2) d += "C";
    d += (from[i] + (to[i] - from[i]) * t).toFixed(2) + " ";
  }
  return d;
}

function MorphIcon({ state, colors, size = 18 }: IMorphIconProps) {
  const fromShape = useSharedValue<number[]>(SHAPES[state]);
  const toShape = useSharedValue<number[]>(SHAPES[state]);
  const morph = useSharedValue<number>(1);

  const fromColor = useSharedValue<string>(colors[state]);
  const toColor = useSharedValue<string>(colors[state]);
  const tint = useSharedValue<number>(1);

  const eye = useSharedValue<number>(state === "hidden" ? 1 : 0);
  const document = useSharedValue<number>(state === "revealed" ? 1 : 0);

  useEffect(() => {
    const t = morph.get();
    const from = fromShape.get();
    const to = toShape.get();
    fromShape.set(from.map((value, i) => value + (to[i] - value) * t));
    toShape.set(SHAPES[state]);
    morph.set(0);
    morph.set(withSpring(1, MORPH_SPRING));

    fromColor.set(interpolateColor(tint.get(), [0, 1], [fromColor.get(), toColor.get()]) as string);
    toColor.set(colors[state]);
    tint.set(0);
    tint.set(withTiming(1, { duration: 260, easing: EASE_OUT }));

    eye.set(withSpring(state === "hidden" ? 1 : 0, MORPH_SPRING));
    document.set(withTiming(state === "revealed" ? 1 : 0, { duration: 320, easing: EASE_OUT }));
  }, [state, colors, morph, fromShape, toShape, fromColor, toColor, tint, eye, document]);

  const outlineProps = useAnimatedProps(() => ({
    d: buildPath(fromShape.get(), toShape.get(), morph.get()),
    stroke: interpolateColor(tint.get(), [0, 1], [fromColor.get(), toColor.get()]),
  }));

  const pupilProps = useAnimatedProps(() => ({
    r: Math.max(0, eye.get()) * 3.2,
    fill: interpolateColor(tint.get(), [0, 1], [fromColor.get(), toColor.get()]),
  }));

  const documentProps = useAnimatedProps(() => ({
    strokeDashoffset: BACK_DOCUMENT_LENGTH * (1 - document.get()),
    opacity: document.get(),
    stroke: interpolateColor(tint.get(), [0, 1], [fromColor.get(), toColor.get()]),
  }));

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <AnimatedPath
        d={BACK_DOCUMENT}
        strokeWidth={1.9}
        strokeLinecap="round"
        strokeDasharray={BACK_DOCUMENT_LENGTH}
        animatedProps={documentProps}
      />
      <AnimatedPath
        strokeWidth={1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
        animatedProps={outlineProps}
      />
      <AnimatedCircle cx={12} cy={12} animatedProps={pupilProps} />
    </Svg>
  );
}

export { MorphIcon };
