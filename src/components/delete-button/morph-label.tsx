import { useEffect, useRef, useState } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { EASE_OUT, LABEL_BLUR, LABEL_RISE, SIZES, TIMING } from "./constants";
import type { ILabelSlotProps, IMorphLabelProps } from "./interface";

function Slot({
  index,
  text,
  swap,
  entering,
  color,
  onMeasure,
}: ILabelSlotProps) {
  const style = useAnimatedStyle<
    Pick<ViewStyle, "opacity" | "filter" | "transform">
  >(() => {
    const shown = index === 0 ? 1 - swap.get() : swap.get();
    const rise = (1 - shown) * LABEL_RISE * (entering ? 1 : -1);
    return {
      opacity: shown,
      filter: [{ blur: (1 - shown) * LABEL_BLUR }],
      transform: [{ translateY: rise }, { scale: 0.94 + shown * 0.06 }],
    };
  });

  const textStyle = useAnimatedStyle(() => ({ color: color.get() }));

  return (
    <Animated.View style={[styles.slot, style]}>
      <Animated.Text
        numberOfLines={1}
        style={[styles.text, textStyle]}
        onLayout={({ nativeEvent }) =>
          onMeasure(text, nativeEvent.layout.width)
        }
      >
        {text}
      </Animated.Text>
    </Animated.View>
  );
}

function MorphLabel({ text, color, onMeasure }: IMorphLabelProps) {
  const [slots, setSlots] = useState<[string, string]>([text, ""]);
  const [active, setActive] = useState<number>(0);
  const swap = useSharedValue<number>(0);
  const widths = useRef<Record<string, number>>({});

  if (slots[active] !== text) {
    const next = 1 - active;
    setSlots((prev) => (next === 0 ? [text, prev[1]] : [prev[0], text]));
    setActive(next);
  }

  useEffect(() => {
    swap.set(withTiming(active, { duration: TIMING.label, easing: EASE_OUT }));
  }, [active, swap]);

  useEffect(() => {
    const known = widths.current[text];
    if (known !== undefined) onMeasure?.(known);
  }, [text, onMeasure]);

  const measure = (slotText: string, width: number) => {
    if (!slotText) return;
    widths.current[slotText] = width;
    if (slotText === text) onMeasure?.(width);
  };

  return (
    <View
      pointerEvents="none"
      style={styles.container}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {slots.map((slotText, index) => (
        <Slot
          key={index}
          index={index}
          text={slotText}
          swap={swap}
          entering={index === active}
          color={color}
          onMeasure={measure}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slot: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: SIZES.fontSize,
    lineHeight: SIZES.lineHeight,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
});

export { MorphLabel };
