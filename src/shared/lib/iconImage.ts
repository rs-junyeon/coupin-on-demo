// 올린 PNG·SVG를 아이콘용으로 줄인다: 128px 정사각형 투명 PNG(data URL).
// 단색 배경(흰 바탕 등)은 자동으로 지우고, 그래도 배경이 남으면(opaque) 알려 준다

const SIZE = 128;
const MAX_BYTES = 1024 * 1024;

import { removeBackground } from './removeBackground';

export type IconImage = { ok: true; src: string; opaque: boolean; bgRemoved: boolean } | { ok: false; error: string };

const isSvg = (f: File) => f.type === 'image/svg+xml' || /\.svg$/i.test(f.name);
const isPng = (f: File) => f.type === 'image/png' || /\.png$/i.test(f.name);

function load(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

export async function toIconImage(file: File): Promise<IconImage> {
  if (!isPng(file) && !isSvg(file)) return { ok: false, error: 'PNG나 SVG 파일만 올릴 수 있어요' };
  if (file.size > MAX_BYTES) return { ok: false, error: '1MB 이하 파일만 올릴 수 있어요' };
  const url = URL.createObjectURL(file);
  try {
    const img = await load(url);
    // 크기 정보가 없는 SVG는 정사각형으로 본다
    const w = img.naturalWidth || SIZE, h = img.naturalHeight || SIZE, k = SIZE / Math.max(w, h);
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) return { ok: false, error: '이미지를 읽지 못했어요' };
    const r = { x: Math.round((SIZE - w * k) / 2), y: Math.round((SIZE - h * k) / 2), w: Math.round(w * k), h: Math.round(h * k) };
    ctx.drawImage(img, r.x, r.y, r.w, r.h);
    const data = ctx.getImageData(0, 0, SIZE, SIZE);
    const bgRemoved = removeBackground(data.data, SIZE, r);
    if (bgRemoved) ctx.putImageData(data, 0, 0);
    const a = data.data;
    let shown = 0, solid = 0;
    for (let i = 3; i < a.length; i += 4) { if (a[i] > 16) shown++; if (a[i] > 200) solid++; }
    if (!shown) return { ok: false, error: '그림이 비어 있어요. 다른 파일을 골라 주세요' };
    // 그림 영역의 90% 넘게 불투명하면 배경이 남은 것으로 본다
    return { ok: true, src: canvas.toDataURL('image/png'), opaque: solid / (r.w * r.h) > 0.9, bgRemoved };
  } catch {
    return { ok: false, error: '이미지를 읽지 못했어요. 다른 파일을 골라 주세요' };
  } finally {
    URL.revokeObjectURL(url);
  }
}
