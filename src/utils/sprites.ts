import { heads96 } from '../data/sprites96';

export const SPRITE_IMAGE_PATH = '/images/snl-sprites.png';
export const SPRITE_SIZE = 96;

/**
 * Gets sprite coordinates for a cast member
 */
export function getSpriteCoordinates(spriteKey: string): [number, number, number, number] | null {
  const coords = heads96[spriteKey];
  return coords || null;
}

/**
 * Gets CSS background-position for a sprite
 */
export function getSpriteStyle(spriteKey: string, size: number = SPRITE_SIZE): React.CSSProperties {
  const coords = getSpriteCoordinates(spriteKey);

  if (!coords) {
    return {};
  }

  const [x, y, width] = coords;
  const scale = size / width;

  return {
    backgroundImage: `url(${SPRITE_IMAGE_PATH})`,
    backgroundPosition: `-${x * scale}px -${y * scale}px`,
    backgroundSize: `${1248 * scale}px ${1152 * scale}px`,
    width: `${size}px`,
    height: `${size}px`,
  };
}
