import { Canvas } from "@shopify/react-native-skia";
import * as Haptics from "expo-haptics";
import { useEffect, useMemo, useState } from "react";
import { PixelRatio, StyleSheet, View } from "react-native";
import { GestureDetector, usePanGesture } from "react-native-gesture-handler";
import {
  cancelAnimation,
  useAnimatedReaction,
  useFrameCallback,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import {
  DEFAULT_CONFIG,
  DEFAULT_GAP,
  DRAG_ACTIVATION,
  DRAG_FAIL_Y,
  FLING_CARRY,
  SNAP_SPRING,
} from "./constants";
import type { IStretchCarouselProps, IStretchLayout } from "./interface";
import { StretchCard } from "./stretch-card";
import { drawOrder, measure, rimColor } from "./utils";

function StretchCarousel({
  images,
  config,
  gap = DEFAULT_GAP,
  onIndexChange,
  style,
}: IStretchCarouselProps) {
  const settings = { ...DEFAULT_CONFIG, ...config };
  const count = images.length;

  const [size, setSize] = useState<{ width: number; height: number } | null>(
    null,
  );
  const [center, setCenter] = useState<number>(0);

  const offset = useSharedValue<number>(0);
  const velocity = useSharedValue<number>(0);
  const last = useSharedValue<number>(0);
  const start = useSharedValue<number>(0);
  const flung = useSharedValue<boolean>(false);
  const step = useSharedValue<number>(1);

  const layout = useMemo<IStretchLayout | null>(
    () => size && measure(size.width, size.height, gap, settings),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [size, gap, settings.width, settings.aspect, settings.fov],
  );

  useEffect(() => {
    if (layout) step.set(layout.step);
  }, [layout, step]);

  useFrameCallback(({ timeSincePreviousFrame }) => {
    const dt = Math.max((timeSincePreviousFrame ?? 16) / 1000, 0.001);
    const now = offset.get();
    const raw = (now - last.get()) / dt;
    last.set(now);
    velocity.set(
      velocity.get() + (raw - velocity.get()) * Math.min(dt * 14, 1),
    );
  });

  const settle = (index: number) => {
    const wrapped = ((index % count) + count) % count;
    setCenter(wrapped);
    Haptics.selectionAsync();
    onIndexChange?.(wrapped);
  };

  useAnimatedReaction(
    () => Math.round(offset.get()),
    (now, before) => {
      if (before !== null && now !== before) scheduleOnRN(settle, now);
    },
  );

  const snapTo = (target: number, speed = 0) => {
    "worklet";
    offset.set(withSpring(target, { ...SNAP_SPRING, velocity: speed }));
  };

  const pan = usePanGesture({
    activeOffsetX: [-DRAG_ACTIVATION, DRAG_ACTIVATION],
    failOffsetY: [-DRAG_FAIL_Y, DRAG_FAIL_Y],
    onBegin: () => {
      "worklet";
      cancelAnimation(offset);
      start.set(offset.get());
      flung.set(false);
    },
    onUpdate: (event) => {
      "worklet";
      offset.set(start.get() - event.translationX / step.get());
    },
    onDeactivate: (event) => {
      "worklet";
      const speed = -event.velocityX / step.get();
      const from = Math.round(start.get());
      const target = Math.round(offset.get() + speed * FLING_CARRY);
      flung.set(true);
      snapTo(Math.min(Math.max(target, from - 1), from + 1), speed);
    },
    onFinalize: () => {
      "worklet";
      if (!flung.get()) snapTo(Math.round(offset.get()));
    },
  });

  const shift = (by: number) => {
    cancelAnimation(offset);
    snapTo(Math.round(offset.get()) + by);
  };

  const color = rimColor(settings.rimHue);
  const pixel = 1 / PixelRatio.get();

  return (
    <GestureDetector gesture={pan}>
      <View
        style={[styles.container, style]}
        onLayout={({ nativeEvent }) =>
          setSize({
            width: nativeEvent.layout.width,
            height: nativeEvent.layout.height,
          })
        }
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel="Carousel"
        accessibilityValue={{ text: `${center + 1} of ${count}` }}
        accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
        onAccessibilityAction={({ nativeEvent }) => {
          if (nativeEvent.actionName === "increment") shift(1);
          if (nativeEvent.actionName === "decrement") shift(-1);
        }}
      >
        {layout && (
          <Canvas style={StyleSheet.absoluteFill}>
            {drawOrder(count, center).map((i) => (
              <StretchCard
                key={i}
                source={images[i]}
                index={i}
                count={count}
                offset={offset}
                velocity={velocity}
                layout={layout}
                config={settings}
                rimColor={color}
                pixel={pixel}
              />
            ))}
          </Canvas>
        )}
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export { StretchCarousel };
