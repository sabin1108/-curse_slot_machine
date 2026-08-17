import { ASSETS } from './mockupAssets';

export function getAsset(key: string): string {
  if (ASSETS[key]) {
    return ASSETS[key];
  }
  // Fallback to public assets directory
  return `/assets/${key}`;
}
