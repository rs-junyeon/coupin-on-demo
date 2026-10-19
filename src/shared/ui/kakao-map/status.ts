import { create } from 'zustand';

export type MapStatus = 'missing' | 'loading' | 'error' | 'ready';
export const useMapStatus = create<{ status: MapStatus; set(s: MapStatus): void }>()(set => ({
  status: 'loading',
  set: status => set({ status }),
}));
