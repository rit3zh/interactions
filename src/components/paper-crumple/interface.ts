import type { DataSourceParam, SkColor, SkPoint } from "@shopify/react-native-skia";
import type { StyleProp, ViewStyle } from "react-native";

type TVec2 = [number, number];
type TVec3 = [number, number, number];
type TVec4 = [number, number, number, number];
type TPaperState = "flat" | "holding" | "crumpled" | "creased";
type TPaperRelease = "restore" | "creased" | "stay";

interface IPaperConfig {
  width: number;
  aspect: number;
  amount: number;
  release: TPaperRelease;
  crease: number;
  folds: number;
  sharpness: number;
  depth: number;
  detail: number;
  seed: number;
  paper: string;
  lightAngle: number;
  ambient: number;
  tilt: number;
  returnToOrigin: boolean;
  shadow: number;
}

interface IPaperMesh {
  count: number;
  rest: Float32Array;
  uvs: Float32Array;
  triangles: Int32Array;
  offsets: Int32Array;
  faces: Int32Array;
}

interface IPaperPath {
  frames: Float32Array;
  frameCount: number;
  creased: Float32Array;
}

interface IPaperFrame {
  vertices: SkPoint[];
  textures: SkPoint[];
  colors: SkColor[];
  screen: Float32Array;
  order: number[];
  bounds: TVec4;
}

interface IPaperGrip {
  indices: TVec3;
  weights: TVec3;
}

interface IPaperCrumpleProps {
  source: DataSourceParam;
  config?: Partial<IPaperConfig>;
  resetKey?: number | string;
  onStateChange?: (state: TPaperState) => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export type {
  TVec2,
  TVec3,
  TVec4,
  TPaperState,
  TPaperRelease,
  IPaperConfig,
  IPaperMesh,
  IPaperPath,
  IPaperFrame,
  IPaperGrip,
  IPaperCrumpleProps,
};
