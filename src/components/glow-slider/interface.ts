import type { StyleProp, ViewStyle } from "react-native";

type TVec2 = [number, number];
type TVec3 = [number, number, number];
type TVec4 = [number, number, number, number];

interface IGlowSliderConfig {
  height: number;
  inset: number;
  tint: string;
  knob: string;
}

interface IGlowSliderColors {
  track: string;
  mark: string;
  markLit: string;
}

interface IGlowSliderProps {
  labels: string[];
  value: number;
  onChange: (value: number) => void;
  recommended?: number;
  config?: Partial<IGlowSliderConfig>;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export type { TVec2, TVec3, TVec4, IGlowSliderConfig, IGlowSliderColors, IGlowSliderProps };
