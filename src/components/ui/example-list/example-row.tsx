import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

import type { IExampleRowProps } from "./interface";

function ExampleRow({ example, palette }: IExampleRowProps) {
  return (
    <Link href={example.href} asChild>
      <Pressable
        accessibilityRole="link"
        accessibilityHint="Opens the example"
        style={({ pressed }) => [
          styles.row,
          {
            backgroundColor: pressed ? palette.pressed : palette.card,
            borderColor: palette.border,
          },
        ]}
      >
        <View style={styles.text}>
          <Text style={[styles.title, { color: palette.text }]}>{example.title}</Text>
          <Text style={[styles.description, { color: palette.muted }]}>
            {example.description}
          </Text>
        </View>
        <Svg width={8} height={14} viewBox="0 0 8 14" accessibilityElementsHidden>
          <Path
            d="M1 1l6 6-6 6"
            stroke={palette.muted}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </Svg>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderCurve: "continuous",
    borderWidth: StyleSheet.hairlineWidth,
  },
  text: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
  },
  description: {
    fontSize: 14,
    lineHeight: 19,
  },
});

export { ExampleRow };
