import type { ReactNode } from "react";
import type { StyleProp, TextStyle, ViewStyle } from "react-native";
import type { SharedValue } from "react-native-reanimated";

type TRevealState = "hidden" | "revealed" | "copied";

type TPoint = [number, number];

interface IRevealToCopyProps {
  value: string;
  label?: string;
  visibleStart?: number;
  visibleEnd?: number;
  groupSize?: number;
  revealDuration?: number;
  onCopy?: (value: string) => void;
  style?: StyleProp<ViewStyle>;
}

interface IGlyph {
  char: string;
  position: number;
  maskOrder: number | null;
}

interface IMaskedGlyphProps {
  char: string;
  revealed: boolean;
  delay: number;
  textStyle: TextStyle;
}

interface IShimmerGlyphProps {
  sweep: SharedValue<number>;
  position: number;
  children: ReactNode;
}

interface IActionButtonProps {
  state: TRevealState;
  revealDuration: number;
  onPress: () => void;
}

interface ICountdownRingProps {
  active: boolean;
  duration: number;
}

interface IMorphIconProps {
  state: TRevealState;
  colors: Record<TRevealState, string>;
  size?: number;
}

export type {
  TRevealState,
  TPoint,
  IRevealToCopyProps,
  IGlyph,
  IMaskedGlyphProps,
  IShimmerGlyphProps,
  IActionButtonProps,
  ICountdownRingProps,
  IMorphIconProps,
};
