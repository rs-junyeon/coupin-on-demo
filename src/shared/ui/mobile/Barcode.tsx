/** 쿠폰 바코드 (목업 barcode 함수). PIN 숫자마다 막대 폭을 정해 그린다 */
export function Barcode({ pin, className = 'bc' }: { pin: string; className?: string }) {
  let x = 0;
  const bars: { x: number; w: number }[] = [];
  ('2' + pin + '7').split('').map(Number).forEach((d, i) => {
    [1 + (d % 3), 1 + ((d + i) % 2), 1 + ((d * 3) % 4)].forEach((bw, j) => {
      if (j !== 1) bars.push({ x, w: bw * 1.6 });
      x += bw * 1.6 + 1.4;
    });
  });
  return (
    <svg className={className} viewBox={`0 0 ${x.toFixed(1)} 80`} preserveAspectRatio="none" role="img" aria-label="쿠폰 바코드">
      {bars.map(b => <rect key={b.x} x={b.x.toFixed(1)} y="0" width={b.w.toFixed(1)} height="80" fill="#10162E" />)}
    </svg>
  );
}
