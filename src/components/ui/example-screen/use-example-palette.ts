import { useColorScheme } from "react-native";

import { DARK_PALETTE, LIGHT_PALETTE } from "./constants";

function useExamplePalette() {
  return useColorScheme() === "dark" ? DARK_PALETTE : LIGHT_PALETTE;
}

export { useExamplePalette };
