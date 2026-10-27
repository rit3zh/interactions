import {
  Canvas,
  Picture,
  useImage,
  type SkPicture,
} from "@shopify/react-native-skia";
import * as Haptics from "expo-haptics";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { GestureDetector, usePanGesture } from "react-native-gesture-handler";
import {
  cancelAnimation,
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
  withSequence,
  withSpring,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import {
  CRINKLE_STEP,
  CRUMPLE_SPRING,
  DEFAULT_CONFIG,
  EDGE,
  MAX_HEIGHT,
  MOVE_SPRING,
  RELEASE_SPRING,
  TILT_SPEED,
  TILT_SPRING,
} from "./constants";
import type {
  IPaperCrumpleProps,
  IPaperFrame,
  IPaperGrip,
  IPaperPath,
  TPaperState,
  TVec2,
} from "./interface";
import { meshFor, pathFor } from "./simulation";
import {
  centerUnder,
  clamp,
  hitTest,
  lightFrom,
  makePaint,
  pose,
  project,
  record,
  smoothstep,
} from "./utils";

const grab = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
const crinkle = () => Haptics.selectionAsync();

function PaperCrumple({
  source,
  config,
  resetKey,
  onStateChange,
  accessibilityLabel,
  style,
}: IPaperCrumpleProps) {
  const settings = { ...DEFAULT_CONFIG, ...config };
  const { aspect, detail, folds, sharpness, depth, seed } = settings;
  const image = useImage(source);
  const mesh = meshFor(aspect, detail, seed);

  const [scene, setScene] = useState<TVec2>([0, 0]);
  const path = useSharedValue<IPaperPath | null>(null);
  const amount = useSharedValue<number>(0);
  const memory = useSharedValue<number>(0);
  const posX = useSharedValue<number>(0);
  const posY = useSharedValue<number>(0);
  const tiltX = useSharedValue<number>(0);
  const tiltY = useSharedValue<number>(0);
  const held = useSharedValue<boolean>(false);
  const finger = useSharedValue<TVec2>([0, 0]);
  const grip = useSharedValue<IPaperGrip>({
    indices: [0, 0, 0],
    weights: [1, 0, 0],
  });

  useEffect(() => {
    let live: boolean = true;
    path.set(null);
    pathFor(mesh, aspect, detail, folds, sharpness, depth, seed).then(
      (result) => {
        if (live) path.set(result);
      },
    );
    return () => {
      live = false;
    };
  }, [path, mesh, aspect, detail, folds, sharpness, depth, seed]);

  const width = Math.min(
    scene[0] * settings.width,
    (scene[1] * MAX_HEIGHT) / aspect,
  );
  const size: TVec2 = [width, width * aspect];
  const origin: TVec2 = [scene[0] / 2, scene[1] / 2];
  const light = lightFrom(settings.lightAngle);
  const paint =
    image && width > 0
      ? makePaint(image, size, settings.paper, settings.shadow)
      : null;

  const publish = (state: TPaperState) => onStateChange?.(state);

  const local = useDerivedValue<Float32Array>(() =>
    pose(
      mesh,
      path.get(),
      amount.get(),
      memory.get(),
      tiltX.get(),
      tiltY.get(),
      width,
    ),
  );

  const center = useDerivedValue<TVec2>(() =>
    held.get()
      ? centerUnder(local.get(), grip.get(), finger.get())
      : [origin[0] + posX.get(), origin[1] + posY.get()],
  );

  const frame = useDerivedValue<IPaperFrame>(() => {
    const lighting = smoothstep(
      0,
      0.4,
      clamp(amount.get(), 0, 1) + memory.get(),
    );
    return project(
      mesh,
      local.get(),
      center.get(),
      lighting,
      light,
      settings.ambient,
      sharpness,
      size,
    );
  });

  const picture = useDerivedValue<SkPicture>(() => record(frame.get(), paint));

  useAnimatedReaction<number>(
    () => (held.get() ? Math.floor(amount.get() / CRINKLE_STEP) : -1),
    (now, before) => {
      if (before !== null && before >= 0 && now > before) scheduleOnRN(crinkle);
    },
  );

  const release = () => {
    "worklet";
    const [x, y] = center.get();
    const [minX, minY, maxX, maxY] = frame.get().bounds;
    const stay = settings.release === "stay";
    const keep =
      settings.release === "creased"
        ? Math.max(memory.get(), amount.get() * settings.crease)
        : 0;
    const home = settings.returnToOrigin && !stay;
    const limitX = Math.max(
      0,
      origin[0] - (stay ? (maxX - minX) / 2 : size[0] / 2) - EDGE,
    );
    const limitY = Math.max(
      0,
      origin[1] - (stay ? (maxY - minY) / 2 : size[1] / 2) - EDGE,
    );

    held.set(false);
    posX.set(x - origin[0]);
    posY.set(y - origin[1]);
    posX.set(
      withSpring(home ? 0 : clamp(x - origin[0], -limitX, limitX), MOVE_SPRING),
    );
    posY.set(
      withSpring(home ? 0 : clamp(y - origin[1], -limitY, limitY), MOVE_SPRING),
    );
    tiltX.set(withSpring(0, TILT_SPRING));
    tiltY.set(withSpring(0, TILT_SPRING));

    if (stay) {
      cancelAnimation(amount);
    } else {
      amount.set(withSpring(0, RELEASE_SPRING));
      memory.set(withSpring(keep, RELEASE_SPRING));
    }
    scheduleOnRN(publish, stay ? "crumpled" : keep > 0 ? "creased" : "flat");
  };

  const pan = usePanGesture({
    minDistance: 0,
    onBegin: (event) => {
      "worklet";
      if (!path.get() || held.get()) return;
      const hit = hitTest(mesh, frame.get(), event.x, event.y);
      if (!hit) return;
      cancelAnimation(posX);
      cancelAnimation(posY);
      grip.set(hit);
      finger.set([event.x, event.y]);
      held.set(true);
      amount.set(
        withSpring(Math.max(amount.get(), settings.amount), CRUMPLE_SPRING),
      );
      scheduleOnRN(grab);
      scheduleOnRN(publish, "holding");
    },
    onUpdate: (event) => {
      "worklet";
      if (!held.get()) return;
      finger.set([
        clamp(event.x, EDGE, scene[0] - EDGE),
        clamp(event.y, EDGE, scene[1] - EDGE),
      ]);
      const lean = (settings.tilt * Math.PI) / 180;
      const leanX = clamp(event.velocityY / TILT_SPEED, -1, 1) * lean;
      const leanY = clamp(event.velocityX / TILT_SPEED, -1, 1) * lean;
      tiltX.set(
        withSequence(
          withSpring(leanX, TILT_SPRING),
          withSpring(0, TILT_SPRING),
        ),
      );
      tiltY.set(
        withSequence(
          withSpring(leanY, TILT_SPRING),
          withSpring(0, TILT_SPRING),
        ),
      );
    },
    onFinalize: () => {
      "worklet";
      if (held.get()) release();
    },
  });

  const flatten = () => {
    amount.set(withSpring(0, RELEASE_SPRING));
    memory.set(withSpring<number>(0, RELEASE_SPRING));
    posX.set(withSpring(0, MOVE_SPRING));
    posY.set(withSpring(0, MOVE_SPRING));
    publish("flat");
  };

  const lastReset = useRef<number | string | undefined>(resetKey);
  useEffect(() => {
    if (lastReset.current === resetKey) return;
    lastReset.current = resetKey;
    flatten();
  }, [resetKey]);

  const toggle = () => {
    if (amount.get() > 0.1) return flatten();
    amount.set(withSpring(settings.amount, CRUMPLE_SPRING));
    publish("crumpled");
  };

  return (
    <GestureDetector gesture={pan}>
      <View
        style={[styles.container, style]}
        onLayout={({ nativeEvent }) =>
          setScene([nativeEvent.layout.width, nativeEvent.layout.height])
        }
        accessible
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint="Hold to crumple, drag to move"
        accessibilityActions={[{ name: "activate" }]}
        onAccessibilityAction={toggle}
      >
        <Canvas style={StyleSheet.absoluteFill}>
          <Picture picture={picture} />
        </Canvas>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export { PaperCrumple };
