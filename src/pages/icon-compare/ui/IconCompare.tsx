// 아이콘 라이브러리 비교: 같은 고객 앱을 antd(지금)와 lucide 로 나란히 띄운다. 두 창은 따로 움직이고 데이터(브라우저 저장소)는 같다
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import s from './IconCompare.module.css';

const SIDES = [
  { name: 'icons-antd', title: '@ant-design/icons', note: '지금 쓰는 Outlined' },
  { name: 'icons-lucide', title: 'lucide-react', note: 'shadcn 기본 아이콘' },
];

/**
 * 고객 앱 두 개를 390×844 휴대폰 크기로 나란히 놓는다. 오른쪽 창은 iframe 이름으로 lucide 를 고른다 (shared/ui/icon).
 * 두 창은 처음 연 주소(링크로 들어온 화면)에서 시작한다
 */
export default function IconComparePage() {
  const { pathname, search } = useLocation();
  const [src] = useState(pathname + search);
  return (
    <main className={s.page}>
      <header className={s.head}>
        <h1>고객 앱 아이콘 비교</h1>
        <p>같은 화면을 아이콘 라이브러리만 바꿔 나란히 띄웠어요. 두 화면은 따로 움직이고, 받은 쿠폰 같은 데이터는 같이 바뀌어요.</p>
      </header>
      <div className={s.row}>
        {SIDES.map(side => (
          <figure key={side.name} className={s.side}>
            <figcaption className={s.cap}>
              <strong>{side.title}</strong>
              <span>{side.note}</span>
            </figcaption>
            <iframe className={s.frame} name={side.name} src={src} title={`${side.title} 고객 앱`} />
          </figure>
        ))}
      </div>
    </main>
  );
}
