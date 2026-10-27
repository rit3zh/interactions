import { Canvas, Fill, Shader } from "@shopify/react-native-skia";
import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import { PixelRatio, StyleSheet, View, useColorScheme } from "react-native";
import { GestureDetector, usePanGesture } from "react-native-gesture-handler";
import { useDerivedValue, useSharedValue, withSpring } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import {
  COLORS,
  DEFAULT_CONFIG,
  FOLLOW_SPRING,
  OVERDRAG,
  PRESS_SPRING,
  PROJECTION,
  SNAP_SPRING,
} from "./constants";
import type { IGlowSliderProps } from "./interface";
import { SLIDER_EFFECT } from "./shader";
import { clamp, rubberBand, toRGB, toRGBA } from "./utils";

function GlowSlider({
  labels,
  value,
  onChange,
  recommended = -1,
  config,
  accessibilityLabel,
  style,
}: IGlowSliderProps) {
  const settings = { ...DEFAULT_CONFIG, ...config };
  const colors = COLORS[useColorScheme() === "dark" ? "dark" : "light"];
  const last = Math.max(labels.length - 1, 1);

  const [width, setWidth] = useState<number>(0);
  const span = useSharedValue<number>(1);
  const goal = useSharedValue<number>(value);
  const position = useSharedValue<number>(value);
  const step = useSharedValue<number>(value);
  const press = useSharedValue<number>(0);
  const velocity = useSharedValue<number>(0);

  const commit = (next: number) => {
    Haptics.selectionAsync();
    onChange(next);
  };

  useEffect(() => {
    if (step.get() === value) return;
    step.set(value);
    goal.set(value);
    position.set(withSpring(value, SNAP_SPRING));
  }, [value, step, goal, position]);

  const reach = (x: number) => {
    "worklet";
    const at = ((x - settings.height / 2) / span.get()) * last;
    goal.set(rubberBand(at, 0, last, OVERDRAG));
    position.set(withSpring(goal.get(), FOLLOW_SPRING));
    const nearest = clamp(Math.round(goal.get()), 0, last);
    if (nearest !== step.get()) {
      step.set(nearest);
      scheduleOnRN(commit, nearest);
    }
  };

  const pan = usePanGesture({
    minDistance: 0,
    onBegin: (event) => {
      "worklet";
      press.set(withSpring(1, PRESS_SPRING));
      velocity.set(0);
      reach(event.x);
    },
    onUpdate: (event) => {
      "worklet";
      velocity.set(event.velocityX);
      reach(event.x);
    },
    onFinalize: () => {
      "worklet";
      const flick = (velocity.get() / span.get()) * last * PROJECTION;
      const target = clamp(Math.round(goal.get() + flick), 0, last);
      goal.set(target);
      position.set(withSpring(target, SNAP_SPRING));
      press.set(withSpring(0, PRESS_SPRING));
      if (target !== step.get()) {
        step.set(target);
        scheduleOnRN(commit, target);
      }
    },
  });

  const track = toRGBA(colors.track);
  const mark = toRGBA(colors.mark);
  const markLit = toRGBA(colors.markLit);
  const tint = toRGB(settings.tint);
  const knob = toRGB(settings.knob);
  const pixel = 1 / PixelRatio.get();

  const uniforms = useDerivedValue(() => ({
    size: [width, settings.height],
    position: position.get(),
    last,
    recommended,
    press: press.get(),
    lag: (goal.get() - position.get()) * (span.get() / last),
    inset: settings.inset,
    pixel,
    track,
    mark,
    markLit,
    tint,
    knob,
  }));

  const pick = (next: number) => {
    if (next < 0 || next > last) return;
    step.set(next);
    goal.set(next);
    position.set(withSpring(next, SNAP_SPRING));
    commit(next);
  };

  return (
    <GestureDetector gesture={pan}>
      <View
        style={[{ height: settings.height, alignSelf: "stretch" }, style]}
        onLayout={({ nativeEvent }) => {
          const next = nativeEvent.layout.width;
          span.set(Math.max(next - settings.height, 1));
          setWidth(next);
        }}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={accessibilityLabel}
        accessibilityValue={{ text: labels[value] }}
        accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
        onAccessibilityAction={({ nativeEvent }) => {
          if (nativeEvent.actionName === "increment") pick(value + 1);
          if (nativeEvent.actionName === "decrement") pick(value - 1);
        }}
      >
        {width > 0 && (
          <Canvas style={StyleSheet.absoluteFill}>
            <Fill>
              <Shader source={SLIDER_EFFECT} uniforms={uniforms} />
            </Fill>
          </Canvas>
        )}
      </View>
    </GestureDetector>
  );
}

export { GlowSlider };
