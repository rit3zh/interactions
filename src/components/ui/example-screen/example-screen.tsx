import { StyleSheet, View } from "react-native";

import type { IExampleScreenProps } from "./interface";

function ExampleScreen({
  children,
  centered,
  style,
  clean,
}: IExampleScreenProps) {
  return (
    <View
      style={[
        styles.flex,
        centered && styles.centered,
        clean && styles.clean,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  centered: {
    justifyContent: "center",
    paddingHorizontal: 16,
    alignItems: "center",
  },
  clean: {
    justifyContent: "center",
    paddingHorizontal: 16,
  },
});

export { ExampleScreen };
