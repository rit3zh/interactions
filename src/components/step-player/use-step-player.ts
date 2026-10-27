import { useEffect, useState } from "react";
import { Easing, cancelAnimation, useSharedValue, withTiming } from "react-native-reanimated";
import { scheduleOnRN, scheduleOnUI } from "react-native-worklets";

import type { IStepPlayerController, IUseStepPlayerOptions } from "./interface";

function useStepPlayer({
  count,
  stepDuration = 4000,
  loop = true,
  autoPlay = true,
}: IUseStepPlayerOptions): IStepPlayerController {
  const [at, setAt] = useState<number>(0);
  const [playing, setPlaying] = useState<boolean>(autoPlay);
  const progress = useSharedValue<number>(0);

  useEffect(() => {
    progress.set(0);
  }, [at, progress]);

  useEffect(() => {
    if (!playing) return;

    const advance = () => {
      if (at + 1 < count || loop) setAt((at + 1) % count);
      else setPlaying(false);
    };

    scheduleOnUI(() => {
      "worklet";
      const remaining = Math.max(0, 1 - progress.value) * stepDuration;
      progress.value = withTiming(1, { duration: remaining, easing: Easing.linear }, (finished) => {
        if (finished) scheduleOnRN(advance);
      });
    });
    return () => cancelAnimation(progress);
  }, [playing, at, count, loop, stepDuration, progress]);

  const pick = (index: number) => {
    if (index !== at) setAt(index);
  };

  const toggle = () => {
    if (!playing && at === count - 1 && progress.get() >= 1) {
      if (count > 1) setAt(0);
      else progress.set(0);
    }
    setPlaying(!playing);
  };

  return { at, playing, progress, pick, toggle };
}

export { useStepPlayer };
