import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { KakaoLoader } from '@/shared/ui/kakao-map';
import { myCoupons, useDB } from '@/shared/api';
import { cStatus } from '@/entities/coupon';
import { unseenAnswer } from '@/entities/inquiry';
import { Icon } from '@/shared/ui/icon';
import { Busy, Toast } from '@/shared/ui/mobile';
import '../styles/customer.css';

const TABS = [
  { to: '/', label: '둘러보기', icon: 'map' as const, end: true },
  { to: '/stores', label: '매장', icon: 'store' as const },
  { to: '/wallet', label: '내 쿠폰', icon: 'ticket' as const },
  { to: '/my', label: '마이', icon: 'user' as const },
];
const TAB_PATHS = ['/', '/stores', '/wallet', '/my'];

/** 고객 모바일 웹: 가운데 최대 폭 480px, 아래 탭 4개 (둘러보기·매장·내 쿠폰·마이) */
export function CustomerLayout() {
  const { pathname } = useLocation();
  const db = useDB();
  const showTabs = TAB_PATHS.includes(pathname);
  const active = db.account.logged ? myCoupons(db).filter(c => cStatus(c).active).length : 0;
  const newAnswer = db.account.logged && unseenAnswer(db);
  return (
    <div className="c-shell">
      <KakaoLoader />
      <div className={`c-app ${showTabs ? '' : 'no-tabs'}`}>
        <Outlet />
        {showTabs && (
          <nav className="tabs" aria-label="앱 메뉴">
            {TABS.map(t => (
              <NavLink key={t.to} to={t.to} end={t.end} className={({ isActive }) => (isActive ? 'on' : '')}>
                <Icon name={t.icon} size={22} />{t.label}
                {t.to === '/wallet' && active > 0 && <span className="sr-only">사용 가능 {active}장</span>}
                {t.to === '/my' && newAnswer && <i className="ndot" role="img" aria-label="새 답변" />}
              </NavLink>
            ))}
          </nav>
        )}
        <Toast />
        <Busy />
      </div>
    </div>
  );
}
