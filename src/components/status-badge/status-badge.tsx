import * as Haptics from "expo-haptics";
import { useEffect } from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import {
  EASE_OUT,
  LABELS,
  PRESS_SPRING,
  SIZES,
  TIMING,
  TONES,
  WIDTH_SPRING,
} from "./constants";
import type { IStatusBadgeProps } from "./interface";
import { MorphLabel } from "./morph-label";
import { StatusIcon } from "./status-icon";

const CHROME = SIZES.padding * 2 + SIZES.icon + SIZES.gap;

function StatusBadge({
  status,
  labels,
  tones,
  onPress,
  style,
}: IStatusBadgeProps) {
  const tone = { ...TONES, ...tones }[status];
  const label = { ...LABELS, ...labels }[status];
  const fromBackground = useSharedValue<string>(tone.background);
  const toBackground = useSharedValue<string>(tone.background);
  const fromForeground = useSharedValue<string>(tone.foreground);
  const toForeground = useSharedValue<string>(tone.foreground);
  const tint = useSharedValue<number>(1);
  const width = useSharedValue<number>(-1);
  const pressed = useSharedValue<number>(0);

  useEffect(() => {
    const t = tint.get();
    fromBackground.set(
      interpolateColor(
        t,
        [0, 1],
        [fromBackground.get(), toBackground.get()],
      ) as string,
    );
    fromForeground.set(
      interpolateColor(
        t,
        [0, 1],
        [fromForeground.get(), toForeground.get()],
      ) as string,
    );
    toBackground.set(tone.background);
    toForeground.set(tone.foreground);
    tint.set(0);
    tint.set(withTiming(1, { duration: TIMING.tint, easing: EASE_OUT }));
  }, [
    tone.background,
    tone.foreground,
    tint,
    fromBackground,
    toBackground,
    fromForeground,
    toForeground,
  ]);

  const foreground = useDerivedValue<string>(
    () =>
      interpolateColor(
        tint.get(),
        [0, 1],
        [fromForeground.get(), toForeground.get()],
      ) as string,
  );

  const measure = (textWidth: number) => {
    const next = CHROME + Math.ceil(textWidth);
    if (width.get() < 0) width.set(next);
    else width.set(withSpring(next, WIDTH_SPRING));
  };

  const badgeStyle = useAnimatedStyle(() => {
    const w = width.get();
    return {
      width: w < 0 ? undefined : w,
      opacity: w < 0 ? 0 : 1,
      backgroundColor: interpolateColor(
        tint.get(),
        [0, 1],
        [fromBackground.get(), toBackground.get()],
      ),
      transform: [{ scale: interpolate(pressed.get(), [0, 1], [1, 0.95]) }],
    };
  });

  const press = () => {
    Haptics.selectionAsync();
    onPress?.();
  };

  return (
    <Pressable
      onPress={onPress ? press : undefined}
      onPressIn={() => pressed.set(withSpring(1, PRESS_SPRING))}
      onPressOut={() => pressed.set(withSpring(0, PRESS_SPRING))}
      disabled={!onPress}
      accessibilityRole={onPress ? "button" : "text"}
      accessibilityLabel={`Status: ${label}`}
      style={style}
    >
      <Animated.View style={[styles.badge, badgeStyle]}>
        <StatusIcon status={status} color={foreground} size={SIZES.icon} />
        <MorphLabel text={label} color={foreground} onMeasure={measure} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  badge: {
    height: SIZES.height,
    borderRadius: SIZES.radius,
    borderCurve: "continuous",
    paddingHorizontal: SIZES.padding,
    flexDirection: "row",
    alignItems: "center",
    gap: SIZES.gap,
    overflow: "hidden",
  },
});

export { StatusBadge };
