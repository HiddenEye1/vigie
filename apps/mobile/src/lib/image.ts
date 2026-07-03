import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

import type { ImageUpload } from './api';

/** Compression avant envoi (§8.1) : max 1600 px de large, JPEG qualité 80. */
export const IMAGE_TARGET_WIDTH = 1600;
export const IMAGE_JPEG_QUALITY = 0.8;

export async function compressForUpload(uri: string, width: number): Promise<ImageUpload> {
  const context = ImageManipulator.manipulate(uri);
  if (width > IMAGE_TARGET_WIDTH) {
    context.resize({ width: IMAGE_TARGET_WIDTH });
  }
  const rendered = await context.renderAsync();
  const result = await rendered.saveAsync({
    compress: IMAGE_JPEG_QUALITY,
    format: SaveFormat.JPEG,
  });
  return { uri: result.uri, mimeType: 'image/jpeg' };
}
