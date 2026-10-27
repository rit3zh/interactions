import { useState } from "react";

import { ExampleScreen } from "@/components/ui/example-screen";
import { GlowSlider } from "@/components/glow-slider";

const LEVELS: string[] = ["Off", "Low", "Medium", "High", "Very high", "Max"];
const RECOMMENDED: number = 1;

function GlowSliderExample() {
  const [level, setLevel] = useState<number>(4);

  return (
    <ExampleScreen clean>
      <GlowSlider
        labels={LEVELS}
        value={level}
        onChange={setLevel}
        recommended={RECOMMENDED}
        accessibilityLabel="Effort"
      />
    </ExampleScreen>
  );
}

export default GlowSliderExample;
