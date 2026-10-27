import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";

import {
  EASE_OUT,
  GLYPH_SEGMENTS,
  MORPH_SPRING,
  OUTLINE_SEGMENTS,
  SIZES,
  TIMING,
} from "./constants";
import type { IStatusIconProps } from "./interface";
import { SHAPES } from "./shapes";
import { buildPath } from "./utils";

const AnimatedPath = Animated.createAnimatedComponent(Path);

function StatusIcon({ status, color, size }: IStatusIconProps) {
  const still = useReducedMotion();
  const shape = SHAPES[status];

  const fromShape = useSharedValue<number[]>(shape.points);
  const toShape = useSharedValue<number[]>(shape.points);
  const morph = useSharedValue<number>(1);
  const glyph = useSharedValue<number>(shape.glyph ? 1 : 0);
  const spin = useSharedValue<number>(0);

  useEffect(() => {
    const next = SHAPES[status];

    const t = morph.get();
    const from = fromShape.get();
    const to = toShape.get();
    fromShape.set(from.map((value, i) => value + (to[i] - value) * t));
    toShape.set(next.points);
    morph.set(0);
    morph.set(withSpring(1, MORPH_SPRING));

    glyph.set(withTiming(next.glyph ? 1 : 0, { duration: TIMING.glyphFade, easing: EASE_OUT }));

    cancelAnimation(spin);
    if (next.spins && !still) {
      const start = spin.get() % 360;
      spin.set(start);
      spin.set(
        withRepeat(
          withTiming(start + 360, { duration: TIMING.spin, easing: Easing.linear }),
          -1,
        ),
      );
    } else {
      spin.set(
        withTiming(Math.ceil(spin.get() / 360) * 360, {
          duration: TIMING.settle,
          easing: EASE_OUT,
        }),
      );
    }
  }, [status, still, morph, fromShape, toShape, glyph, spin]);

  const outlineProps = useAnimatedProps(() => ({
    d: buildPath(fromShape.get(), toShape.get(), morph.get(), 0, OUTLINE_SEGMENTS),
    stroke: color.get(),
  }));

  const glyphProps = useAnimatedProps(() => ({
    d: buildPath(
      fromShape.get(),
      toShape.get(),
      morph.get(),
      OUTLINE_SEGMENTS,
      OUTLINE_SEGMENTS + GLYPH_SEGMENTS,
    ),
    stroke: color.get(),
    opacity: glyph.get(),
  }));

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.get()}deg` }],
  }));

  return (
    <View style={{ width: size, height: size }}>
      <Animated.View style={[StyleSheet.absoluteFill, spinStyle]}>
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <AnimatedPath
            strokeWidth={SIZES.stroke}
            strokeLinecap="round"
            strokeLinejoin="round"
            animatedProps={outlineProps}
          />
        </Svg>
      </Animated.View>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={StyleSheet.absoluteFill}>
        <AnimatedPath
          strokeWidth={SIZES.stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
          animatedProps={glyphProps}
        />
      </Svg>
    </View>
  );
}

export { StatusIcon };
