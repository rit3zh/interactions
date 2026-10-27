import type { StyleProp, ViewStyle } from "react-native";
import type { SharedValue } from "react-native-reanimated";

type TPoint = [number, number];

type TDeletePhase = "idle" | "confirm" | "deleting" | "deleted";

type TDeleteLabels = Record<TDeletePhase, string>;

interface IDeleteColors {
  danger: string;
  onDanger: string;
  dangerTint: string;
  holdFill: string;
  card: string;
  cardBorder: string;
  shadow: string;
  title: string;
  message: string;
  neutral: string;
  onNeutral: string;
}

interface IDeleteButtonProps {
  labels?: Partial<TDeleteLabels>;
  title?: string;
  message?: string;
  cancelLabel?: string;
  holdDuration?: number;
  onConfirm?: () => void | Promise<void>;
  style?: StyleProp<ViewStyle>;
}

interface IMorphLabelProps {
  text: string;
  color: SharedValue<string>;
  onMeasure?: (width: number) => void;
}

interface ILabelSlotProps {
  index: number;
  text: string;
  swap: SharedValue<number>;
  entering: boolean;
  color: SharedValue<string>;
  onMeasure: (text: string, width: number) => void;
}

interface ITrashIconProps {
  lid: SharedValue<number>;
  done: SharedValue<number>;
  color: SharedValue<string>;
  size: number;
}

export type {
  TPoint,
  TDeletePhase,
  TDeleteLabels,
  IDeleteColors,
  IDeleteButtonProps,
  IMorphLabelProps,
  ILabelSlotProps,
  ITrashIconProps,
};
