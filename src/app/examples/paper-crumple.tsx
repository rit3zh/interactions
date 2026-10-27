import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ExampleScreen, useExamplePalette } from "@/components/ui/example-screen";
import { PaperCrumple, type TPaperRelease } from "@/components/paper-crumple";

const RELEASES: { value: TPaperRelease; label: string }[] = [
  { value: "restore", label: "Restore" },
  { value: "creased", label: "Creased" },
  { value: "stay", label: "Stay" },
];

const _image: string = `https://i.pinimg.com/736x/91/36/43/913643158b49b02b8f337ec21733ed8b.jpg`;
function PaperCrumpleExample() {
  const palette = useExamplePalette();
  const [release, setRelease] = useState<TPaperRelease>("creased");
  const [resetKey, setResetKey] = useState<number>(0);

  const pill = (active: boolean) => [
    styles.pill,
    {
      backgroundColor: active ? palette.text : palette.card,
      borderColor: palette.border,
    },
  ];

  return (
    <ExampleScreen>
      <PaperCrumple
        source={_image}
        config={{ release }}
        resetKey={resetKey}
        accessibilityLabel="Crumplable photo"
      />
      <View style={styles.controls}>
        {RELEASES.map((option) => {
          const active = option.value === release;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              onPress={() => setRelease(option.value)}
              style={pill(active)}
            >
              <Text
                style={[
                  styles.label,
                  { color: active ? palette.backdrop[0] : palette.text },
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
        <Pressable
          accessibilityRole="button"
          onPress={() => setResetKey((key) => key + 1)}
          style={pill(false)}
        >
          <Text style={[styles.label, { color: palette.muted }]}>Reset</Text>
        </Pressable>
      </View>
    </ExampleScreen>
  );
}

const styles = StyleSheet.create({
  controls: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  pill: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
});

export default PaperCrumpleExample;
