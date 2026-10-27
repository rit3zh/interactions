import { ScrollView, StyleSheet } from "react-native";

import { useExamplePalette } from "@/components/ui/example-screen";

import { EXAMPLES } from "./constants";
import { ExampleRow } from "./example-row";

function ExampleList() {
  const palette = useExamplePalette();

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
    >
      {EXAMPLES.map((example) => (
        <ExampleRow key={example.title} example={example} palette={palette} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 12,
    padding: 16,
  },
});

export { ExampleList };
