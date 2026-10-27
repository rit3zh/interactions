import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";

interface IExamplePalette {
  backdrop: [string, string];
  text: string;
  muted: string;
  card: string;
  border: string;
  pressed: string;
}

interface IExampleScreenProps {
  children: ReactNode;
  clean?: boolean;
  centered?: boolean;
  style?: StyleProp<ViewStyle>;
}

export type { IExamplePalette, IExampleScreenProps };
