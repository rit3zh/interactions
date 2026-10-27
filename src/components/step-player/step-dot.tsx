import { useEffect } from "react";
import Animated, {
  Easing,
  cancelAnimation,
  interpolateColor,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { Rect } from "react-native-svg";

import { CANVAS, DOT, EASE_INK, EASE_MOVE, TIMING, WAKE } from "./constants";
import type { IStepDotProps } from "./interface";
import { clamp01 } from "./utils";

const AnimatedRect = Animated.createAnimatedComponent(Rect);

const CENTER = CANVAS / 2;

function StepDot({
  index,
  slot,
  completed,
  active,
  progress,
  waveId,
  wake,
  still,
  colors,
  pressedIndex,
  pressAmount,
}: IStepDotProps) {
  const [targetLeft, targetRight] = slot;
  const wakeDelay = wake?.delay ?? null;
  const wakeShare = wake?.share ?? 0;

  const left = useSharedValue<number>(targetLeft);
  const right = useSharedValue<number>(targetRight);
  const ink = useSharedValue<number>(completed ? 1 : 0);
  const focus = useSharedValue<number>(active ? 1 : 0);
  const bulge = useSharedValue<number>(1);
  const share = useSharedValue<number>(0);

  useEffect(() => {
    const move = { duration: TIMING.move, easing: EASE_MOVE };
    left.set(still ? targetLeft : withTiming(targetLeft, move));
    right.set(still ? targetRight : withTiming(targetRight, move));
  }, [targetLeft, targetRight, still, left, right]);

  useEffect(() => {
    const config = { duration: TIMING.ink, easing: EASE_INK };
    if (active) {
      cancelAnimation(ink);
      focus.set(still ? 1 : withTiming(1, config));
      return;
    }
    const f = focus.get();
    ink.set(ink.get() * (1 - f) + clamp01(progress.get()) * f);
    focus.set(0);
    const target = completed ? 1 : 0;
    ink.set(still ? target : withTiming(target, config));
  }, [active, completed, still, ink, focus, progress]);

  useEffect(() => {
    if (wakeDelay === null || still) return;
    share.set(wakeShare);
    bulge.set(0);
    bulge.set(
      withDelay(
        TIMING.lead + wakeDelay,
        withTiming(1, { duration: TIMING.rise, easing: Easing.linear }),
      ),
    );
  }, [waveId, wakeDelay, wakeShare, still, bulge, share]);

  const trackProps = useAnimatedProps(() => {
    const height = DOT * (1 + Math.sin(Math.PI * bulge.get()) * WAKE.amp * share.get());
    const amount = pressedIndex.get() === index ? pressAmount.get() : 0;
    return {
      x: left.get(),
      y: CENTER - height / 2,
      width: Math.max(0, right.get() - left.get()),
      height,
      ry: height / 2,
      fill: interpolateColor(amount, [0, 1], [colors.track, colors.trackPressed]),
    };
  });

  const fillProps = useAnimatedProps(() => {
    const height = DOT * (1 + Math.sin(Math.PI * bulge.get()) * WAKE.amp * share.get());
    const width = Math.max(0, right.get() - left.get());
    const f = focus.get();
    const value = ink.get() * (1 - f) + clamp01(progress.get()) * f;
    return {
      x: left.get(),
      y: CENTER - height / 2,
      width: Math.max(Math.min(DOT, width), width * value),
      height,
      ry: height / 2,
      opacity: Math.min(1, value * 14),
    };
  });

  return (
    <>
      <AnimatedRect rx={DOT / 2} animatedProps={trackProps} />
      <AnimatedRect rx={DOT / 2} fill={colors.fill} animatedProps={fillProps} />
    </>
  );
}

export { StepDot };
