import { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";

import { COLORS, EASE_OUT, SIZES } from "./constants";
import type { ICountdownRingProps } from "./interface";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const RADIUS = (SIZES.ring - SIZES.ringStroke) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function CountdownRing({ active, duration }: ICountdownRingProps) {
  const elapsed = useSharedValue<number>(0);
  const visibility = useSharedValue<number>(0);

  useEffect(() => {
    if (active) {
      elapsed.set(0);
      elapsed.set(withTiming(1, { duration, easing: Easing.linear }));
      visibility.set(withTiming(1, { duration: 240, easing: EASE_OUT }));
    } else {
      cancelAnimation(elapsed);
      visibility.set(withTiming(0, { duration: 180, easing: EASE_OUT }));
    }
  }, [active, duration, elapsed, visibility]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: visibility.get(),
    transform: [{ scale: 0.86 + visibility.get() * 0.14 }, { rotate: "-90deg" }],
  }));

  const progressProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * elapsed.get(),
  }));

  const center = SIZES.ring / 2;

  return (
    <Animated.View pointerEvents="none" style={[styles.container, containerStyle]}>
      <Svg width={SIZES.ring} height={SIZES.ring}>
        <Circle
          cx={center}
          cy={center}
          r={RADIUS}
          stroke={COLORS.ringTrack}
          strokeWidth={SIZES.ringStroke}
          fill="none"
        />
        <AnimatedCircle
          cx={center}
          cy={center}
          r={RADIUS}
          stroke={COLORS.tint}
          strokeWidth={SIZES.ringStroke}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          fill="none"
          animatedProps={progressProps}
        />
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: SIZES.ring,
    height: SIZES.ring,
  },
});

export { CountdownRing };
