import { Skia } from "@shopify/react-native-skia";

const SOURCE = /*glsl*/ `
uniform shader image;
uniform float2 size;
uniform float3 paper;

half4 main(float2 xy) {
  if (xy.x > size.x * 2.0) {
    float grain = fract(sin(dot(floor(xy), float2(12.9898, 78.233))) * 43758.5453);
    return half4(half3(paper) * half(0.96 + grain * 0.08), 1.0);
  }
  return image.eval(xy);
}
`;

const PAPER_EFFECT = Skia.RuntimeEffect.Make(SOURCE)!;

export { PAPER_EFFECT };
