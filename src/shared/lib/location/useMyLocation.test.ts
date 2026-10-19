import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useMyLocation } from './useMyLocation';

function fakeGeo(result: { lat: number; lng: number } | 'error') {
  Object.defineProperty(navigator, 'geolocation', {
    configurable: true,
    value: {
      getCurrentPosition: (ok: PositionCallback, fail: PositionErrorCallback) =>
        result === 'error' ? fail({ code: 1 } as GeolocationPositionError) : ok({ coords: { latitude: result.lat, longitude: result.lng } } as GeolocationPosition),
    },
  });
}
afterEach(() => { Object.defineProperty(navigator, 'geolocation', { configurable: true, value: undefined }); });

describe('useMyLocation', () => {
  it('성수동 근처면 실제 위치를 돌려준다', async () => {
    fakeGeo({ lat: 37.545, lng: 127.054 });
    const { result } = renderHook(() => useMyLocation());
    let r; await act(async () => { r = await result.current.locate(); });
    expect(r).toEqual({ kind: 'ok', origin: { lat: 37.545, lng: 127.054 } });
  });
  it('5km 밖이면 far', async () => {
    fakeGeo({ lat: 35.1796, lng: 129.0756 });
    const { result } = renderHook(() => useMyLocation());
    let r; await act(async () => { r = await result.current.locate(); });
    expect(r).toEqual({ kind: 'far' });
  });
  it('권한을 거부하면 denied', async () => {
    fakeGeo('error');
    const { result } = renderHook(() => useMyLocation());
    let r; await act(async () => { r = await result.current.locate(); });
    expect(r).toEqual({ kind: 'denied' });
  });

  it('권한 창에 응답이 없으면 8초 뒤 denied', async () => {
    vi.useFakeTimers();
    Object.defineProperty(navigator, 'geolocation', { configurable: true, value: { getCurrentPosition: () => {} } });
    const { result } = renderHook(() => useMyLocation());
    let r: unknown;
    const p = result.current.locate().then(x => { r = x; });
    await act(async () => { vi.advanceTimersByTime(8000); await p; });
    expect(r).toEqual({ kind: 'denied' });
    vi.useRealTimers();
  });
});
