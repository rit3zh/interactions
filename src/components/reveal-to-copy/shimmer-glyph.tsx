import Animated, { interpolate, useAnimatedStyle } from "react-native-reanimated";

import { SHIMMER_BAND, SHIMMER_DEPTH } from "./constants";
import type { IShimmerGlyphProps } from "./interface";

function ShimmerGlyph({ sweep, position, children }: IShimmerGlyphProps) {
  const style = useAnimatedStyle(() => {
    const center = interpolate(sweep.get(), [0, 1], [-SHIMMER_BAND, 1 + SHIMMER_BAND]);
    const x = Math.max(0, 1 - Math.abs(position - center) / SHIMMER_BAND);
    const falloff = x * x * (3 - 2 * x);
    return { opacity: 1 - SHIMMER_DEPTH * falloff };
  });

  return <Animated.View style={style}>{children}</Animated.View>;
}

export { ShimmerGlyph };
