import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

import { ExampleScreen } from "@/components/ui/example-screen";
import { STATUSES, StatusBadge } from "@/components/status-badge";

const AUTOPLAY: number = 1800;

const next = (index: number) => (index + 1) % STATUSES.length;

function StatusBadgeExample() {
  const [hero, setHero] = useState<number>(0);
  const [grid, setGrid] = useState<number[]>(() => STATUSES.map((_, i) => i));

  useEffect(() => {
    const id = setInterval(() => setHero(next), AUTOPLAY);
    return () => clearInterval(id);
  }, []);

  const advance = (slot: number) =>
    setGrid((prev) =>
      prev.map((value, i) => (i === slot ? next(value) : value)),
    );

  return (
    <ExampleScreen centered>
      <View style={styles.hero}>
        <StatusBadge status={STATUSES[hero]} onPress={() => setHero(next)} />
      </View>
    </ExampleScreen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: "center",
    marginBottom: 56,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
  },
});

export default StatusBadgeExample;
