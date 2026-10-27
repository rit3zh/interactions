import type { DataSourceParam } from "@shopify/react-native-skia";
import type { StyleProp, ViewStyle } from "react-native";

type TVec2 = [number, number];
type TVec3 = [number, number, number];

interface IShineConfig {
  aspect: number;
  radius: number;
  color: string;
  strength: number;
  reach: number;
  falloff: number;
  glare: number;
  tilt: number;
}

interface IShineCardProps {
  source: DataSourceParam;
  config?: Partial<IShineConfig>;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export type { TVec2, TVec3, IShineConfig, IShineCardProps };
