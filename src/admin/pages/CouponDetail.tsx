// 쿠폰 상세 (A-03-03-01): 쿠폰 정보와 상태 이력
import { Button } from 'antd';
import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { cStatus, maskPin } from '@/entities/coupon';
import { type Coupon, type DB, prodOf, useDB } from '@/shared/api';
import { who } from '@/entities/account';
import { dtA, won, ymd } from '@/shared/lib';
import { BtnBox, Card, DlGroup, ordersCss as s, PageHead, StatusTag } from '@/shared/ui/admin';
import { CancelCouponModal } from '@/features/cancel-coupon';

function couponHist(db: Pick<DB, 'refunds'>, c: Coupon): [string, string][] {
  const h: [string, string][] = [[c.issuedAt, `PLUS 발급 · 주문 ${c.oid}`]];
  if (c.usedAt) h.push([c.usedAt, c.status === 'IN_USE' ? '매장에서 일부 사용 (PLUS 사용 결과)' : '매장에서 사용 (PLUS 사용 결과)']);
  if (c.cancel) h.push([c.cancel.at, `운영자 취소 · ${c.cancel.who} · 사유: ${c.cancel.reason}`]);
  else if (c.selfCancel) h.push([c.selfCancel.at, '고객이 무료 쿠폰 취소 (PLUS 발급 취소)']);
  else if (c.status === 'CANCELLED') { const r = db.refunds.find(x => x.oid === c.oid); h.push([r ? r.at : c.issuedAt, '고객 환불 요청으로 취소 (PLUS 발급 취소)']); }
  return h.sort((a, b) => +new Date(a[0]) - +new Date(b[0]));
}

export default function CouponDetail() {
  const { cid } = useParams();
  const db = useDB();
  const nav = useNavigate();
  const [cancel, setCancel] = useState<string | null>(null);
  const c = db.coupons.find(x => x.id === cid);
  if (!c) return <Navigate to="/admin/coupons" replace />;
  const p = prodOf(db, c.pid), st = cStatus(c);
  const o = db.orders.find(x => x.cid === c.id);

  return (
    <>
      <PageHead title="쿠폰 상세" id="A-03-03-01" desc={`${p.name} · ${who(c.owner)}`} />
      <div className="a-grid2">
        <Card title="쿠폰 정보">
          <DlGroup rows={[
            ['상태', <StatusTag kind={st.k}>{st.t}</StatusTag>],
            ['PIN', <span className={s.mono}>{maskPin(c.pin)}</span>],
            ['주문번호', o ? <Link className={s.mono} to={`/admin/orders/${o.id}`}>{o.id}</Link> : <span className={s.mono}>{c.oid}</span>],
            ['결제', c.paid ? won(c.paid) : '무료'],
            ['발급 일시', dtA(c.issuedAt)],
            ['만료일', ymd(c.exp)],
            ...(c.balance != null ? [['잔액', `${won(c.balance)} / ${won(p.list ?? 0)}`] as [string, string]] : []),
          ]} />
        </Card>
        <Card title="상태 이력">
          <ul className={s.hist}>{couponHist(db, c).map(([d, t], i) => <li key={i}><time dateTime={d}>{dtA(d)}</time>{t}</li>)}</ul>
        </Card>
      </div>
      <BtnBox>
        <Button onClick={() => nav('/admin/coupons')}>목록</Button>
        <Button danger disabled={st.t !== '사용 가능'} onClick={() => setCancel(c.id)}>쿠폰 취소</Button>
      </BtnBox>
      <CancelCouponModal cid={cancel} onClose={() => setCancel(null)} />
    </>
  );
}
