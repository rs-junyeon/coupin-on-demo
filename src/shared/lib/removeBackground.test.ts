import { describe, expect, it } from 'vitest';
import { removeBackground } from './removeBackground';

const W = 10;
/** 10×10 그림: fill(x, y) → [r, g, b, a] */
const img = (fill: (x: number, y: number) => number[]) => {
  const px = new Uint8ClampedArray(W * W * 4);
  for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) px.set(fill(x, y), (y * W + x) * 4);
  return px;
};
const alpha = (px: Uint8ClampedArray, x: number, y: number) => px[(y * W + x) * 4 + 3];
const ALL = { x: 0, y: 0, w: W, h: W };
const WHITE = [255, 255, 255, 255], BLACK = [20, 20, 20, 255];

describe('단색 배경 지우기', () => {
  it('흰 바탕을 지우고, 고리 가운데처럼 바탕색으로 비워 둔 곳도 구멍으로 지운다', () => {
    // 2~7 칸은 검은 고리, 가운데 4~5 칸은 흰색
    const px = img((x, y) => (x >= 2 && x <= 7 && y >= 2 && y <= 7 ? (x >= 4 && x <= 5 && y >= 4 && y <= 5 ? WHITE : BLACK) : WHITE));
    expect(removeBackground(px, W, ALL)).toBe(true);
    expect(alpha(px, 0, 0)).toBe(0);
    expect(alpha(px, 9, 5)).toBe(0);
    expect(alpha(px, 2, 2)).toBe(255);
    expect(alpha(px, 4, 4)).toBe(0);
  });
  it('모서리가 이미 투명하면 그대로 둔다', () => {
    const px = img((x, y) => (x > 2 && x < 7 && y > 2 && y < 7 ? BLACK : [0, 0, 0, 0]));
    expect(removeBackground(px, W, ALL)).toBe(false);
    expect(alpha(px, 4, 4)).toBe(255);
  });
  it('모서리 색이 서로 다르면(사진 등) 단색 배경이 아니라 지우지 않는다', () => {
    const px = img(x => (x < 5 ? WHITE : [200, 40, 40, 255]));
    expect(removeBackground(px, W, ALL)).toBe(false);
    expect(alpha(px, 0, 0)).toBe(255);
  });
});
