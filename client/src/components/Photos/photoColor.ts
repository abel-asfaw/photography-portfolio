import { buildSrc } from '@imagekit/react';
import { useSyncExternalStore } from 'react';

// Glow colors keyed by photo name. A name maps to null while its thumbnail
// loads, or for good if it fails, so each photo is fetched at most once.
const colors = new Map<string, string | null>();
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/**
 * Picks a glow color from a small thumbnail: an average weighted toward
 * saturated, bright pixels, with its lightness clamped so the glow shows on
 * the dark page whether the photo is dark or washed out.
 */
function extractColor(image: HTMLImageElement) {
  const size = 24;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return null;
  context.drawImage(image, 0, 0, size, size);
  let data: Uint8ClampedArray;
  try {
    ({ data } = context.getImageData(0, 0, size, size));
  } catch {
    // A response without CORS headers taints the canvas: no glow.
    return null;
  }

  let r = 0;
  let g = 0;
  let b = 0;
  let total = 0;
  for (let i = 0; i < data.length; i += 4) {
    const max = Math.max(data[i], data[i + 1], data[i + 2]);
    const min = Math.min(data[i], data[i + 1], data[i + 2]);
    const saturation = max === 0 ? 0 : (max - min) / max;
    const weight = 0.05 + saturation * (max / 255);
    r += data[i] * weight;
    g += data[i + 1] * weight;
    b += data[i + 2] * weight;
    total += weight;
  }

  return toGlow(r / total, g / total, b / total);
}

function toGlow(r: number, g: number, b: number) {
  const [rn, gn, bn] = [r / 255, g / 255, b / 255];
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;
  let hue = 0;
  if (delta > 0) {
    if (max === rn) hue = ((gn - bn) / delta) % 6;
    else if (max === gn) hue = (bn - rn) / delta + 2;
    else hue = (rn - gn) / delta + 4;
  }
  const lightness = (max + min) / 2;
  const saturation =
    delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));
  const clamped = Math.min(Math.max(lightness, 0.42), 0.6);
  return `hsl(${Math.round((hue * 60 + 360) % 360)} ${Math.round(
    Math.min(saturation * 1.15, 1) * 100,
  )}% ${Math.round(clamped * 100)}%)`;
}

/** Starts loading the glow color for each photo not already cached. */
export function preloadPhotoColors(names: string[]) {
  for (const name of names) {
    if (colors.has(name)) continue;
    colors.set(name, null);
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      colors.set(name, extractColor(image));
      listeners.forEach(listener => listener());
    };
    image.src = buildSrc({
      urlEndpoint: import.meta.env.VITE_IMAGE_KIT_URL,
      src: `/${name}`,
      transformation: [{ width: 32, height: 32 }],
    });
  }
}

/** The glow color for a photo, once its thumbnail has loaded. */
export function usePhotoColor(name: string | undefined) {
  return useSyncExternalStore(subscribe, () =>
    name ? (colors.get(name) ?? undefined) : undefined,
  );
}
