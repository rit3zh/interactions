import { Skia } from "@shopify/react-native-skia";

const SOURCE = /*glsl*/ `
uniform shader image;
uniform float2 resolution;
uniform float2 pointer;
uniform float press;
uniform float3 color;
uniform float strength;
uniform float reach;
uniform float falloff;
uniform float glare;
uniform float radius;
uniform float pixel;

float roundedBox(float2 p, float2 b, float r) {
  float2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

float glow(float d, float r) {
  return pow(1.0 - smoothstep(0.0, 1.0, d / r), falloff);
}

half4 main(float2 xy) {
  float edge = roundedBox(xy - resolution * 0.5, resolution * 0.5, radius);
  half coverage = half(clamp(0.5 - edge / pixel, 0.0, 1.0));
  if (coverage <= 0.0) return half4(0.0);

  half4 base = image.eval(xy);
  if (press < 0.001) return base * coverage;
  float d = length(xy - pointer) / resolution.y;
  float pct = glow(d, reach) * press;
  half3 lit = min(base.rgb + base.rgb * half3(color) * half(pct * strength), half3(1.0));

  float hot = glare * press * glow(d, reach * 0.35);
  lit = 1.0 - (1.0 - lit) * (1.0 - half3(color) * half(hot));

  return half4(lit * coverage, base.a * coverage);
}
`;

const SHINE_EFFECT = Skia.RuntimeEffect.Make(SOURCE)!;

export { SHINE_EFFECT };
