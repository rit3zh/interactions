import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { Pressable, StyleSheet, View, useColorScheme } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import Svg from "react-native-svg";

import { CANVAS, COLORS, DOT, GAP, HEIGHT, MARK_SIZE, PAD, PRESS_SPRING } from "./constants";
import type { IStepPlayerProps, IWave } from "./interface";
import { PlayPauseMark } from "./play-pause-mark";
import { StepDot } from "./step-dot";
import { getWake, layout, trackWidth } from "./utils";

function StepPlayer({
  labels,
  at,
  playing,
  progress,
  onPick,
  onPeek,
  onToggle,
  style,
}: IStepPlayerProps) {
  const isDark = useColorScheme() === "dark";
  const hasGlass = isLiquidGlassAvailable();
  const still = useReducedMotion();
  const colors = isDark ? COLORS.dark : COLORS.light;
  const count = labels.length;

  const [shown, setShown] = useState<number>(at);
  const [wave, setWave] = useState<IWave>({ id: 0, from: at, origin: at });
  if (at !== shown) {
    setShown(at);
    setWave({ id: wave.id + 1, from: shown, origin: at });
  }

  const pressed = useSharedValue<number>(0);
  const pressedIndex = useSharedValue<number>(-1);
  const pressAmount = useSharedValue<number>(0);
  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pressed.get(), [0, 1], [1, 0.95]) }],
  }));

  const slots = layout(count, at);
  const width = trackWidth(count);
  const fallback = !hasGlass && (isDark ? styles.fallbackDark : styles.fallbackLight);

  const pick = (index: number) => {
    if (index === at) return;
    Haptics.selectionAsync();
    onPick(index);
  };

  const toggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle();
  };

  return (
    <View style={[styles.row, style]}>
      <GlassView glassEffectStyle="regular" style={[styles.pill, fallback]}>
        <View
          accessible
          accessibilityRole="adjustable"
          accessibilityLabel={labels[at]}
          accessibilityValue={{ text: `${at + 1} of ${count}` }}
          accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
          onAccessibilityAction={({ nativeEvent }) => {
            if (nativeEvent.actionName === "increment" && at < count - 1) pick(at + 1);
            if (nativeEvent.actionName === "decrement" && at > 0) pick(at - 1);
          }}
          style={{ width, height: DOT }}
        >
          <Svg width={width} height={CANVAS} style={styles.canvas}>
            {slots.map((slot, i) => (
              <StepDot
                key={i}
                index={i}
                slot={slot}
                completed={i < at}
                active={i === at}
                progress={progress}
                waveId={wave.id}
                wake={wave.from === wave.origin ? null : getWake(i, wave)}
                still={still}
                colors={colors}
                pressedIndex={pressedIndex}
                pressAmount={pressAmount}
              />
            ))}
          </Svg>
          {slots.map(([left, right], i) => (
            <Pressable
              key={i}
              onPress={() => pick(i)}
              onHoverIn={onPeek ? () => onPeek(i) : undefined}
              onPressIn={() => {
                pressedIndex.set(i);
                pressAmount.set(withSpring(1, PRESS_SPRING));
              }}
              onPressOut={() => pressAmount.set(withSpring(0, PRESS_SPRING))}
              style={[styles.hit, { left: left - GAP / 2, width: right - left + GAP }]}
            />
          ))}
        </View>
      </GlassView>

      <Pressable
        onPress={toggle}
        onPressIn={() => pressed.set(withSpring(1, PRESS_SPRING))}
        onPressOut={() => pressed.set(withSpring(0, PRESS_SPRING))}
        accessibilityRole="button"
        accessibilityLabel={playing ? "Pause" : "Play"}
        hitSlop={4}
      >
        <Animated.View style={pressStyle}>
          <GlassView glassEffectStyle="regular" isInteractive style={[styles.button, fallback]}>
            <PlayPauseMark playing={playing} size={MARK_SIZE} still={still} color={colors.fill} />
          </GlassView>
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pill: {
    padding: PAD,
    borderRadius: HEIGHT / 2,
    borderCurve: "continuous",
  },
  canvas: {
    position: "absolute",
    top: (DOT - CANVAS) / 2,
    left: 0,
  },
  hit: {
    position: "absolute",
    top: -PAD,
    bottom: -PAD,
  },
  button: {
    width: HEIGHT,
    height: HEIGHT,
    borderRadius: HEIGHT / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  fallbackLight: {
    backgroundColor: "rgba(255, 255, 255, 0.72)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(60, 60, 67, 0.12)",
  },
  fallbackDark: {
    backgroundColor: "rgba(44, 44, 46, 0.72)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(235, 235, 245, 0.1)",
  },
});

export { StepPlayer };
