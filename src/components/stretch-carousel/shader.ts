import { Skia } from "@shopify/react-native-skia";

const SOURCE = /*glsl*/ `
uniform shader image;
uniform float2 resolution;
uniform float2 cardSize;
uniform float3 center;
uniform float angle;
uniform float focal;
uniform float side;
uniform float amount;
uniform float speed;
uniform float visible;
uniform float stretch;
uniform float flare;
uniform float flarePow;
uniform float aberration;
uniform float blur;
uniform float smear;
uniform float saturation;
uniform float rim;
uniform float rimWidth;
uniform float3 rimColor;
uniform float radius;
uniform float sheen;
uniform float pixel;

const int TAPS = 10;

float roundedBox(float2 p, float2 b, float r) {
  float2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

half3 split(float2 at, float shift) {
  half r = image.eval(at + float2(shift, 0.0)).r;
  half g = image.eval(at).g;
  half b = image.eval(at - float2(shift, 0.0)).b;
  return half3(r, g, b);
}

half4 main(float2 xy) {
  if (visible < 0.5) return half4(0.0);

  float3 ray = float3(xy - resolution * 0.5, focal);
  float c = cos(angle);
  float s = sin(angle);
  float3 axis = float3(c, 0.0, s);
  float3 normal = float3(-s, 0.0, c);
  float t = dot(center, normal) / dot(ray, normal);
  if (t <= 0.0) return half4(0.0);

  float3 hit = ray * t - center;
  float2 extent = cardSize * 0.5;
  float k = stretch * amount;

  float along = (dot(hit, axis) * side + extent.x) / cardSize.x;
  float lead = 1.0 + 2.0 * k;
  float u = k > 0.0001
    ? (lead - sqrt(max(lead * lead - 4.0 * k * clamp(along, 0.0, 1.0 + k), 0.0))) / (2.0 * k)
    : along;
  if (along < 0.0) u = along * (k > 0.0001 ? 1.0 / lead : 1.0);
  if (along > 1.0 + k) u = 1.0 + (along - 1.0 - k);
  float outer = clamp(along, 0.0, 1.0);
  float grow = 1.0 + 2.0 * k * (1.0 - clamp(u, 0.0, 1.0));
  float tall = 1.0 + flare * amount * pow(outer, flarePow);
  float2 card = float2(side > 0.0 ? u : 1.0 - u, hit.y / (extent.y * tall) * 0.5 + 0.5) * cardSize;
  float dist = roundedBox(card - extent, extent, radius) * min(grow, tall) / t;
  float glow = rim * amount;
  float reach = rimWidth * 60.0 * glow;
  if (dist > max(pixel, reach)) return half4(0.0);

  if (dist > pixel) {
    float halo = glow * 0.45 * exp(-dist / max(reach * 0.3, 0.001)) * smoothstep(0.2, 1.0, outer);
    return half4(half3(rimColor) * half(halo), half(halo));
  }

  float spread = amount * outer;
  float width = blur * spread * grow + smear * abs(speed) * 6.0;
  float shift = aberration * spread * extent.x;

  half3 color;
  if (width < 0.25 && shift < 0.25) {
    color = image.eval(card).rgb;
  } else {
    float jitter = fract(52.9829189 * fract(dot(xy, float2(0.06711056, 0.00583715))));
    color = half3(0.0);
    float total = 0.0;
    for (int i = 0; i < TAPS; i++) {
      float o = (float(i) + jitter) / float(TAPS) * 2.0 - 1.0;
      float w = 1.0 - abs(o) * 0.7;
      color += split(card + float2(o * width, 0.0), shift) * half(w);
      total += w;
    }
    color /= half(total);
  }

  half luma = dot(color, half3(0.2126, 0.7152, 0.0722));
  color = mix(half3(luma), color, half(mix(1.0, saturation, spread)));
  color *= half(1.0 - 0.18 * amount);
  float band = rimWidth * min(extent.x, extent.y);
  float ring = exp(-max(-dist, 0.0) / max(band * 0.35, 0.001));
  float lit = glow * ring * mix(0.25, 1.0, smoothstep(0.0, 1.0, outer));
  color = 1.0 - (1.0 - color) * (1.0 - half3(rimColor) * half(lit));

  float2 n = card / cardSize;
  float line = n.x * 0.8 + n.y * 0.6 - 0.7 - angle * 0.6 + center.x / resolution.x * 0.5;
  color += half(sheen * pow(max(1.0 - abs(line) * 2.2, 0.0), 3.0));

  half coverage = half(clamp(0.5 - dist / pixel, 0.0, 1.0));
  return half4(color * coverage, coverage);
}
`;

const STRETCH_EFFECT = Skia.RuntimeEffect.Make(SOURCE)!;

export { STRETCH_EFFECT };
