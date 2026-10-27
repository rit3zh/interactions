import { StyleSheet, Text, View } from "react-native";
import Animated, {
  LinearTransition,
  useAnimatedStyle,
} from "react-native-reanimated";

import { EASE_OUT, SIZES, TIMING } from "./constants";
import type { IGlyphProps, IMorphLabelProps } from "./interface";
import { toGlyphs } from "./utils";

const MOVE = LinearTransition.duration(TIMING.label).easing(EASE_OUT);

function Glyph({ char, color }: IGlyphProps) {
  const style = useAnimatedStyle(() => ({ color: color.get() }));

  return (
    <Animated.Text layout={MOVE} style={[styles.text, style]}>
      {char}
    </Animated.Text>
  );
}

function MorphLabel({ text, color, onMeasure }: IMorphLabelProps) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {toGlyphs(text).map((glyph) => (
          <Glyph key={glyph.key} char={glyph.char} color={color} />
        ))}
      </View>
      <View
        style={styles.measure}
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Text
          style={styles.text}
          onLayout={({ nativeEvent }) => onMeasure(nativeEvent.layout.width)}
        >
          {text}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: SIZES.lineHeight,
  },
  row: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 9999,
    flexDirection: "row",
  },
  measure: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 9999,
    flexDirection: "row",
    alignItems: "flex-start",
    opacity: 0,
  },
  text: {
    fontSize: SIZES.fontSize,
    lineHeight: SIZES.lineHeight,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
});

export { MorphLabel };
