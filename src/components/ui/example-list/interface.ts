import type { Href } from "expo-router";
import type { ComponentType } from "react";

import type { IExamplePalette } from "@/components/ui/example-screen";

interface IExample {
  id: string;
  title: string;
  description: string;
  href: Href;
}

interface IExampleRowProps {
  example: IExample;
  palette: IExamplePalette;
}

type TExampleScreens = Record<string, ComponentType>;

interface INativeExampleListProps {
  screens: TExampleScreens;
}

export type { IExample, IExampleRowProps, INativeExampleListProps, TExampleScreens };
