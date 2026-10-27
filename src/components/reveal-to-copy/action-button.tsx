import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { useEffect } from "react";
import { Pressable, StyleSheet, View, useColorScheme } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { COLORS, EASE_OUT, ICON_SPRING, SIZES } from "./constants";
import { CountdownRing } from "./countdown-ring";
import type { IActionButtonProps, TRevealState } from "./interface";
import { MorphIcon } from "./morph-icon";

const ACCESSIBILITY_LABEL: Record<TRevealState, string> = {
  hidden: "Reveal",
  revealed: "Copy",
  copied: "Copied",
};

const ICON_COLORS_LIGHT: Record<TRevealState, string> = {
  hidden: "#1C1C1E",
  revealed: COLORS.tint,
  copied: "#FFFFFF",
};

const ICON_COLORS_DARK: Record<TRevealState, string> = {
  ...ICON_COLORS_LIGHT,
  hidden: "#FFFFFF",
};

function ActionButton({ state, revealDuration, onPress }: IActionButtonProps) {
  const isDark = useColorScheme() === "dark";
  const hasGlass = isLiquidGlassAvailable();

  const tinted = useSharedValue<number>(0);
  const success = useSharedValue<number>(0);
  const pressed = useSharedValue<number>(0);

  useEffect(() => {
    const config = { duration: 280, easing: EASE_OUT };
    tinted.set(withTiming(state === "revealed" ? 1 : 0, config));
    success.set(withTiming(state === "copied" ? 1 : 0, config));
  }, [state, tinted, success]);

  const tintStyle = useAnimatedStyle(() => ({ opacity: tinted.get() }));
  const successStyle = useAnimatedStyle(() => ({ opacity: success.get() }));

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pressed.get(), [0, 1], [1, 0.9]) }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => pressed.set(withSpring(1, ICON_SPRING))}
      onPressOut={() => pressed.set(withSpring(0, ICON_SPRING))}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={ACCESSIBILITY_LABEL[state]}
      style={styles.hitArea}
    >
      <CountdownRing active={state === "revealed"} duration={revealDuration} />
      <Animated.View style={pressStyle}>
        <GlassView
          glassEffectStyle="regular"
          isInteractive
          style={[styles.button, !hasGlass && (isDark ? styles.fallbackDark : styles.fallbackLight)]}
        >
          <Animated.View style={[StyleSheet.absoluteFill, styles.tintFill, tintStyle]} />
          <Animated.View style={[StyleSheet.absoluteFill, styles.successFill, successStyle]} />
          <View style={styles.icon}>
            <MorphIcon state={state} colors={isDark ? ICON_COLORS_DARK : ICON_COLORS_LIGHT} />
          </View>
        </GlassView>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hitArea: {
    width: SIZES.ring,
    height: SIZES.ring,
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    width: SIZES.button,
    height: SIZES.button,
    borderRadius: SIZES.button / 2,
    overflow: "hidden",
  },
  fallbackLight: {
    backgroundColor: "rgba(120, 120, 128, 0.12)",
  },
  fallbackDark: {
    backgroundColor: "rgba(120, 120, 128, 0.24)",
  },
  tintFill: {
    backgroundColor: "rgba(10, 132, 255, 0.14)",
  },
  successFill: {
    backgroundColor: COLORS.success,
  },
  icon: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

export { ActionButton };
