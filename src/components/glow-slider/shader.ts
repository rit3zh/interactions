import { Skia } from "@shopify/react-native-skia";

const SOURCE = /*glsl*/ `
uniform float2 size;
uniform float position;
uniform float last;
uniform float recommended;
uniform float press;
uniform float lag;
uniform float inset;
uniform float pixel;
uniform float4 track;
uniform float4 mark;
uniform float4 markLit;
uniform float3 tint;
uniform float3 knob;

float4 paint(float3 c, float a) { return float4(c * a, a); }
float4 over(float4 dst, float4 src) { return src + dst * (1.0 - src.a); }
float cover(float d) { return clamp(0.5 - d / pixel, 0.0, 1.0); }

float capsule(float2 p, float2 a, float2 b, float r) {
  float2 pa = p - a;
  float2 ba = b - a;
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 0.0001), 0.0, 1.0);
  return length(pa - ba * h) - r;
}

float ellipse(float2 p, float2 r) {
  return (length(p / r) - 1.0) * min(r.x, r.y);
}

half4 main(float2 xy) {
  float mid = size.y * 0.5;
  float span = size.x - size.y;
  float edge = capsule(xy, float2(mid), float2(size.x - mid, mid), mid);
  float clip = cover(edge);
  if (clip <= 0.0) return half4(0.0);

  float r = mid - inset;
  float2 k = float2(mid + span * position / last, mid);
  float4 color = paint(track.rgb, track.a);

  float spill = length((xy - k) * float2(0.55, 1.0)) / size.y;
  color = over(color, paint(tint, exp(-spill * 2.2) * (0.16 + 0.22 * press)));

  float fill = cover(capsule(xy, float2(mid), k, r));
  if (fill > 0.0) {
    float t = clamp((xy.x - inset) / max(k.x + r - inset, 1.0), 0.0, 1.0);
    float ramp = t * t * (3.0 - 2.0 * t);
    float wave = sin(xy.x * 0.045 - position * 1.6 + sin(xy.y * 0.15 + xy.x * 0.018 + position * 0.9) * 1.3);
    float sheen = 1.0 + 0.12 * (mid - xy.y) / r;
    float3 c = tint * (1.0 + 0.1 * wave * ramp) * sheen;
    color = over(color, paint(min(c, float3(1.0)), fill * mix(0.22, 1.0, ramp)));
  }

  float i = clamp(floor((xy.x - mid) / span * last + 0.5), 0.0, last);
  float mx = mid + span * i / last;
  float md = abs(i - recommended) < 0.5
    ? capsule(xy, float2(mx, mid - 5.0), float2(mx, mid + 5.0), 1.5)
    : length(xy - float2(mx, mid)) - 2.0;
  float4 mc = mx < k.x ? markLit : mark;
  float swallow = smoothstep(r * 1.1, r * 2.4, abs(mx - k.x));
  color = over(color, paint(mc.rgb, mc.a * cover(md) * swallow));

  float s = clamp(lag / (r * 2.0), -1.0, 1.0);
  float2 radii = r * (1.0 + 0.05 * press) * float2(1.0 + 0.3 * abs(s), 1.0 - 0.1 * abs(s));
  float2 kc = k + float2(s * r * 0.2, 0.0);
  float shadow = ellipse(xy - kc - float2(0.0, 1.5), radii);
  color = over(color, float4(0.0, 0.0, 0.0, 0.28 * exp(-max(shadow, 0.0) / 3.0)));
  float3 face = knob * (1.0 - 0.05 * (xy.y - kc.y) / r);
  color = over(color, paint(face, cover(ellipse(xy - kc, radii))));

  return half4(color * clip);
}
`;

const SLIDER_EFFECT = Skia.RuntimeEffect.Make(SOURCE)!;

export { SLIDER_EFFECT };
