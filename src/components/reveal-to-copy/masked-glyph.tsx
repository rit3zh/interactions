import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from "react-native-reanimated";

import { GLYPH_SPRING, MASK_GLYPH } from "./constants";
import type { IMaskedGlyphProps } from "./interface";

function MaskedGlyph({ char, revealed, delay, textStyle }: IMaskedGlyphProps) {
  const progress = useSharedValue<number>(0);

  useEffect(() => {
    progress.set(withDelay(delay, withSpring(revealed ? 1 : 0, GLYPH_SPRING)));
  }, [revealed, delay, progress]);

  const maskStyle = useAnimatedStyle(() => {
    const p = progress.get();
    return {
      opacity: interpolate(p, [0, 0.45], [1, 0], Extrapolation.CLAMP),
      transform: [
        { translateY: interpolate(p, [0, 1], [0, 7]) },
        { scale: interpolate(p, [0, 1], [1, 0.4], Extrapolation.CLAMP) },
      ],
    };
  });

  const charStyle = useAnimatedStyle(() => {
    const p = progress.get();
    return {
      opacity: interpolate(p, [0.15, 0.9], [0, 1], Extrapolation.CLAMP),
      transform: [
        { translateY: interpolate(p, [0, 1], [-9, 0]) },
        { scale: interpolate(p, [0, 1], [0.72, 1]) },
      ],
    };
  });

  return (
    <View>
      <Text style={[textStyle, styles.sizer]}>{char}</Text>
      <Animated.Text style={[textStyle, styles.layer, maskStyle]}>{MASK_GLYPH}</Animated.Text>
      <Animated.Text style={[textStyle, styles.layer, charStyle]}>{char}</Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sizer: {
    opacity: 0,
  },
  layer: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
  },
});

export { MaskedGlyph };
