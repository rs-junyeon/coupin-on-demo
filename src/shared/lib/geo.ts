import type { Bounds, LatLng } from '@/shared/api';

/** 성수역 부근 기준점 */
export const SEONGSU: LatLng = { lat: 37.5446, lng: 127.0557 };

const R = 6371000;
const rad = (v: number) => (v * Math.PI) / 180;

/** 하버사인 거리 (m) */
export function distanceM(a: LatLng, b: LatLng): number {
  const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export const distanceLabel = (m: number) => (m >= 1000 ? `${(m / 1000).toFixed(1)}km` : `${Math.round(m / 10) * 10}m`);

export const inBounds = (p: LatLng, b: Bounds) =>
  p.lat >= b.sw.lat && p.lat <= b.ne.lat && p.lng >= b.sw.lng && p.lng <= b.ne.lng;

export const withinKm = (a: LatLng, b: LatLng, km: number) => distanceM(a, b) <= km * 1000;
