import { useEffect } from "react";
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";

import { EASE_SWING, PAUSE_LEFT, PAUSE_RIGHT, PLAY_LEFT, PLAY_RIGHT, TIMING } from "./constants";
import type { IPlayPauseMarkProps, TQuad } from "./interface";

const AnimatedPath = Animated.createAnimatedComponent(Path);

function quad(from: TQuad, to: TQuad, t: number, shift: number) {
  "worklet";
  let d = "";
  for (let i = 0; i < 8; i += 2) {
    const x = from[i] + (to[i] - from[i]) * t + shift;
    const y = from[i + 1] + (to[i + 1] - from[i + 1]) * t;
    d += `${i ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  return `${d}Z`;
}

function goo(t: number) {
  "worklet";
  return Math.sin(Math.min(1, Math.max(0, t)) * Math.PI);
}

function PlayPauseMark({ playing, size, still, color }: IPlayPauseMarkProps) {
  const t = useSharedValue<number>(playing ? 0 : 1);
  const tip = useSharedValue<number>(playing ? -9 : 9);

  useEffect(() => {
    const target = playing ? 0 : 1;
    tip.set(playing ? -9 : 9);
    t.set(still ? target : withTiming(target, { duration: TIMING.mark, easing: EASE_SWING }));
  }, [playing, still, t, tip]);

  const markStyle = useAnimatedStyle(() => {
    const g = goo(t.get());
    return {
      transform: [
        { rotate: `${tip.get() * g}deg` },
        { scaleX: 1 - 0.13 * g },
        { scaleY: 1 + 0.11 * g },
      ],
    };
  });

  const leftProps = useAnimatedProps(() => ({
    d: quad(PAUSE_LEFT, PLAY_LEFT, t.get(), 1.6 * goo(t.get())),
  }));

  const rightProps = useAnimatedProps(() => ({
    d: quad(PAUSE_RIGHT, PLAY_RIGHT, t.get(), -1.6 * goo(t.get())),
  }));

  return (
    <Animated.View style={markStyle}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <AnimatedPath
          fill={color}
          stroke={color}
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
          animatedProps={leftProps}
        />
        <AnimatedPath
          fill={color}
          stroke={color}
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
          animatedProps={rightProps}
        />
      </Svg>
    </Animated.View>
  );
}

export { PlayPauseMark };
