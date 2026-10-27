import { Stack } from "expo-router";

import {
  NativeExampleList,
  type TExampleScreens,
} from "@/components/ui/example-list";

import DeleteButtonExample from "./examples/delete-button";
import GlowSliderExample from "./examples/glow-slider";
import PaperCrumpleExample from "./examples/paper-crumple";
import RevealToCopyExample from "./examples/reveal-to-copy";
import ShineCardExample from "./examples/shine-card";
import StatusBadgeExample from "./examples/status-badge";
import StepPlayerExample from "./examples/step-player";
import StretchCarouselExample from "./examples/stretch-carousel";

const SCREENS: TExampleScreens = {
  "paper-crumple": PaperCrumpleExample,
  "shine-card": ShineCardExample,
  "stretch-carousel": StretchCarouselExample,
  "step-player": StepPlayerExample,
  "reveal-to-copy": RevealToCopyExample,
  "status-badge": StatusBadgeExample,
  "glow-slider": GlowSliderExample,
  "delete-button": DeleteButtonExample,
};

function Index() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <NativeExampleList screens={SCREENS} />
    </>
  );
}

export default Index;
