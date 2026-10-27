import { StyleSheet, View, ViewStyle } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";

import { CHECK_LENGTH, SIZES } from "./constants";
import type { ITrashIconProps } from "./interface";
import { lidPath } from "./utils";

const AnimatedPath = Animated.createAnimatedComponent(Path);

const BODY =
  "M5.6 7 L6.7 18.9 Q6.9 20.5 8.5 20.5 L15.5 20.5 Q17.1 20.5 17.3 18.9 L18.4 7 " +
  "M10 10.8 V16.6 M14 10.8 V16.6";
const CHECK = "M5 12.6 L9.8 17.2 L19 7.2";

function TrashIcon({ lid, done, color, size }: ITrashIconProps) {
  const bodyProps = useAnimatedProps(() => ({ stroke: color.get() }));

  const lidProps = useAnimatedProps(() => ({
    d: lidPath(lid.get()),
    stroke: color.get(),
  }));

  const checkProps = useAnimatedProps(() => ({
    stroke: color.get(),
    strokeDashoffset:
      CHECK_LENGTH *
      (1 - interpolate(done.get(), [0.35, 1], [0, 1], Extrapolation.CLAMP)),
  }));

  const trashStyle = useAnimatedStyle<ViewStyle>(() => {
    const d = done.get();
    return {
      opacity: interpolate(d, [0, 0.5], [1, 0], Extrapolation.CLAMP),
      transform: [{ scale: 1 - d * 0.4 }],
    };
  });

  return (
    <View style={{ width: size, height: size }}>
      <Animated.View style={[StyleSheet.absoluteFill, trashStyle]}>
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <AnimatedPath
            d={BODY}
            strokeWidth={SIZES.stroke}
            strokeLinecap="round"
            strokeLinejoin="round"
            animatedProps={bodyProps}
          />
          <AnimatedPath
            strokeWidth={SIZES.stroke}
            strokeLinecap="round"
            strokeLinejoin="round"
            animatedProps={lidProps}
          />
        </Svg>
      </Animated.View>
      <Svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        style={StyleSheet.absoluteFill}
      >
        <AnimatedPath
          d={CHECK}
          strokeWidth={SIZES.stroke + 0.3}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={CHECK_LENGTH}
          animatedProps={checkProps}
        />
      </Svg>
    </View>
  );
}

export { TrashIcon };
