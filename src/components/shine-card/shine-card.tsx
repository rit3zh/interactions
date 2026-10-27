import {
  Canvas,
  Fill,
  ImageShader,
  Shader,
  useImage,
} from "@shopify/react-native-skia";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { PixelRatio, StyleSheet, View } from "react-native";
import { GestureDetector, usePanGesture } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import {
  DEFAULT_CONFIG,
  PERSPECTIVE,
  PRESSED_SCALE,
  PRESS_SPRING,
  RELEASE_SPRING,
  SAMPLING,
  SHADOW,
} from "./constants";
import type { IShineCardProps, TVec2 } from "./interface";
import { SHINE_EFFECT } from "./shader";
import { clamp, toRGB } from "./utils";

const touch = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);

function ShineCard({ source, config, accessibilityLabel, style }: IShineCardProps) {
  const settings = { ...DEFAULT_CONFIG, ...config };
  const image = useImage(source);

  const [size, setSize] = useState<TVec2 | null>(null);
  const bounds = useSharedValue<TVec2>([1, 1]);
  const pointer = useSharedValue<TVec2>([0, 0]);
  const press = useSharedValue<number>(0);

  const follow = (x: number, y: number) => {
    "worklet";
    const [width, height] = bounds.get();
    pointer.set([clamp(x, 0, width), clamp(y, 0, height)]);
  };

  const pan = usePanGesture({
    minDistance: 0,
    onBegin: (event) => {
      "worklet";
      follow(event.x, event.y);
      press.set(withSpring(1, PRESS_SPRING));
      scheduleOnRN(touch);
    },
    onUpdate: (event) => {
      "worklet";
      follow(event.x, event.y);
    },
    onFinalize: () => {
      "worklet";
      press.set(withSpring(0, RELEASE_SPRING));
    },
  });

  const color = toRGB(settings.color);
  const pixel = 1 / PixelRatio.get();

  const uniforms = useDerivedValue(() => ({
    resolution: bounds.get(),
    pointer: pointer.get(),
    press: press.get(),
    color,
    strength: settings.strength,
    reach: settings.reach,
    falloff: settings.falloff,
    glare: settings.glare,
    radius: settings.radius,
    pixel,
  }));

  const lean = useAnimatedStyle(() => {
    const [width, height] = bounds.get();
    const [x, y] = pointer.get();
    const amount = press.get();
    const nx = (x / width) * 2 - 1;
    const ny = (y / height) * 2 - 1;
    return {
      transform: [
        { perspective: PERSPECTIVE },
        { rotateX: `${-ny * settings.tilt * amount}deg` },
        { rotateY: `${nx * settings.tilt * amount}deg` },
        { scale: 1 - (1 - PRESSED_SCALE) * amount },
      ],
    };
  });

  return (
    <GestureDetector gesture={pan}>
      <View
        style={[styles.container, { aspectRatio: 1 / settings.aspect }, style]}
        onLayout={({ nativeEvent }) => {
          const next: TVec2 = [nativeEvent.layout.width, nativeEvent.layout.height];
          bounds.set(next);
          setSize(next);
        }}
        accessible
        accessibilityRole="image"
        accessibilityLabel={accessibilityLabel}
      >
        <Animated.View
          style={[
            styles.card,
            { borderRadius: settings.radius, boxShadow: SHADOW },
            lean,
          ]}
        >
          {size && image && (
            <Canvas style={StyleSheet.absoluteFill}>
              <Fill>
                <Shader source={SHINE_EFFECT} uniforms={uniforms}>
                  <ImageShader
                    image={image}
                    fit="cover"
                    sampling={SAMPLING}
                    rect={{ x: 0, y: 0, width: size[0], height: size[1] }}
                  />
                </Shader>
              </Fill>
            </Canvas>
          )}
        </Animated.View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  card: {
    flex: 1,
  },
});

export { ShineCard };
