// 환불 (A-03-02): 고객 요청은 서버가 바로 처리한다. 막힌 건은 다시 시도하고, PLUS 거절 건과 운영자 직접 취소 기록을 본다
import { App, Button, Table, type TableColumnsType } from 'antd';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { type Order, prodOf, type Product, type Refund, storeOf, useDB } from '@/shared/api';
import { who } from '@/entities/account';
import { dtA, won } from '@/shared/lib';
import { ListBox, PageHead, SearchBox, SearchRadio, StatusTag, tableProps } from '@/shared/ui/admin';
import { ListQFields, listHit, Q0, refundTag } from './listFilter';
import s from './orders.module.css';

type Res = 'all' | Refund['result'];
const RES: { value: Res; label: string }[] = [{ value: 'all', label: '전체' }, { value: '처리 중', label: '처리 중' }, { value: '완료', label: '완료' }, { value: '거절', label: '거절' }];
type Row = Refund & { key: string; o: Order; p: Product };

export default function Refunds() {
  const db = useDB();
  const { message } = App.useApp();
  const [res, setRes] = useState<Res>('all');
  const [f, setF] = useState(Q0);
  // 결과 칩의 건수는 다른 조건(기간·카테고리·검색칸)을 반영한다
  const base: Row[] = db.refunds
    .map((r, i) => { const o = db.orders.find(x => x.id === r.oid)!; return { ...r, key: `${r.oid}-${i}`, o, p: prodOf(db, o.pid) }; })
    .filter(r => listHit(db, f, r.p, r.o.owner, r.at))
    .sort((a, b) => +new Date(b.at) - +new Date(a.at));
  const rows = base.filter(r => res === 'all' || r.result === res);
  const opts = RES.map(o => ({ ...o, count: base.filter(r => o.value === 'all' || r.result === o.value).length }));

  const retry = (oid: string) => { db.retryRefund(oid); message.success('결제 취소가 끝났어요'); };
  const columns: TableColumnsType<Row> = [
    { title: '요청 일시', dataIndex: 'at', render: (v: string) => dtA(v) },
    { title: '주문번호', dataIndex: 'oid', render: (v: string) => <Link className={s.mono} to={`/admin/orders/${v}`}>{v}</Link> },
    { title: '상품', key: 'p', render: (_, r) => r.p.name },
    { title: '가게', key: 's', render: (_, r) => storeOf(db, r.p.sid).name },
    { title: '고객', key: 'c', render: (_, r) => who(r.o.owner) },
    { title: '금액', key: 'amt', align: 'right', render: (_, r) => won(r.o.amount) },
    { title: '결과', dataIndex: 'result', render: (v: Refund['result']) => <StatusTag kind={refundTag(v)}>{v}</StatusTag> },
    { title: '내용', dataIndex: 'memo' },
    { title: '동작', key: 'act', render: (_, r) => (r.result === '처리 중' ? <Button size="small" type="primary" onClick={() => retry(r.oid)}>결제 취소 다시 시도</Button> : <span className={s.none}>-</span>) },
  ];

  return (
    <>
      <PageHead title="환불" id="A-03-02" desc="고객이 요청하면 서버가 바로 PLUS 발급 취소, 결제 취소 순서로 처리해요. 결제 취소가 막힌 건은 여기서 다시 시도하고, PLUS가 거절한 건(이미 사용)은 환불하지 않아요." />
      <SearchBox onReset={() => { setRes('all'); setF(Q0); }}>
        <SearchRadio label="결과" value={res} options={opts} onChange={setRes} />
        <ListQFields db={db} value={f} onChange={setF} />
      </SearchBox>
      <ListBox total={rows.length}>
        <Table<Row> {...tableProps} rowKey="key" columns={columns} dataSource={rows}
          rowClassName={r => (r.result === '처리 중' ? 'row-warn' : '')} locale={{ emptyText: '조건에 맞는 환불 기록이 없어요' }} />
      </ListBox>
    </>
  );
}
