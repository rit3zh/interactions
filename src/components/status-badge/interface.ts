import type { StyleProp, ViewStyle } from "react-native";
import type { SharedValue } from "react-native-reanimated";

type TStatus =
  | "pending"
  | "failed"
  | "success"
  | "progress"
  | "review"
  | "expired"
  | "submitted";

type TPoint = [number, number];

interface IStatusTone {
  background: string;
  foreground: string;
}

type TStatusTones = Record<TStatus, IStatusTone>;

interface IStatusShape {
  points: number[];
  glyph: boolean;
  spins: boolean;
}

interface IStatusBadgeProps {
  status: TStatus;
  labels?: Partial<Record<TStatus, string>>;
  tones?: Partial<TStatusTones>;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

interface IStatusIconProps {
  status: TStatus;
  color: SharedValue<string>;
  size: number;
}

interface IMorphLabelProps {
  text: string;
  color: SharedValue<string>;
  onMeasure: (width: number) => void;
}

interface IGlyph {
  char: string;
  key: string;
}

interface IGlyphProps {
  char: string;
  color: SharedValue<string>;
}

export type {
  TStatus,
  TPoint,
  IStatusTone,
  TStatusTones,
  IStatusShape,
  IStatusBadgeProps,
  IStatusIconProps,
  IMorphLabelProps,
  IGlyph,
  IGlyphProps,
};
