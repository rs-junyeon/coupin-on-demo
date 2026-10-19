// 발급 내역 (A-03-03): ON에서 발급된 모든 쿠폰. 사용 상태는 PLUS에서 받아 오고 PIN은 가려서 보인다
import { Button, Space, Table, type TableColumnsType } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { type CouponState, cStatus, maskPin } from '@/entities/coupon';
import { type Coupon, prodOf, storeOf, useDB } from '@/shared/api';
import { who } from '@/entities/account';
import { dtA, won } from '@/shared/lib';
import { ListBox, ordersCss as s, PageHead, SearchBox, SearchRadio, StatusTag, tableProps } from '@/shared/ui/admin';
import { CancelCouponModal } from '@/features/cancel-coupon';
import { listHit, ListQFields, Q0 } from '@/features/order-list-filter';

type St = 'all' | 'active' | 'used' | 'cancel' | 'exp';
const STS: { value: St; label: string }[] = [{ value: 'all', label: '전체' }, { value: 'active', label: '사용 가능' }, { value: 'used', label: '사용 완료' }, { value: 'cancel', label: '취소' }, { value: 'exp', label: '만료' }];
/** 사용 가능은 일부 사용한 금액권도 포함한다 */
const stHit = (st: CouponState, v: St) => v === 'all' || (v === 'active' ? st.active : v === 'used' ? st.k === 'used' : v === 'cancel' ? st.k === 'cancel' : st.k === 'exp');

export default function Coupons() {
  const db = useDB();
  const nav = useNavigate();
  const [stf, setStf] = useState<St>('all');
  const [f, setF] = useState(Q0);
  const [cancel, setCancel] = useState<string | null>(null);
  const rows = db.coupons
    .filter(c => stHit(cStatus(c), stf) && listHit(db, f, prodOf(db, c.pid), c.owner, c.issuedAt))
    .sort((a, b) => +new Date(b.issuedAt) - +new Date(a.issuedAt));

  const columns: TableColumnsType<Coupon> = [
    { title: '발급 일시', dataIndex: 'issuedAt', render: (v: string) => dtA(v) },
    { title: '주문번호', dataIndex: 'oid', render: (v: string) => <span className={s.mono}>{v}</span> },
    { title: '상품', key: 'p', render: (_, c) => { const p = prodOf(db, c.pid); return <>{p.name}<span className="sub">{storeOf(db, p.sid).name}</span></>; } },
    { title: '고객', dataIndex: 'owner', render: (v: string) => who(v) },
    { title: '결제', dataIndex: 'paid', align: 'right', render: (v: number) => (v ? won(v) : '무료') },
    { title: '상태', key: 'st', render: (_, c) => { const st = cStatus(c); return <><StatusTag kind={st.k}>{st.t}</StatusTag>{c.balance != null && st.active && <span className="sub">잔액 {won(c.balance)}</span>}</>; } },
    { title: '사용 일시', dataIndex: 'usedAt', render: (v: string | null) => (v ? dtA(v) : '-') },
    { title: 'PIN', dataIndex: 'pin', render: (v: string) => <span className={s.mono}>{maskPin(v)}</span> },
    {
      title: '동작', key: 'act', render: (_, c) => (
        <Space size={6}>
          <Button size="small" onClick={() => nav(`/admin/coupons/${c.id}`)}>상세</Button>
          <Button size="small" danger disabled={cStatus(c).t !== '사용 가능'} onClick={() => setCancel(c.id)}>취소</Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <PageHead title="발급 내역" id="A-03-03" desc="ON에서 발급된 모든 쿠폰이에요. 사용 상태는 PLUS에서 받아 와요. PIN은 가려서 보여요." />
      <SearchBox onReset={() => { setStf('all'); setF(Q0); }}>
        <SearchRadio label="쿠폰 상태" value={stf} options={STS} onChange={setStf} />
        <ListQFields db={db} value={f} onChange={setF} />
      </SearchBox>
      <ListBox total={rows.length}>
        <Table<Coupon> {...tableProps} rowKey="id" columns={columns} dataSource={rows} locale={{ emptyText: '조건에 맞는 쿠폰이 없어요' }} />
      </ListBox>
      <CancelCouponModal cid={cancel} onClose={() => setCancel(null)} />
    </>
  );
}
