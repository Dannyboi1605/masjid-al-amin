import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const background = [0x0b, 0x3d, 0x2e, 0xff];
const gold = [0xd9, 0xb3, 0x5a, 0xff];
const samples = 4;

function crc32(buffer) {
  let crc = 0xffffffff;
  for (let i = 0; i < buffer.length; i += 1) {
    crc ^= buffer[i];
    for (let j = 0; j < 8; j += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type, "ascii");
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function encodePng(width, height, pixels) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y += 1) {
    const rowStart = y * (width * 4 + 1);
    raw[rowStart] = 0;
    pixels.copy(raw, rowStart + 1, y * width * 4, (y + 1) * width * 4);
  }

  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 6;
  header[10] = 0;
  header[11] = 0;
  header[12] = 0;

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function insideMotif(x, y, size, halfFactor, strokeFactor, circleFactor) {
  const center = size / 2;
  const half = size * halfFactor;
  const stroke = size * strokeFactor;
  const dx = x - center;
  const dy = y - center;

  const squareOutline =
    (Math.abs(Math.abs(dx) - half) <= stroke / 2 &&
      Math.abs(dy) <= half + stroke / 2) ||
    (Math.abs(Math.abs(dy) - half) <= stroke / 2 &&
      Math.abs(dx) <= half + stroke / 2);

  const rotatedX = dx * Math.SQRT1_2 + dy * Math.SQRT1_2;
  const rotatedY = -dx * Math.SQRT1_2 + dy * Math.SQRT1_2;
  const rotatedOutline =
    (Math.abs(Math.abs(rotatedX) - half) <= stroke / 2 &&
      Math.abs(rotatedY) <= half + stroke / 2) ||
    (Math.abs(Math.abs(rotatedY) - half) <= stroke / 2 &&
      Math.abs(rotatedX) <= half + stroke / 2);

  const circle = dx * dx + dy * dy <= (size * circleFactor) ** 2;

  return squareOutline || rotatedOutline || circle;
}

function renderIcon(size, halfFactor, strokeFactor, circleFactor) {
  const high = size * samples;
  const coverage = new Float32Array(size * size);

  for (let y = 0; y < high; y += 1) {
    for (let x = 0; x < high; x += 1) {
      if (
        insideMotif(
          x + 0.5,
          y + 0.5,
          high,
          halfFactor,
          strokeFactor,
          circleFactor,
        )
      ) {
        const px = Math.floor(x / samples);
        const py = Math.floor(y / samples);
        coverage[py * size + px] += 1 / (samples * samples);
      }
    }
  }

  const pixels = Buffer.alloc(size * size * 4);

  for (let i = 0; i < size * size; i += 1) {
    const amount = Math.min(1, coverage[i]);
    const offset = i * 4;
    pixels[offset] = Math.round(
      background[0] + (gold[0] - background[0]) * amount,
    );
    pixels[offset + 1] = Math.round(
      background[1] + (gold[1] - background[1]) * amount,
    );
    pixels[offset + 2] = Math.round(
      background[2] + (gold[2] - background[2]) * amount,
    );
    pixels[offset + 3] = 255;
  }

  return encodePng(size, size, pixels);
}

function writeIcon(path, ...args) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, renderIcon(...args));
  console.log(`wrote ${path}`);
}

const root = process.cwd();

writeIcon(join(root, "public/icons/icon-192.png"), 192, 0.26, 0.028, 0.05);
writeIcon(join(root, "public/icons/icon-512.png"), 512, 0.26, 0.028, 0.05);
writeIcon(
  join(root, "public/icons/icon-maskable-512.png"),
  512,
  0.18,
  0.022,
  0.04,
);
writeIcon(join(root, "src/app/icon.png"), 48, 0.26, 0.028, 0.05);
writeIcon(join(root, "src/app/apple-icon.png"), 180, 0.26, 0.028, 0.05);
