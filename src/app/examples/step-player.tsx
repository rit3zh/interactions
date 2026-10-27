import { StyleSheet } from "react-native";

import { ExampleScreen } from "@/components/ui/example-screen";
import { StepPlayer, useStepPlayer } from "@/components/step-player";

const STEPS: string[] = ["Intro", "Setup", "Connect", "Sync", "Review", "Done"];

function StepPlayerExample() {
  const player = useStepPlayer({ count: STEPS.length, stepDuration: 3000 });

  return (
    <ExampleScreen centered>
      <StepPlayer
        labels={STEPS}
        at={player.at}
        playing={player.playing}
        progress={player.progress}
        onPick={player.pick}
        onToggle={player.toggle}
        style={styles.player}
      />
    </ExampleScreen>
  );
}

const styles = StyleSheet.create({
  player: {
    alignSelf: "center",
  },
});

export default StepPlayerExample;
