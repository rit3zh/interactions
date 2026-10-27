import {
  Fill,
  FilterMode,
  ImageShader,
  MipmapMode,
  Shader,
  useImage,
} from "@shopify/react-native-skia";
import { useDerivedValue } from "react-native-reanimated";

import type { IStretchCardProps } from "./interface";
import { STRETCH_EFFECT } from "./shader";
import { frame } from "./utils";

const SAMPLING = { filter: FilterMode.Linear, mipmap: MipmapMode.Linear };

function StretchCard({
  source,
  index,
  count,
  offset,
  velocity,
  layout,
  config,
  rimColor,
  pixel,
}: IStretchCardProps) {
  const image = useImage(source);

  const uniforms = useDerivedValue(() => {
    const at = frame(index, count, offset.get(), velocity.get(), layout, config);
    return {
      resolution: [layout.width, layout.height],
      cardSize: [layout.cardWidth, layout.cardHeight],
      center: at.center,
      angle: at.angle,
      focal: layout.focal,
      side: at.side,
      amount: at.amount,
      speed: at.speed,
      visible: at.visible,
      stretch: config.stretch,
      flare: config.flare,
      flarePow: config.flarePow,
      aberration: config.aberration,
      blur: config.blur,
      smear: config.smear,
      saturation: config.saturation,
      rim: config.rim,
      rimWidth: config.rimWidth,
      rimColor,
      radius: config.radius,
      sheen: config.sheen,
      pixel,
    };
  });

  if (!image) return null;

  return (
    <Fill>
      <Shader source={STRETCH_EFFECT} uniforms={uniforms}>
        <ImageShader
          image={image}
          fit="cover"
          tx="clamp"
          ty="clamp"
          sampling={SAMPLING}
          rect={{ x: 0, y: 0, width: layout.cardWidth, height: layout.cardHeight }}
        />
      </Shader>
    </Fill>
  );
}

export { StretchCard };
