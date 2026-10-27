import {
  Host,
  List,
  NavigationDestination,
  NavigationLink,
  NavigationStack,
  RNHostView,
  Text,
  VStack,
} from "@expo/ui/swift-ui";
import {
  font,
  foregroundStyle,
  frame,
  navigationBarTitleDisplayMode,
  navigationTitle,
  padding,
} from "@expo/ui/swift-ui/modifiers";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { EXAMPLES } from "./constants";
import type { INativeExampleListProps } from "./interface";

function NativeExampleList({ screens }: INativeExampleListProps) {
  const [path, setPath] = useState<string[]>([]);

  return (
    <Host style={styles.flex}>
      <NavigationStack path={path} onPathChange={setPath}>
        <List
          modifiers={[
            navigationTitle("Interactions"),
            navigationBarTitleDisplayMode("inline"),
          ]}
        >
          {EXAMPLES.map((example) => (
            <NavigationLink key={example.id} value={example.id}>
              <VStack
                alignment="leading"
                spacing={4}
                modifiers={[padding({ vertical: 4 })]}
              >
                <Text modifiers={[font({ textStyle: "headline" })]}>
                  {example.title}
                </Text>
                <Text
                  modifiers={[
                    font({ textStyle: "subheadline" }),
                    foregroundStyle({
                      type: "hierarchical",
                      style: "secondary",
                    }),
                  ]}
                >
                  {example.description}
                </Text>
              </VStack>
            </NavigationLink>
          ))}
        </List>
        {EXAMPLES.map((example) => {
          const Screen = screens[example.id];
          return (
            <NavigationDestination key={example.id} value={example.id}>
              <VStack
                modifiers={[
                  frame({ maxWidth: Infinity, maxHeight: Infinity }),
                  navigationTitle(example.title),
                  navigationBarTitleDisplayMode("inline"),
                ]}
              >
                {path.includes(example.id) && Screen ? (
                  <RNHostView>
                    <View style={styles.flex}>
                      <Screen />
                    </View>
                  </RNHostView>
                ) : null}
              </VStack>
            </NavigationDestination>
          );
        })}
      </NavigationStack>
    </Host>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});

export { NativeExampleList };
