import { describe, expect, it } from 'vitest';
import { SEONGSU, distanceLabel, distanceM, inBounds, withinKm } from './geo';

describe('distanceM', () => {
  it('성수역과 뚝섬역 사이는 약 790m', () => {
    expect(distanceM(SEONGSU, { lat: 37.5472, lng: 127.0474 })).toBeGreaterThan(760);
    expect(distanceM(SEONGSU, { lat: 37.5472, lng: 127.0474 })).toBeLessThan(820);
  });
});

describe('distanceLabel', () => {
  it('1km 미만은 10m 단위, 이상은 km 소수 한 자리', () => {
    expect(distanceLabel(347)).toBe('350m');
    expect(distanceLabel(1234)).toBe('1.2km');
  });
});

describe('inBounds', () => {
  const b = { sw: { lat: 37.54, lng: 127.05 }, ne: { lat: 37.55, lng: 127.06 } };
  it('안쪽, 바깥쪽, 경계', () => {
    expect(inBounds({ lat: 37.545, lng: 127.055 }, b)).toBe(true);
    expect(inBounds({ lat: 37.56, lng: 127.055 }, b)).toBe(false);
    expect(inBounds({ lat: 37.54, lng: 127.06 }, b)).toBe(true);
  });
});

describe('withinKm', () => {
  it('강남역은 성수역에서 5km 밖', () => {
    expect(withinKm(SEONGSU, { lat: 37.4979, lng: 127.0276 }, 5)).toBe(false);
    expect(withinKm(SEONGSU, { lat: 37.5472, lng: 127.0474 }, 5)).toBe(true);
  });
});
