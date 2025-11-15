import React from 'react';
import { heads96 } from '../data/sprites96';
import { heads200 } from '../data/sprites200';

// Use 200px sprites by default
export const SPRITE_IMAGE_PATH = '/images/snl-sprites-200.png';
export const SPRITE_SIZE = 200;

// Alternative 96px sprites (can be used if needed)
export const SPRITE_IMAGE_PATH_96 = '/images/snl-sprites.png';
export const SPRITE_SIZE_96 = 96;

/**
 * Gets sprite coordinates for a cast member
 * Uses 200px sprites by default
 */
export function getSpriteCoordinates(spriteKey: string, use96px = false): [number, number, number, number] | null {
  const coords = use96px ? heads96[spriteKey] : heads200[spriteKey];
  return coords || null;
}

/**
 * Gets CSS background-position for a sprite
 */
export function getSpriteStyle(spriteKey: string, size: number = SPRITE_SIZE, use96px = false): React.CSSProperties {
  const coords = getSpriteCoordinates(spriteKey, use96px);

  if (!coords) {
    return {};
  }

  const [x, y, width] = coords;
  const scale = size / width;

  // Sprite sheet dimensions: 10 images per row, 17 rows = 2000x3400 for 200px sprites
  const sheetWidth = use96px ? 1248 : 2000;
  const sheetHeight = use96px ? 1152 : 3400;
  const imagePath = use96px ? SPRITE_IMAGE_PATH_96 : SPRITE_IMAGE_PATH;

  return {
    backgroundImage: `url(${imagePath})`,
    backgroundPosition: `-${x * scale}px -${y * scale}px`,
    backgroundSize: `${sheetWidth * scale}px ${sheetHeight * scale}px`,
    width: `${size}px`,
    height: `${size}px`,
  };
}
