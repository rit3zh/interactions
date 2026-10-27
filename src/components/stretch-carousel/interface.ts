import type { DataSourceParam } from "@shopify/react-native-skia";
import type { StyleProp, ViewStyle } from "react-native";
import type { SharedValue } from "react-native-reanimated";

type TVec2 = [number, number];
type TVec3 = [number, number, number];

interface IStretchConfig {
  width: number;
  aspect: number;
  depth: number;
  lift: number;
  fov: number;
  radius: number;
  sheen: number;
  zone: number;
  flip: number;
  flipCurve: number;
  stretch: number;
  flare: number;
  flarePow: number;
  aberration: number;
  blur: number;
  smear: number;
  saturation: number;
  rim: number;
  rimWidth: number;
  rimHue: number;
  speedZone: number;
}

interface IStretchCarouselProps {
  images: DataSourceParam[];
  config?: Partial<IStretchConfig>;
  gap?: number;
  onIndexChange?: (index: number) => void;
  style?: StyleProp<ViewStyle>;
}

interface IStretchLayout {
  width: number;
  height: number;
  cardWidth: number;
  cardHeight: number;
  step: number;
  focal: number;
}

interface IStretchFrame {
  center: TVec3;
  angle: number;
  side: number;
  amount: number;
  speed: number;
  visible: number;
}

interface IStretchCardProps {
  source: DataSourceParam;
  index: number;
  count: number;
  offset: SharedValue<number>;
  velocity: SharedValue<number>;
  layout: IStretchLayout;
  config: IStretchConfig;
  rimColor: TVec3;
  pixel: number;
}

export type {
  TVec2,
  TVec3,
  IStretchConfig,
  IStretchCarouselProps,
  IStretchLayout,
  IStretchFrame,
  IStretchCardProps,
};
