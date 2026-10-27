import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { DeleteButton } from "@/components/delete-button";
import { ExampleScreen } from "@/components/ui/example-screen";

const deleteAccount = () =>
  new Promise<void>((resolve) => setTimeout(resolve, 1400));

function DeleteButtonExample() {
  const insets = useSafeAreaInsets();

  return (
    <ExampleScreen
      style={[styles.screen, { paddingTop: insets.top + insets.bottom * 2.5 }]}
    >
      <DeleteButton onConfirm={deleteAccount} />
    </ExampleScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    justifyContent: "center",

    paddingHorizontal: 25,
  },
});

export default DeleteButtonExample;
