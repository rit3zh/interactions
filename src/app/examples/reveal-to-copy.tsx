import { StyleSheet, View } from "react-native";

import { ExampleScreen } from "@/components/ui/example-screen";
import { RevealToCopy } from "@/components/reveal-to-copy";

function RevealToCopyExample() {
  return (
    <ExampleScreen clean>
      <View style={styles.list}>
        <RevealToCopy label="Card Number" value="4485 1996 2057 7516" />
        <RevealToCopy
          label="API Key"
          value="sk_live_51HxQ2bLk9Vt3mZr"
          visibleStart={8}
          visibleEnd={4}
          groupSize={0}
        />
      </View>
    </ExampleScreen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 28,
  },
});

export default RevealToCopyExample;
