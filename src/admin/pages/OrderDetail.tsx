// 주문 상세 (A-03-01-01): 주문 당시 상품·가격, 결제·발급 상태, 처리 이력
import { App, Button } from 'antd';
import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { cStatus, FEE, maskPin, oStatus, prodOf, storeOf, validityTxt, who } from '@/domain/rules';
import { dtA, won } from '@/shared/lib';
import { type Coupon, type Order, useDB } from '@/shared/api';
import { CancelCouponModal } from '../components/CancelCouponModal';
import { BtnBox, Card, DlGroup, PageHead, StatusTag } from '@/shared/ui/admin';
import { orderTag } from './listFilter';
import s from './orders.module.css';

function orderHist(o: Order, c: Coupon | null): [string, string][] {
  const h: [string, string][] = [[o.at, `결제 승인 · ${o.method} ${won(o.amount)}`]];
  if (c) h.push([c.issuedAt, `PLUS 발급 완료 · tid ${o.id}`]);
  o.log.forEach(x => h.push(x));
  return h.sort((a, b) => +new Date(a[0]) - +new Date(b[0]));
}

function feeTxt(o: Order) {
  if (o.status === '완료') return `${won(Math.round(o.amount * FEE))} (판매가의 ${Math.round(FEE * 100)}%)`;
  if (/환불|실패/.test(o.status)) return '없음 (취소·환불 주문)';
  return '발급 확정 뒤 계산';
}

export default function OrderDetail() {
  const { oid } = useParams();
  const db = useDB();
  const nav = useNavigate();
  const { message } = App.useApp();
  const [cancel, setCancel] = useState<string | null>(null);
  const o = db.orders.find(x => x.id === oid);
  if (!o) return <Navigate to="/admin/orders" replace />;
  const p = prodOf(db, o.pid);
  const c = o.cid ? db.coupons.find(x => x.id === o.cid) ?? null : null;
  const st = c ? cStatus(c) : null, os = oStatus(o);
  const canRefund = !!c && st?.t === '사용 가능' && o.status === '완료';

  return (
    <>
      <PageHead title="주문 상세" id="A-03-01-01" desc={<><span className={s.mono}>{o.id}</span> · {who(o.owner)}</>} />
      <div className="a-grid2">
        <Card title="주문 당시 상품·가격">
          <DlGroup rows={[
            ['상품', `${p.name} · ${storeOf(db, p.sid).name}`],
            ['판매가', won(o.amount)],
            ['판매수수료', feeTxt(o)],
            ['유효기간', validityTxt(p).main],
          ]} />
        </Card>
        <Card title="결제·발급 상태">
          <DlGroup rows={[
            ['결제', `${o.method} · ${dtA(o.at)}`],
            ['주문 상태', <StatusTag kind={orderTag(os)}>{os}</StatusTag>],
            ['연결된 쿠폰', c && st ? <Link to={`/admin/coupons/${c.id}`}>{maskPin(c.pin)} · {st.t}</Link> : '없음'],
          ]} />
          {o.note && <p className={s.note}>{o.note}</p>}
        </Card>
      </div>
      <Card title="처리 이력">
        <ul className={s.hist}>{orderHist(o, c).map(([d, t], i) => <li key={i}><time dateTime={d}>{dtA(d)}</time>{t}</li>)}</ul>
      </Card>
      <BtnBox>
        <Button onClick={() => nav('/admin/orders')}>목록</Button>
        {o.unconfirmed && <Button type="primary" onClick={() => { db.resolveOrder(o.id); message.success('PLUS에서 발급된 것을 확인했어요. 쿠폰을 복구했어요'); }}>tid로 발급 결과 확인</Button>}
        {o.status === '환불 처리 중' && <Button type="primary" onClick={() => { db.retryRefund(o.id); message.success('결제 취소가 끝났어요'); }}>결제 취소 다시 시도</Button>}
        <Button danger disabled={!canRefund} onClick={() => c && setCancel(c.id)}>환불 처리</Button>
      </BtnBox>
      <CancelCouponModal cid={cancel} onClose={() => setCancel(null)} />
    </>
  );
}
