import type { StyleProp, ViewStyle } from "react-native";
import type { SharedValue } from "react-native-reanimated";

type TQuad = readonly [number, number, number, number, number, number, number, number];

type TSlot = [number, number];

interface IStepPlayerProps {
  labels: string[];
  at: number;
  playing: boolean;
  progress: SharedValue<number>;
  onPick: (index: number) => void;
  onPeek?: (index: number) => void;
  onToggle: () => void;
  style?: StyleProp<ViewStyle>;
}

interface IWave {
  id: number;
  from: number;
  origin: number;
}

interface IWake {
  delay: number;
  share: number;
}

interface IStepDotColors {
  track: string;
  trackPressed: string;
  fill: string;
}

interface IStepDotProps {
  index: number;
  slot: TSlot;
  completed: boolean;
  active: boolean;
  progress: SharedValue<number>;
  waveId: number;
  wake: IWake | null;
  still: boolean;
  colors: IStepDotColors;
  pressedIndex: SharedValue<number>;
  pressAmount: SharedValue<number>;
}

interface IPlayPauseMarkProps {
  playing: boolean;
  size: number;
  still: boolean;
  color: string;
}

interface IUseStepPlayerOptions {
  count: number;
  stepDuration?: number;
  loop?: boolean;
  autoPlay?: boolean;
}

interface IStepPlayerController {
  at: number;
  playing: boolean;
  progress: SharedValue<number>;
  pick: (index: number) => void;
  toggle: () => void;
}

export type {
  TQuad,
  TSlot,
  IStepPlayerProps,
  IWave,
  IWake,
  IStepDotColors,
  IStepDotProps,
  IPlayPauseMarkProps,
  IUseStepPlayerOptions,
  IStepPlayerController,
};
