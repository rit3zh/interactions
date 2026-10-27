import type { IExamplePalette } from "./interface";

const LIGHT_PALETTE: IExamplePalette = {
  backdrop: ["#EEF1F8", "#F8F5F0"],
  text: "#14141A",
  muted: "#6E6E7A",
  card: "rgba(255, 255, 255, 0.72)",
  border: "rgba(20, 20, 26, 0.06)",
  pressed: "rgba(20, 20, 26, 0.05)",
};
const DARK_PALETTE: IExamplePalette = {
  backdrop: ["#0B0B10", "#15151D"],
  text: "#F2F2F5",
  muted: "#8C8C99",
  card: "rgba(255, 255, 255, 0.05)",
  border: "rgba(255, 255, 255, 0.07)",
  pressed: "rgba(255, 255, 255, 0.06)",
};

export { DARK_PALETTE, LIGHT_PALETTE };
