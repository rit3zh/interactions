import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
  type AccessibilityActionEvent,
} from "react-native";
import Animated, {
  Easing,
  Extrapolation,
  cancelAnimation,
  interpolate,
  interpolateColor,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import {
  BLUR,
  CANCEL_LABEL,
  COMMIT_SPRING,
  DARK_COLORS,
  DRAIN_SPRING,
  EASE_OUT,
  HOLD_TICKS,
  LABELS,
  LID_SPRING,
  LIGHT_COLORS,
  MESSAGE,
  OPEN_SPRING,
  PRESS_SPRING,
  SHIMMER_COLORS,
  SIZES,
  TAP_THRESHOLD,
  TIMING,
  TITLE,
  WIDTH_SPRING,
} from "./constants";
import type { IDeleteButtonProps, TDeletePhase } from "./interface";
import { MorphLabel } from "./morph-label";
import { TrashIcon } from "./trash-icon";
import {
  buttonRow,
  cardHeight,
  clamp01,
  dangerFrame,
  iconCenter,
  mix,
  wait,
} from "./utils";

const ACCESSIBILITY_ACTIONS = [{ name: "activate" }];

function DeleteButton({
  labels,
  title = TITLE,
  message = MESSAGE,
  cancelLabel = CANCEL_LABEL,
  holdDuration = TIMING.hold,
  onConfirm,
  style,
}: IDeleteButtonProps) {
  const colors = useColorScheme() === "dark" ? DARK_COLORS : LIGHT_COLORS;
  const still = useReducedMotion();
  const [phase, setPhase] = useState<TDeletePhase>("idle");
  const label = { ...LABELS, ...labels }[phase];
  const measured = useRef<number>(0);

  const width = useSharedValue<number>(0);
  const header = useSharedValue<number>(0);
  const labelWidth = useSharedValue<number>(0);
  const open = useSharedValue<number>(0);
  const commit = useSharedValue<number>(0);
  const done = useSharedValue<number>(0);
  const hold = useSharedValue<number>(0);
  const wiggle = useSharedValue<number>(0);
  const pressed = useSharedValue<number>(0);
  const shake = useSharedValue<number>(0);
  const shimmer = useSharedValue<number>(0);

  useEffect(() => {
    open.set(withSpring(phase === "confirm" || phase === "deleting" ? 1 : 0, OPEN_SPRING));
    commit.set(withSpring(phase === "deleting" || phase === "deleted" ? 1 : 0, COMMIT_SPRING));
    done.set(
      withTiming(phase === "deleted" ? 1 : 0, { duration: TIMING.tint, easing: EASE_OUT }),
    );

    cancelAnimation(shimmer);
    shimmer.set(0);
    if (phase === "deleting" && !still) {
      shimmer.set(
        withRepeat(
          withTiming(1, { duration: TIMING.shimmer, easing: Easing.inOut(Easing.quad) }),
          -1,
        ),
      );
    }

    if (phase !== "deleted") return;
    const id = setTimeout(() => setPhase("idle"), TIMING.doneHold);
    return () => clearTimeout(id);
  }, [phase, still, open, commit, done, shimmer]);

  const tick = (step: number) => {
    const style =
      step < HOLD_TICKS * 0.5
        ? Haptics.ImpactFeedbackStyle.Light
        : step < HOLD_TICKS * 0.8
          ? Haptics.ImpactFeedbackStyle.Medium
          : Haptics.ImpactFeedbackStyle.Rigid;
    Haptics.impactAsync(style);
  };

  useAnimatedReaction(
    () => Math.floor(hold.get() * HOLD_TICKS),
    (now, before) => {
      if (before !== null && now > before && now < HOLD_TICKS) scheduleOnRN(tick, now);
    },
  );

  const openCard = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPhase("confirm");
    if (still) return;
    wiggle.set(
      withSequence(
        withDelay(
          TIMING.wiggleDelay,
          withTiming(1, { duration: TIMING.wiggle, easing: EASE_OUT }),
        ),
        withSpring(0, LID_SPRING),
      ),
    );
  };

  const closeCard = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    hold.set(withSpring(0, DRAIN_SPRING));
    setPhase("idle");
  };

  const complete = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    hold.set(withSpring(0, LID_SPRING));
    setPhase("deleting");
    try {
      await Promise.all([onConfirm?.(), wait(TIMING.minPending)]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setPhase("deleted");
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setPhase("confirm");
    }
  };

  const nudge = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    shake.set(
      withSequence(
        withTiming(-1, { duration: TIMING.shake }),
        withRepeat(withTiming(1, { duration: TIMING.shake * 2 }), 3, true),
        withSpring(0, PRESS_SPRING),
      ),
    );
  };

  const pressIn = () => {
    if (phase === "deleting") return;
    pressed.set(withSpring(1, PRESS_SPRING));
    if (phase !== "confirm") return;
    hold.set(
      withTiming(
        1,
        { duration: holdDuration * (1 - hold.get()), easing: Easing.linear },
        (finished) => {
          if (finished) scheduleOnRN(complete);
        },
      ),
    );
  };

  const pressOut = () => {
    pressed.set(withSpring(0, PRESS_SPRING));
    const reached = hold.get();
    if (phase !== "confirm" || reached >= 0.98) return;
    hold.set(withSpring(0, DRAIN_SPRING));
    if (reached < TAP_THRESHOLD) nudge();
  };

  const press = () => {
    if (phase === "idle") openCard();
  };

  const accessibilityAction = ({ nativeEvent }: AccessibilityActionEvent) => {
    if (nativeEvent.actionName !== "activate") return;
    if (phase === "idle") openCard();
    else if (phase === "confirm") complete();
  };

  const measureLabel = (next: number) => {
    if (next === measured.current) return;
    const first = measured.current === 0;
    measured.current = next;
    labelWidth.set(first ? next : withSpring(next, WIDTH_SPRING));
  };

  const lid = useDerivedValue<number>(() => Math.max(hold.get(), wiggle.get() * 0.6));

  const labelColor = useDerivedValue<string>(
    () => interpolateColor(done.get(), [0, 1], [colors.onDanger, colors.onNeutral]) as string,
  );

  const iconColor = useDerivedValue<string>(
    () =>
      interpolateColor(clamp01(open.get()), [0, 1], [labelColor.get(), colors.danger]) as string,
  );

  const surfaceStyle = useAnimatedStyle(() => {
    const o = open.get();
    return {
      height: mix(o, SIZES.pill, cardHeight(header.get())),
      borderRadius: mix(clamp01(o), SIZES.pill / 2, SIZES.radius),
      opacity: clamp01(o * 1.6),
    };
  });

  const clipStyle = useAnimatedStyle(() => {
    const o = open.get();
    return {
      height: mix(o, SIZES.pill, cardHeight(header.get())),
      borderRadius: mix(clamp01(o), SIZES.pill / 2, SIZES.radius),
    };
  });

  const headerStyle = useAnimatedStyle(() => {
    const shown = interpolate(open.get(), [0.2, 1], [0, 1], Extrapolation.CLAMP);
    return {
      opacity: shown,
      filter: [{ blur: (1 - shown) * BLUR }],
      transform: [{ translateY: (1 - shown) * 14 }, { scale: 0.96 + shown * 0.04 }],
    };
  });

  const cancelStyle = useAnimatedStyle(() => {
    const o = open.get();
    const { half } = buttonRow(width.get());
    const height = mix(o, SIZES.pill, SIZES.button);
    const appear = interpolate(o, [0.25, 1], [0, 1], Extrapolation.CLAMP);
    const shown = appear * (1 - clamp01(commit.get()));
    return {
      left: SIZES.padding,
      bottom: mix(o, 0, SIZES.padding),
      width: half,
      height,
      borderRadius: height / 2,
      opacity: shown,
      transform: [{ translateX: (1 - appear) * half * 0.5 }, { scale: 0.88 + shown * 0.12 }],
    };
  });

  const cancelLabelStyle = useAnimatedStyle(() => {
    const appear = interpolate(open.get(), [0.25, 1], [0, 1], Extrapolation.CLAMP);
    const shown = appear * (1 - clamp01(commit.get()));
    return { filter: [{ blur: (1 - shown) * BLUR }] };
  });

  const dangerStyle = useAnimatedStyle(() => {
    const w = width.get();
    const frame = dangerFrame(w, open.get(), commit.get());
    return {
      ...frame,
      borderRadius: frame.height / 2,
      opacity: w > 0 ? 1 : 0,
      backgroundColor: interpolateColor(done.get(), [0, 1], [colors.danger, colors.neutral]),
      transform: [
        { translateX: shake.get() * SIZES.shake },
        { scale: 1 - pressed.get() * 0.03 },
      ],
    };
  });

  const fillStyle = useAnimatedStyle(() => ({
    width: hold.get() * dangerFrame(width.get(), open.get(), commit.get()).width,
    opacity: 1 - clamp01(commit.get()),
  }));

  const shimmerStyle = useAnimatedStyle(() => {
    const span = dangerFrame(width.get(), open.get(), commit.get()).width + SIZES.shimmer;
    return { transform: [{ translateX: -SIZES.shimmer + shimmer.get() * span }] };
  });

  const labelStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: (1 - clamp01(open.get())) * ((SIZES.idleIcon + SIZES.idleGap) / 2) },
    ],
  }));

  const tileStyle = useAnimatedStyle(() => {
    const w = width.get();
    const o = open.get();
    const [x, y] = iconCenter(w, labelWidth.get(), header.get(), o);
    return {
      opacity: w > 0 ? 1 : 0,
      transform: [
        { translateX: x - SIZES.tile / 2 },
        { translateY: -(y - SIZES.tile / 2) },
        { scale: mix(clamp01(o), SIZES.idleIcon / SIZES.icon, 1) },
      ],
    };
  });

  const tileSurfaceStyle = useAnimatedStyle(() => ({
    opacity: interpolate(open.get(), [0.3, 1], [0, 1], Extrapolation.CLAMP),
  }));

  return (
    <View
      style={[styles.root, style]}
      onLayout={({ nativeEvent }) => width.set(nativeEvent.layout.width)}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.cardBorder, boxShadow: colors.shadow },
          surfaceStyle,
        ]}
      />
      <Animated.View style={[styles.card, styles.clip, clipStyle]}>
        <Animated.View
          pointerEvents="none"
          onLayout={({ nativeEvent }) => header.set(nativeEvent.layout.height)}
          style={[styles.header, headerStyle]}
        >
          <View style={styles.tileSpace} />
          <Text style={[styles.title, { color: colors.title }]}>{title}</Text>
          <Text style={[styles.message, { color: colors.message }]}>{message}</Text>
        </Animated.View>

        <Animated.View
          pointerEvents={phase === "confirm" ? "auto" : "none"}
          style={[styles.button, { backgroundColor: colors.neutral }, cancelStyle]}
        >
          <Pressable
            onPress={closeCard}
            accessibilityRole="button"
            accessibilityLabel={cancelLabel}
            style={({ pressed: down }) => [styles.fill, styles.center, down && styles.dimmed]}
          >
            <Animated.View pointerEvents="none" style={cancelLabelStyle}>
              <Text style={[styles.cancelLabel, { color: colors.onNeutral }]}>{cancelLabel}</Text>
            </Animated.View>
          </Pressable>
        </Animated.View>

        <Animated.View style={[styles.button, dangerStyle]}>
          <Pressable
            onPress={press}
            onPressIn={pressIn}
            onPressOut={pressOut}
            disabled={phase === "deleting" || phase === "deleted"}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityHint={
              phase === "confirm" ? "Press and hold to delete permanently" : undefined
            }
            accessibilityState={{ busy: phase === "deleting" }}
            accessibilityActions={ACCESSIBILITY_ACTIONS}
            onAccessibilityAction={accessibilityAction}
            style={styles.fill}
          >
            <Animated.View
              pointerEvents="none"
              style={[styles.holdFill, { backgroundColor: colors.holdFill }, fillStyle]}
            />
            <Animated.View pointerEvents="none" style={[styles.shimmer, shimmerStyle]}>
              <LinearGradient
                colors={SHIMMER_COLORS}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
            <Animated.View style={[StyleSheet.absoluteFill, labelStyle]}>
              <MorphLabel text={label} color={labelColor} onMeasure={measureLabel} />
            </Animated.View>
          </Pressable>
        </Animated.View>

        <Animated.View pointerEvents="none" style={[styles.tile, tileStyle]}>
          <Animated.View
            style={[styles.tileSurface, { backgroundColor: colors.dangerTint }, tileSurfaceStyle]}
          />
          <TrashIcon lid={lid} done={done} color={iconColor} size={SIZES.icon} />
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    height: SIZES.pill,
    alignSelf: "stretch",
  },
  card: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderCurve: "continuous",
  },
  clip: {
    overflow: "hidden",
  },
  header: {
    position: "absolute",
    left: SIZES.padding,
    right: SIZES.padding,
    bottom: SIZES.padding + SIZES.button + SIZES.headerGap,
  },
  tileSpace: {
    width: SIZES.tile,
    height: SIZES.tile,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "700",
    letterSpacing: -0.4,
  },
  message: {
    marginTop: 6,
    fontSize: 15,
    lineHeight: 21,
  },
  button: {
    position: "absolute",
    overflow: "hidden",
    borderCurve: "continuous",
  },
  fill: {
    flex: 1,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  dimmed: {
    opacity: 0.7,
  },
  cancelLabel: {
    fontSize: SIZES.fontSize,
    lineHeight: SIZES.lineHeight,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  holdFill: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
  },
  shimmer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: SIZES.shimmer,
  },
  tile: {
    position: "absolute",
    left: 0,
    bottom: 0,
    width: SIZES.tile,
    height: SIZES.tile,
    alignItems: "center",
    justifyContent: "center",
  },
  tileSurface: {
    ...StyleSheet.absoluteFill,
    borderRadius: SIZES.tileRadius,
    borderCurve: "continuous",
  },
});

export { DeleteButton };
