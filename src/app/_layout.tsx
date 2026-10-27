import { Stack } from "expo-router";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { EXAMPLES } from "@/components/ui/example-list";
import { useExamplePalette } from "@/components/ui/example-screen";

function RootLayout() {
  const palette = useExamplePalette();
  const surface = { backgroundColor: palette.backdrop[0] };

  return (
    <GestureHandlerRootView style={styles.root}>
      <Stack
        screenOptions={{
          headerStyle: surface,
          headerLargeStyle: surface,
          headerTintColor: palette.text,
          headerShadowVisible: false,
          headerBackButtonDisplayMode: "minimal",
          contentStyle: surface,
        }}
      >
        <Stack.Screen name="index" options={{ title: "Interactions", headerLargeTitle: true }} />
        {EXAMPLES.map((example) => (
          <Stack.Screen
            key={example.id}
            name={`examples/${example.id}`}
            options={{ title: example.title }}
          />
        ))}
      </Stack>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default RootLayout;
