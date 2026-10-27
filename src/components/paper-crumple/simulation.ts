import { Platform } from "react-native";
import {
  createWorkletRuntime,
  runOnRuntimeAsync,
  type WorkletRuntime,
} from "react-native-worklets";

import type { IPaperMesh, IPaperPath } from "./interface";

const FRAMES: number = 48;
const STEPS_PER_FRAME = 3;
const PASSES: number = 14;
const _UNFOLD_STEPS = 60;
const UNFOLD_PASSES: number = 10;

const meshes = new Map<string, IPaperMesh>();
const paths = new Map<string, Promise<IPaperPath>>();
let worker: WorkletRuntime | null = null;

function randomSource(seed: number) {
  "worklet";
  let value = seed | 0;
  return () => {
    value = (value + 0x6d2b79f5) | 0;
    let n = Math.imul(value ^ (value >>> 15), 1 | value);
    n = (n + Math.imul(n ^ (n >>> 7), 61 | n)) ^ n;
    return ((n ^ (n >>> 14)) >>> 0) / 4294967296;
  };
}

function buildMesh(aspect: number, detail: number, seed: number): IPaperMesh {
  const random = randomSource(seed);
  const columns = Math.max(6, Math.round(detail / Math.max(1, aspect)));
  const rows = Math.max(6, Math.round(detail * Math.min(1, aspect)));
  const count = (columns + 1) * (rows + 1);
  const rest = new Float32Array(count * 3);
  const uvs = new Float32Array(count * 2);
  const triangles: number[] = [];

  for (let row = 0; row <= rows; row++) {
    for (let col = 0; col <= columns; col++) {
      const index = row * (columns + 1) + col;
      const u =
        (col + (col > 0 && col < columns ? (random() - 0.5) * 0.5 : 0)) /
        columns;
      const v =
        (row + (row > 0 && row < rows ? (random() - 0.5) * 0.5 : 0)) / rows;
      rest[index * 3] = u - 0.5;
      rest[index * 3 + 1] = (v - 0.5) * aspect;
      uvs[index * 2] = u;
      uvs[index * 2 + 1] = v;
      if (col < columns && row < rows) {
        const a = index;
        const b = index + 1;
        const c = index + columns + 1;
        const d = c + 1;
        if (random() > 0.5) triangles.push(a, b, d, a, d, c);
        else triangles.push(a, b, c, b, d, c);
      }
    }
  }

  const around: number[][] = Array.from({ length: count }, () => []);
  for (let t = 0; t < triangles.length; t += 3) {
    for (let k = 0; k < 3; k++) around[triangles[t + k]].push(t / 3);
  }
  const offsets = new Int32Array(count + 1);
  for (let i = 0; i < count; i++)
    offsets[i + 1] = offsets[i] + around[i].length;
  const faces = Int32Array.from(around.flat());

  return {
    count,
    rest,
    uvs,
    triangles: Int32Array.from(triangles),
    offsets,
    faces,
  };
}

function solvePath(
  mesh: IPaperMesh,
  aspect: number,
  folds: number,
  sharpness: number,
  depth: number,
  seed: number,
): IPaperPath {
  "worklet";
  const { rest, count, triangles } = mesh;
  const shortSide = Math.min(1, aspect);
  const points = Float64Array.from(rest);
  const previous = Float64Array.from(rest);
  const before = Float64Array.from(rest);
  const edges: number[] = [];
  const hinges: number[] = [];
  const seen = new Map<number, number>();
  const random = randomSource(seed);
  const guides = Array.from({ length: folds }, () => {
    const angle = random() * Math.PI * 2;
    return {
      x: Math.cos(angle),
      y: Math.sin(angle),
      phase: random() * Math.PI * 2,
      weight: random() * 0.6 + 0.4,
    };
  });

  for (let t = 0; t < triangles.length; t += 3) {
    for (let k = 0; k < 3; k++) {
      const a = triangles[t + k];
      const b = triangles[t + ((k + 1) % 3)];
      const opposite = triangles[t + ((k + 2) % 3)];
      const key = Math.min(a, b) * count + Math.max(a, b);
      const other = seen.get(key);
      if (other === undefined) {
        seen.set(key, opposite);
        edges.push(
          a * 3,
          b * 3,
          Math.hypot(
            rest[a * 3] - rest[b * 3],
            rest[a * 3 + 1] - rest[b * 3 + 1],
          ),
        );
        continue;
      }
      const c = other * 3;
      const d = opposite * 3;
      const mx = (rest[c] + rest[d]) * 0.5;
      const my = (rest[c + 1] + rest[d + 1]) * 0.5;
      let weakness = 0;
      for (const guide of guides) {
        const distance = Math.abs(
          Math.sin(
            ((mx * guide.x + my * guide.y) / shortSide) * 4 + guide.phase,
          ),
        );
        weakness = Math.max(
          weakness,
          Math.exp(-distance * distance * 80) * guide.weight,
        );
      }
      hinges.push(
        c,
        d,
        Math.hypot(rest[c] - rest[d], rest[c + 1] - rest[d + 1]),
        0.12 + (1 - weakness) * 0.75,
      );
    }
  }

  const spacing = Math.sqrt((shortSide * shortSide) / count);
  const thickness = shortSide * 0.008;
  const totalSteps = FRAMES * STEPS_PER_FRAME;
  let initialRadius = 0;
  for (let i = 0; i < rest.length; i += 3) {
    initialRadius = Math.max(
      initialRadius,
      Math.hypot(rest[i] / 0.94, rest[i + 1] / 1.02),
    );
  }
  initialRadius *= 1.02;

  const constrain = (
    list: number[],
    stride: number,
    stiffness: number,
    reverse: boolean,
  ) => {
    for (let n = 0; n < list.length; n += stride) {
      const edge = reverse ? list.length - stride - n : n;
      const a = list[edge];
      const b = list[edge + 1];
      const dx = points[b] - points[a];
      const dy = points[b + 1] - points[a + 1];
      const dz = points[b + 2] - points[a + 2];
      const length = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (length < 1e-6) continue;
      const weight = stride === 4 ? list[edge + 3] : 1;
      const amount = (1 - list[edge + 2] / length) * 0.5 * stiffness * weight;
      points[a] += dx * amount;
      points[b] -= dx * amount;
      points[a + 1] += dy * amount;
      points[b + 1] -= dy * amount;
      points[a + 2] += dz * amount;
      points[b + 2] -= dz * amount;
    }
  };

  const separateLayers = () => {
    const margin = thickness * 2;
    for (let t = 0; t < triangles.length; t += 3) {
      const a = triangles[t] * 3;
      const b = triangles[t + 1] * 3;
      const c = triangles[t + 2] * 3;
      const ax = points[a];
      const ay = points[a + 1];
      const az = points[a + 2];
      const bx = points[b] - ax;
      const by = points[b + 1] - ay;
      const bz = points[b + 2] - az;
      const cx = points[c] - ax;
      const cy = points[c + 1] - ay;
      const cz = points[c + 2] - az;
      let nx = by * cz - bz * cy;
      let ny = bz * cx - bx * cz;
      let nz = bx * cy - by * cx;
      const length = Math.hypot(nx, ny, nz);
      if (length < 1e-7) continue;
      nx /= length;
      ny /= length;
      nz /= length;
      const minX = Math.min(ax, points[b], points[c]) - margin;
      const maxX = Math.max(ax, points[b], points[c]) + margin;
      const minY = Math.min(ay, points[b + 1], points[c + 1]) - margin;
      const maxY = Math.max(ay, points[b + 1], points[c + 1]) + margin;
      const minZ = Math.min(az, points[b + 2], points[c + 2]) - margin;
      const maxZ = Math.max(az, points[b + 2], points[c + 2]) + margin;
      const bb = bx * bx + by * by + bz * bz;
      const cc = cx * cx + cy * cy + cz * cz;
      const bc = bx * cx + by * cy + bz * cz;
      const determinant = bb * cc - bc * bc;
      if (determinant < 1e-10) continue;
      const restX = (rest[a] + rest[b] + rest[c]) / 3;
      const restY = (rest[a + 1] + rest[b + 1] + rest[c + 1]) / 3;
      for (let p = 0; p < points.length; p += 3) {
        if (p === a || p === b || p === c) continue;
        const px = points[p];
        const py = points[p + 1];
        const pz = points[p + 2];
        if (
          px < minX ||
          px > maxX ||
          py < minY ||
          py > maxY ||
          pz < minZ ||
          pz > maxZ
        )
          continue;
        const rx = rest[p] - restX;
        const ry = rest[p + 1] - restY;
        if (rx * rx + ry * ry < spacing * spacing * 6) continue;
        const dx = px - ax;
        const dy = py - ay;
        const dz = pz - az;
        const distance = dx * nx + dy * ny + dz * nz;
        const previousDistance =
          (before[p] - before[a]) * nx +
          (before[p + 1] - before[a + 1]) * ny +
          (before[p + 2] - before[a + 2]) * nz;
        const side = previousDistance >= 0 ? 1 : -1;
        if (distance * side >= thickness || Math.abs(distance) > margin)
          continue;
        const pb = dx * bx + dy * by + dz * bz;
        const pc = dx * cx + dy * cy + dz * cz;
        const u = (cc * pb - bc * pc) / determinant;
        const v = (bb * pc - bc * pb) / determinant;
        if (u < 0 || v < 0 || u + v > 1) continue;
        const w = 1 - u - v;
        const correction =
          (thickness * side - distance) / (1 + w * w + u * u + v * v);
        for (let axis = 0; axis < 3; axis++) {
          const movement =
            (axis === 0 ? nx : axis === 1 ? ny : nz) * correction;
          points[p + axis] += movement;
          points[a + axis] -= movement * w;
          points[b + axis] -= movement * u;
          points[c + axis] -= movement * v;
        }
      }
    }
  };

  const frames = new Float32Array((FRAMES + 1) * rest.length);
  frames.set(rest, 0);
  const limit = spacing * 0.15;

  for (let step = 1; step <= totalSteps; step++) {
    const progress = step / totalSteps;
    const compression = progress * progress * (3 - 2 * progress);
    const radius =
      initialRadius * (1 - compression) +
      shortSide * (0.19 - depth * 0.025) * compression;
    before.set(points);
    for (let i = 0; i < points.length; i += 3) {
      const x = rest[i] / shortSide;
      const y = rest[i + 1] / shortSide;
      let buckle = 0;
      for (const guide of guides)
        buckle +=
          Math.sin((x * guide.x + y * guide.y) * 5 + guide.phase) *
          guide.weight;
      for (let axis = 0; axis < 3; axis++) {
        const velocity = (points[i + axis] - previous[i + axis]) * 0.55;
        previous[i + axis] = points[i + axis];
        points[i + axis] += Math.min(limit, Math.max(-limit, velocity));
      }
      points[i + 2] +=
        (buckle / folds) * shortSide * 0.0007 * Math.sin(progress * Math.PI);
    }
    for (let pass = 0; pass < PASSES; pass++) {
      constrain(hinges, 4, 0.45 * (1 - sharpness * 0.4), pass % 2 === 0);
      for (let i = 0; i < points.length; i += 3) {
        const distance = Math.hypot(
          points[i] / 0.94,
          points[i + 1] / 1.02,
          points[i + 2] / 0.86,
        );
        if (distance > radius) {
          const push = (1 - radius / distance) * 0.55;
          points[i] -= points[i] * push;
          points[i + 1] -= points[i + 1] * push;
          points[i + 2] -= points[i + 2] * push;
        }
      }
      constrain(edges, 3, 1, pass % 2 !== 0);
      if (pass === PASSES - 1 && progress > 0.2) separateLayers();
    }
    for (let h = 0; h < hinges.length; h += 4) {
      const a = hinges[h];
      const b = hinges[h + 1];
      const length = Math.hypot(
        points[a] - points[b],
        points[a + 1] - points[b + 1],
        points[a + 2] - points[b + 2],
      );
      if (length < hinges[h + 2] * 0.86)
        hinges[h + 2] += (length - hinges[h + 2]) * 0.12;
    }
    if (step % STEPS_PER_FRAME === 0)
      frames.set(points, (step / STEPS_PER_FRAME) * rest.length);
  }

  const folded = Float64Array.from(points);
  for (let step = 1; step <= _UNFOLD_STEPS; step++) {
    const t = step / _UNFOLD_STEPS;
    const unfold = t * t * (3 - 2 * t);
    for (let pass = 0; pass < UNFOLD_PASSES; pass++) {
      for (let i = 0; i < points.length; i++) {
        const target = folded[i] + (rest[i] - folded[i]) * unfold;
        points[i] += (target - points[i]) * (i % 3 === 2 ? 0.04 : 0.22);
      }
      constrain(hinges, 4, 0.7, pass % 2 === 0);
      constrain(edges, 3, 1, pass % 2 !== 0);
    }
  }

  return { frames, frameCount: FRAMES + 1, creased: Float32Array.from(points) };
}

function meshFor(aspect: number, detail: number, seed: number) {
  const key = [aspect, detail, seed].join(":");
  let mesh = meshes.get(key);
  if (!mesh) {
    mesh = buildMesh(aspect, detail, seed);
    meshes.set(key, mesh);
  }
  return mesh;
}

function pathFor(
  mesh: IPaperMesh,
  aspect: number,
  detail: number,
  folds: number,
  sharpness: number,
  depth: number,
  seed: number,
) {
  const key = [aspect, detail, folds, sharpness, depth, seed].join(":");
  let path = paths.get(key);
  if (!path) {
    if (Platform.OS === "web") {
      path = Promise.resolve().then(() =>
        solvePath(mesh, aspect, folds, sharpness, depth, seed),
      );
    } else {
      worker ??= createWorkletRuntime({ name: "paper-crumple" });
      path = runOnRuntimeAsync(
        worker,
        solvePath,
        mesh,
        aspect,
        folds,
        sharpness,
        depth,
        seed,
      );
    }
    paths.set(key, path);
    path.catch(() => paths.delete(key));
  }
  return path;
}

export { meshFor, pathFor };
