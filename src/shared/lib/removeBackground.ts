// 단색 배경 지우기: 그림 네 모서리 색을 배경으로 보고, 그 색과 비슷한 색을 투명하게 만든다

export type Rect = { x: number; y: number; w: number; h: number };

/** 배경색과 이만큼(RGB 거리) 가까우면 배경으로 본다. 그 두 배 안쪽은 경계라 반투명하게 */
const TOL = 40;

/** px: RGBA 픽셀(width × height), r: 그림이 그려진 영역. 배경을 지웠으면 true */
export function removeBackground(px: Uint8ClampedArray, width: number, r: Rect): boolean {
  const at = (x: number, y: number) => (y * width + x) * 4;
  const x1 = r.x + r.w - 1, y1 = r.y + r.h - 1;
  const corners = [at(r.x, r.y), at(x1, r.y), at(r.x, y1), at(x1, y1)];
  // 모서리가 이미 투명하면 지울 배경이 없다
  if (corners.some(i => px[i + 3] < 200)) return false;
  const bg = [0, 1, 2].map(c => corners.reduce((s, i) => s + px[i + c], 0) / 4);
  const dist = (i: number) => Math.hypot(px[i] - bg[0], px[i + 1] - bg[1], px[i + 2] - bg[2]);
  // 모서리 색이 서로 다르면 단색 배경이 아니다 (사진 등)
  if (corners.some(i => dist(i) > TOL)) return false;

  // 배경색에 가까운 색은 그림 어디에 있든 지운다: 흰색 실루엣으로 그리므로, 글자 구멍처럼 바탕색으로 비워 둔 곳도 구멍으로 남아야 한다
  // 배경색과 조금 다른 경계 색은 가까운 만큼 투명하게 (계단 현상 줄이기)
  let cleared = 0;
  for (let y = r.y; y <= y1; y++) {
    for (let x = r.x; x <= x1; x++) {
      const i = at(x, y), d = dist(i);
      if (px[i + 3] === 0 || d >= TOL * 2) continue;
      if (d <= TOL) { px[i + 3] = 0; cleared++; } else px[i + 3] = Math.round(px[i + 3] * ((d - TOL) / TOL));
    }
  }
  return cleared > 0;
}
