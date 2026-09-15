import { samplePropClimax } from "./prop-climax.js";

function pad4(n) {
  return (4 - (n % 4)) % 4;
}

function parseGlb(buffer) {
  const view = new DataView(buffer);
  if (view.getUint32(0, true) !== 0x46546c67) throw new Error("No es un GLB");
  let offset = 12;
  let json = null;
  let bin = new Uint8Array(0);
  while (offset + 8 <= buffer.byteLength) {
    const len = view.getUint32(offset, true);
    const type = view.getUint32(offset + 4, true);
    const start = offset + 8;
    const slice = new Uint8Array(buffer, start, len);
    if (type === 0x4e4f534a) json = JSON.parse(new TextDecoder().decode(slice));
    if (type === 0x004e4942) bin = slice;
    offset = start + len + pad4(len);
  }
  if (!json) throw new Error("GLB sin JSON");
  return { json, bin };
}

function buildGlb(json, bin) {
  const jsonBytes = new TextEncoder().encode(JSON.stringify(json));
  const jsonPad = pad4(jsonBytes.length);
  const binPad = pad4(bin.length);
  const jsonChunk = 8 + jsonBytes.length + jsonPad;
  const binChunk = 8 + bin.length + binPad;
  const out = new ArrayBuffer(12 + jsonChunk + binChunk);
  const view = new DataView(out);
  const bytes = new Uint8Array(out);
  view.setUint32(0, 0x46546c67, true);
  view.setUint32(4, 2, true);
  view.setUint32(8, out.byteLength, true);
  view.setUint32(12, jsonBytes.length + jsonPad, true);
  view.setUint32(16, 0x4e4f534a, true);
  bytes.set(jsonBytes, 20);
  bytes.fill(0x20, 20 + jsonBytes.length, 20 + jsonBytes.length + jsonPad);
  const binAt = 12 + jsonChunk;
  view.setUint32(binAt, bin.length + binPad, true);
  view.setUint32(binAt + 4, 0x004e4942, true);
  bytes.set(bin, binAt + 8);
  return out;
}

function floatBuffer(list) {
  return new Uint8Array(new Float32Array(list).buffer);
}

function addAccessor(json, binParts, data, type, count, extras = {}) {
  const offset = binParts.reduce((sum, part) => sum + part.length, 0);
  binParts.push(data);
  const pad = pad4(data.length);
  if (pad) binParts.push(new Uint8Array(pad));
  json.bufferViews = json.bufferViews || [];
  json.accessors = json.accessors || [];
  const view = json.bufferViews.length;
  json.bufferViews.push({ buffer: 0, byteOffset: offset, byteLength: data.length });
  const acc = json.accessors.length;
  json.accessors.push({ bufferView: view, componentType: 5126, count, type, ...extras });
  return acc;
}

export function bakeClimaxIntoGlb(buffer, action, half = 0.36, hz = 30) {
  const { json, bin } = parseGlb(buffer);
  const clip = samplePropClimax(action, half, hz);
  json.nodes = json.nodes || [{ name: "root" }];
  json.scenes = json.scenes || [{ nodes: [0] }];
  const scene = json.scenes[json.scene || 0] || json.scenes[0];
  const kids = [...(scene.nodes || [0])];
  const root = json.nodes.length;
  json.nodes.push({ name: "climax", children: kids });
  scene.nodes = [root];

  const parts = [new Uint8Array(bin)];
  const binPad = pad4(bin.length);
  if (binPad) parts.push(new Uint8Array(binPad));
  const tAcc = addAccessor(json, parts, floatBuffer(clip.times), "SCALAR", clip.times.length, {
    min: [clip.times[0]],
    max: [clip.times[clip.times.length - 1]],
  });
  const pAcc = addAccessor(json, parts, floatBuffer(clip.translations), "VEC3", clip.times.length);
  const rAcc = addAccessor(json, parts, floatBuffer(clip.rotations), "VEC4", clip.times.length);
  const sAcc = addAccessor(json, parts, floatBuffer(clip.scales), "VEC3", clip.times.length);
  const merged = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let at = 0;
  for (const part of parts) {
    merged.set(part, at);
    at += part.length;
  }
  json.buffers = [{ byteLength: merged.length }];
  json.animations = json.animations || [];
  json.animations.push({
    name: "climax",
    samplers: [
      { input: tAcc, output: pAcc, interpolation: "LINEAR" },
      { input: tAcc, output: rAcc, interpolation: "LINEAR" },
      { input: tAcc, output: sAcc, interpolation: "LINEAR" },
    ],
    channels: [
      { sampler: 0, target: { node: root, path: "translation" } },
      { sampler: 1, target: { node: root, path: "rotation" } },
      { sampler: 2, target: { node: root, path: "scale" } },
    ],
  });
  return buildGlb(json, merged);
}

export async function bakeClimaxFromUrl(src, action, half = 0.36) {
  const res = await fetch(src);
  if (!res.ok) throw new Error(String(res.status));
  return bakeClimaxIntoGlb(await res.arrayBuffer(), action, half);
}
