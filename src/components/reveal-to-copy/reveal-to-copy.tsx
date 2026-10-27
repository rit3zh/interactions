import * as Clipboard from "expo-clipboard";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  useColorScheme,
  type TextStyle,
} from "react-native";
import { useSharedValue, withDelay, withTiming } from "react-native-reanimated";

import { ActionButton } from "./action-button";
import { EASE_OUT, SIZES, TIMING } from "./constants";
import type { IGlyph, IRevealToCopyProps, TRevealState } from "./interface";
import { MaskedGlyph } from "./masked-glyph";
import { ShimmerGlyph } from "./shimmer-glyph";

function buildGroups(
  raw: string,
  visibleStart: number,
  visibleEnd: number,
  groupSize: number,
) {
  let maskOrder = 0;
  const glyphs: IGlyph[] = [...raw].map((char, index) => {
    const masked = index >= visibleStart && index < raw.length - visibleEnd;
    const position = (index + 0.5) / raw.length;
    return { char, position, maskOrder: masked ? maskOrder++ : null };
  });

  const size = groupSize > 0 ? groupSize : glyphs.length;
  const groups: IGlyph[][] = [];
  for (let i = 0; i < glyphs.length; i += size) {
    groups.push(glyphs.slice(i, i + size));
  }
  return { groups, maskedCount: maskOrder };
}

function RevealToCopy({
  value,
  label,
  visibleStart = 4,
  visibleEnd = 4,
  groupSize = 4,
  revealDuration = TIMING.revealDuration,
  onCopy,
  style,
}: IRevealToCopyProps) {
  const isDark = useColorScheme() === "dark";
  const hasGlass = isLiquidGlassAvailable();
  const [state, setState] = useState<TRevealState>("hidden");
  const sweep = useSharedValue<number>(0);

  const raw = value.replace(/\s+/g, "");
  const { groups, maskedCount } = buildGroups(
    raw,
    visibleStart,
    visibleEnd,
    groupSize,
  );
  const revealed = state !== "hidden";

  useEffect(() => {
    if (state === "hidden") return;
    const timeout = setTimeout(
      () => setState("hidden"),
      state === "revealed" ? revealDuration : TIMING.copiedHold,
    );
    return () => clearTimeout(timeout);
  }, [state, revealDuration]);

  useEffect(() => {
    if (state !== "revealed") return;
    sweep.set(0);
    sweep.set(
      withDelay(
        TIMING.shimmerDelay + maskedCount * TIMING.stagger * 0.5,
        withTiming(1, { duration: TIMING.shimmerDuration, easing: EASE_OUT }),
      ),
    );
  }, [state, maskedCount, sweep]);

  const handlePress = async () => {
    if (state === "hidden") {
      setState("revealed");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else if (state === "revealed") {
      setState("copied");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await Clipboard.setStringAsync(raw);
      onCopy?.(raw);
    }
  };

  const textStyle: TextStyle = {
    ...styles.text,
    color: isDark ? "#FFFFFF" : "#1C1C1E",
  };

  return (
    <View style={style}>
      <GlassView
        glassEffectStyle="regular"
        style={[
          styles.field,
          !hasGlass && (isDark ? styles.fallbackDark : styles.fallbackLight),
        ]}
      >
        <View
          accessible
          accessibilityLabel={`${label ?? "Value"}, ${revealed ? raw.split("").join(" ") : "hidden"}`}
          style={styles.groups}
        >
          {groups.map((group, groupIndex) => (
            <View key={groupIndex} style={styles.group}>
              {group.map((glyph, index) => (
                <ShimmerGlyph
                  key={index}
                  sweep={sweep}
                  position={glyph.position}
                >
                  {glyph.maskOrder === null ? (
                    <Text style={textStyle}>{glyph.char}</Text>
                  ) : (
                    <MaskedGlyph
                      char={glyph.char}
                      revealed={revealed}
                      textStyle={textStyle}
                      delay={
                        revealed
                          ? glyph.maskOrder * TIMING.stagger
                          : (maskedCount - 1 - glyph.maskOrder) *
                            TIMING.hideStagger
                      }
                    />
                  )}
                </ShimmerGlyph>
              ))}
            </View>
          ))}
        </View>
        <ActionButton
          state={state}
          revealDuration={revealDuration}
          onPress={handlePress}
        />
      </GlassView>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 8,
    marginLeft: 20,
  },
  field: {
    height: SIZES.height,
    borderRadius: SIZES.height / 2,
    borderCurve: "continuous",
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 20,
    paddingRight: (SIZES.height - SIZES.ring) / 2,
  },
  fallbackLight: {
    backgroundColor: "rgba(255, 255, 255, 0.72)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(60, 60, 67, 0.12)",
  },
  fallbackDark: {
    backgroundColor: "rgba(44, 44, 46, 0.72)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(235, 235, 245, 0.1)",
  },
  groups: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  group: {
    flexDirection: "row",
  },
  text: {
    fontSize: SIZES.fontSize,
    fontWeight: "500",
    fontVariant: ["tabular-nums"],
    letterSpacing: 0.4,
  },
});

export { RevealToCopy };
