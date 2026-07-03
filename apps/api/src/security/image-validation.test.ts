import { describe, expect, it } from 'vitest';

import { sniffImageMimeType } from './image-validation.js';

export function fakePngBytes(size = 64): Uint8Array {
  const bytes = new Uint8Array(Math.max(size, 12));
  bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  return bytes;
}

export function fakeJpegBytes(): Uint8Array {
  const bytes = new Uint8Array(32);
  bytes.set([0xff, 0xd8, 0xff, 0xe0]);
  return bytes;
}

export function fakeWebpBytes(): Uint8Array {
  const bytes = new Uint8Array(32);
  bytes.set([0x52, 0x49, 0x46, 0x46, 0x10, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50]);
  return bytes;
}

describe('sniffImageMimeType', () => {
  it('reconnaît un JPEG à ses nombres magiques', () => {
    expect(sniffImageMimeType(fakeJpegBytes())).toBe('image/jpeg');
  });

  it('reconnaît un PNG', () => {
    expect(sniffImageMimeType(fakePngBytes())).toBe('image/png');
  });

  it('reconnaît un WebP', () => {
    expect(sniffImageMimeType(fakeWebpBytes())).toBe('image/webp');
  });

  it.each([
    ['GIF', [0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0, 0, 0, 0, 0, 0]],
    ['PDF', [0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34, 0, 0, 0, 0]],
    ['texte', [0x42, 0x6f, 0x6e, 0x6a, 0x6f, 0x75, 0x72, 0x20, 0x21, 0x20, 0x20, 0x20]],
    ['ELF (exécutable)', [0x7f, 0x45, 0x4c, 0x46, 2, 1, 1, 0, 0, 0, 0, 0]],
  ])('rejette un fichier %s même renommé en .png', (_label, magic) => {
    expect(sniffImageMimeType(new Uint8Array(magic))).toBeNull();
  });

  it('rejette un fichier trop court pour être identifié', () => {
    expect(sniffImageMimeType(new Uint8Array([0xff, 0xd8]))).toBeNull();
  });
});
