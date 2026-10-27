import {
  BlendMode,
  FilterMode,
  MipmapMode,
  Skia,
  TileMode,
  VertexMode,
  type SkColor,
  type SkImage,
  type SkPaint,
  type SkPoint,
} from "@shopify/react-native-skia";

import { FOCAL, OCCLUSION } from "./constants";
import type {
  IPaperFrame,
  IPaperGrip,
  IPaperMesh,
  IPaperPath,
  TVec2,
  TVec3,
  TVec4,
} from "./interface";
import { PAPER_EFFECT } from "./shader";

function clamp(value: number, min: number, max: number) {
  "worklet";
  return Math.min(Math.max(value, min), max);
}

function smoothstep(edge0: number, edge1: number, value: number) {
  "worklet";
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function perspective<T extends number>(z: number) {
  "worklet";
  return FOCAL / Math.max(FOCAL - z, FOCAL * 0.2);
}

function lightFrom<T extends number>(degrees: T): TVec3 {
  const angle = (degrees * Math.PI) / 180;
  const vector: TVec3 = [Math.sin(angle), -Math.cos(angle), 2.2];
  const length = Math.hypot(...vector);
  return [vector[0] / length, vector[1] / length, vector[2] / length];
}

function makePaint(image: SkImage, size: TVec2, paper: string, shadow: number) {
  const [width, height] = size;
  const scale = Math.max(width / image.width(), height / image.height());
  const matrix = Skia.Matrix()
    .translate(
      (width - image.width() * scale) / 2,
      (height - image.height() * scale) / 2,
    )
    .scale(scale, scale);
  const photo = image.makeShaderOptions(
    TileMode.Clamp,
    TileMode.Clamp,
    FilterMode.Linear,
    MipmapMode.Linear,
    matrix,
  );
  const [r, g, b] = Skia.Color(paper);
  const paint = Skia.Paint();
  paint.setShader(
    PAPER_EFFECT.makeShaderWithChildren([width, height, r, g, b], [photo]),
  );
  if (shadow > 0) {
    paint.setImageFilter(
      Skia.ImageFilter.MakeDropShadow(
        0,
        10,
        7,
        7,
        Skia.Color(`rgba(0, 0, 0, ${shadow})`),
      ),
    );
  }
  return paint;
}

function pose(
  mesh: IPaperMesh,
  path: IPaperPath | null,
  amount: number,
  memory: number,
  tiltX: number,
  tiltY: number,
  scale: number,
): Float32Array {
  "worklet";
  const { rest } = mesh;
  const size = rest.length;
  const out = new Float32Array(size);
  const fold = clamp(amount, 0, 1);
  const keep = Math.max(memory, 0) * (1 - fold);
  const cosX = Math.cos(tiltX);
  const sinX = Math.sin(tiltX);
  const cosY = Math.cos(tiltY);
  const sinY = Math.sin(tiltY);

  let from = 0;
  let to = 0;
  let mix = 0;
  if (path) {
    const at = fold * (path.frameCount - 1);
    const lower = Math.floor(at);
    from = lower * size;
    to = Math.min(lower + 1, path.frameCount - 1) * size;
    mix = at - lower;
  }

  const p: TVec3 = [0, 0, 0];
  for (let i = 0; i < size; i += 3) {
    for (let k = 0; k < 3; k++) {
      p[k] = path
        ? path.frames[from + i + k] +
          (path.frames[to + i + k] - path.frames[from + i + k]) * mix +
          (path.creased[i + k] - rest[i + k]) * keep
        : rest[i + k];
    }
    const y = p[1] * cosX + p[2] * sinX;
    const z = p[2] * cosX - p[1] * sinX;
    out[i] = (p[0] * cosY + z * sinY) * scale;
    out[i + 1] = y * scale;
    out[i + 2] = (z * cosY - p[0] * sinY) * scale;
  }
  return out;
}

function project(
  mesh: IPaperMesh,
  local: Float32Array,
  center: TVec2,
  lighting: number,
  light: TVec3,
  ambient: number,
  sharpness: number,
  size: TVec2,
): IPaperFrame {
  "worklet";
  const { count, uvs, triangles, offsets, faces } = mesh;
  const faceCount = triangles.length / 3;
  const screen = new Float32Array(count * 2);
  const bounds: TVec4 = [Infinity, Infinity, -Infinity, -Infinity];
  let minZ = Infinity;
  let maxZ = -Infinity;

  for (let i = 0; i < count; i++) {
    const z = local[i * 3 + 2];
    const k = perspective(z);
    const x = center[0] + local[i * 3] * k;
    const y = center[1] + local[i * 3 + 1] * k;
    screen[i * 2] = x;
    screen[i * 2 + 1] = y;
    bounds[0] = Math.min(bounds[0], x);
    bounds[1] = Math.min(bounds[1], y);
    bounds[2] = Math.max(bounds[2], x);
    bounds[3] = Math.max(bounds[3], y);
    minZ = Math.min(minZ, z);
    maxZ = Math.max(maxZ, z);
  }

  const normals = new Float32Array(faceCount * 3);
  const depth = new Float32Array(faceCount);
  const front = new Uint8Array(faceCount);
  for (let f = 0; f < faceCount; f++) {
    const a = triangles[f * 3];
    const b = triangles[f * 3 + 1];
    const c = triangles[f * 3 + 2];
    const bx = local[b * 3] - local[a * 3];
    const by = local[b * 3 + 1] - local[a * 3 + 1];
    const bz = local[b * 3 + 2] - local[a * 3 + 2];
    const cx = local[c * 3] - local[a * 3];
    const cy = local[c * 3 + 1] - local[a * 3 + 1];
    const cz = local[c * 3 + 2] - local[a * 3 + 2];
    const nx = by * cz - bz * cy;
    const ny = bz * cx - bx * cz;
    const nz = bx * cy - by * cx;
    const length = Math.hypot(nx, ny, nz) || 1;
    normals[f * 3] = nx / length;
    normals[f * 3 + 1] = ny / length;
    normals[f * 3 + 2] = nz / length;
    depth[f] = local[a * 3 + 2] + local[b * 3 + 2] + local[c * 3 + 2];
    const sx = screen[b * 2] - screen[a * 2];
    const sy = screen[b * 2 + 1] - screen[a * 2 + 1];
    const tx = screen[c * 2] - screen[a * 2];
    const ty = screen[c * 2 + 1] - screen[a * 2 + 1];
    front[f] = sx * ty - sy * tx >= 0 ? 1 : 0;
  }

  const order = Array.from({ length: faceCount }, (_, f) => f);
  order.sort((p, q) => depth[p] - depth[q] || p - q);

  const smoothFrom = 0.7 + sharpness * 0.18;
  const span = Math.max(maxZ - minZ, 0.001);
  const backOffset = size[0] * 3;
  const vertices: SkPoint[] = [];
  const textures: SkPoint[] = [];
  const colors: SkColor[] = [];

  for (const f of order) {
    for (let k = 0; k < 3; k++) {
      const v = triangles[f * 3 + k];
      let nx = 0;
      let ny = 0;
      let nz = 0;
      for (let n = offsets[v]; n < offsets[v + 1]; n++) {
        const g = faces[n];
        const dot =
          normals[f * 3] * normals[g * 3] +
          normals[f * 3 + 1] * normals[g * 3 + 1] +
          normals[f * 3 + 2] * normals[g * 3 + 2];
        const weight = smoothstep(smoothFrom, 0.98, dot);
        nx += normals[g * 3] * weight;
        ny += normals[g * 3 + 1] * weight;
        nz += normals[g * 3 + 2] * weight;
      }
      const length = (Math.hypot(nx, ny, nz) || 1) * (front[f] ? 1 : -1);
      const facing = (nx * light[0] + ny * light[1] + nz * light[2]) / length;
      const lit = ambient + (1 - ambient) * clamp(facing / light[2], 0, 1);
      const inside = 1 - OCCLUSION * (1 - (local[v * 3 + 2] - minZ) / span);
      const shade = 1 + (lit * inside - 1) * lighting;

      vertices.push({ x: screen[v * 2], y: screen[v * 2 + 1] });
      textures.push({
        x: uvs[v * 2] * size[0] + (front[f] ? 0 : backOffset),
        y: uvs[v * 2 + 1] * size[1],
      });
      colors.push(new Float32Array([shade, shade, shade, 1]));
    }
  }

  return { vertices, textures, colors, screen, order, bounds };
}

function record(frame: IPaperFrame, paint: SkPaint | null) {
  "worklet";
  const recorder = Skia.PictureRecorder();
  const canvas = recorder.beginRecording();
  if (paint) {
    const vertices = Skia.MakeVertices(
      VertexMode.Triangles,
      frame.vertices,
      frame.textures,
      frame.colors,
    );
    canvas.drawVertices(vertices, BlendMode.Multiply, paint);
  }
  return recorder.finishRecordingAsPicture();
}

function hitTest(
  mesh: IPaperMesh,
  frame: IPaperFrame,
  x: number,
  y: number,
): IPaperGrip | null {
  "worklet";
  const { triangles } = mesh;
  const { screen, order } = frame;
  for (let n = order.length - 1; n >= 0; n--) {
    const f = order[n];
    const a = triangles[f * 3];
    const b = triangles[f * 3 + 1];
    const c = triangles[f * 3 + 2];
    const v0x = screen[b * 2] - screen[a * 2];
    const v0y = screen[b * 2 + 1] - screen[a * 2 + 1];
    const v1x = screen[c * 2] - screen[a * 2];
    const v1y = screen[c * 2 + 1] - screen[a * 2 + 1];
    const area = v0x * v1y - v1x * v0y;
    if (Math.abs(area) < 1e-6) continue;
    const px = x - screen[a * 2];
    const py = y - screen[a * 2 + 1];
    const u = (px * v1y - v1x * py) / area;
    const v = (v0x * py - px * v0y) / area;
    if (u >= 0 && v >= 0 && u + v <= 1)
      return { indices: [a, b, c], weights: [1 - u - v, u, v] };
  }
  return null;
}

function centerUnder(
  local: Float32Array,
  grip: IPaperGrip,
  finger: TVec2,
): TVec2 {
  "worklet";
  const p: TVec3 = [0, 0, 0];
  for (let k = 0; k < 3; k++) {
    for (let axis = 0; axis < 3; axis++) {
      p[axis] += local[grip.indices[k] * 3 + axis] * grip.weights[k];
    }
  }
  const scale = perspective(p[2]);
  return [finger[0] - p[0] * scale, finger[1] - p[1] * scale];
}

export {
  centerUnder,
  clamp,
  hitTest,
  lightFrom,
  makePaint,
  pose,
  project,
  record,
  smoothstep,
};
