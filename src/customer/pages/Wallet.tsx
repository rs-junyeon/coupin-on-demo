import { useNavigate, useSearchParams } from 'react-router-dom';
import { cStatus, myCoupons, prodOf, storeOf } from '@/domain/rules';
import { daysLeft, md, won, ymdDot } from '@/shared/lib';
import { type Coupon, useDB } from '@/shared/api';
import { CatIcon } from '@/ui/CatIcon';
import { Icon } from '@/shared/ui/icon';
import { TopBar } from '@/shared/ui/mobile';
import s from './purchase.module.css';

type Tab = 'all' | 'active' | 'past';
const TABS: [Tab, string][] = [['all', '전체'], ['active', '사용 가능'], ['past', '사용 완료·만료']];
const EMPTY: Record<Tab, string> = { all: '받은 쿠폰이 없어요', active: '쓸 수 있는 쿠폰이 없어요', past: '지난 쿠폰이 없어요' };

/** 내 쿠폰 탭 (C-04-01). 전체는 쓸 수 있는 쿠폰 먼저, 그다음 지난 쿠폰 (각각 최근 받은 순) */
export default function Wallet() {
  const [sp, setSp] = useSearchParams();
  const nav = useNavigate();
  const db = useDB();
  const t = sp.get('tab');
  const tab: Tab = t === 'active' || t === 'past' ? t : 'all';

  const mine = myCoupons(db).slice().sort((a, b) => +new Date(b.issuedAt) - +new Date(a.issuedAt));
  const act = mine.filter(c => cStatus(c).active), past = mine.filter(c => !cStatus(c).active);
  const list = { all: [...act, ...past], active: act, past }[tab];
  const count = { all: mine.length, active: act.length, past: past.length };

  const sub = (c: Coupon) => {
    const st = cStatus(c);
    if (st.active) {
      const dd = daysLeft(c.exp);
      return <span className={`dd ${dd <= 7 ? 'soon' : ''}`}>{dd === 0 ? 'D-day' : `D-${dd}`} · {md(c.exp)}까지{c.status === 'IN_USE' && c.balance != null ? ` · 잔액 ${won(c.balance)}` : ''}</span>;
    }
    const txt = c.usedAt ? `${ymdDot(c.usedAt)} 사용` : st.k === 'cancel' ? (c.paid > 0 ? '환불로 취소됨' : '발급 취소됨') : `${ymdDot(c.exp)} 만료`;
    return <span className={`dd ${s.ddPast}`}>{txt}</span>;
  };

  return (
    <div className="c-page">
      <TopBar big title="내 쿠폰" />
      <div className="wtabs" role="tablist" aria-label="쿠폰 구분">
        {TABS.map(([k, label]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} className={tab === k ? 'on' : ''}
            onClick={() => setSp(k === 'all' ? {} : { tab: k }, { replace: true })}>{label} {count[k]}</button>
        ))}
      </div>
      <div className="scroll">
        <div className="wlist">
          {list.length ? list.map(c => {
            const p = prodOf(db, c.pid), st = cStatus(c);
            return (
              <button key={c.id} type="button" className={`wc ${st.active ? '' : 'past'}`} onClick={() => nav(`/coupons/${c.id}`)}>
                <CatIcon cat={p.cat} size={22} />
                <span><b>{p.name}</b><span className="s">{storeOf(db, p.sid).name}</span>{sub(c)}</span>
                <span className={`st-chip st-${st.k}`}>{st.t}</span>
              </button>
            );
          }) : (
            <div className="empty">
              <Icon name="ticket" size={36} stroke={1.6} />
              <b>{EMPTY[tab]}</b>
              <span>주변 가게 혜택을 둘러보세요.</span>
              <button type="button" className={`sbtn line ${s.emptyBtn}`} onClick={() => nav('/')}>둘러보기</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
