// 주문 (A-03-01): 유료 주문의 결제·발급 상태
import { Button, Table, type TableColumnsType } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderTag, oStatus } from '@/entities/order';
import { type Order, prodOf, storeOf, useDB } from '@/shared/api';
import { who } from '@/entities/account';
import { dtA, won } from '@/shared/lib';
import { ListBox, ordersCss as s, PageHead, SearchBox, SearchRadio, StatusTag, tableProps } from '@/shared/ui/admin';
import { listHit, ListQFields, Q0 } from '@/features/order-list-filter';

type Chip = 'all' | 'unk' | 'stuck';
const CHIPS: { value: Chip; label: string }[] = [{ value: 'all', label: '전체' }, { value: 'unk', label: '결과 미확인' }, { value: 'stuck', label: '환불 처리 중' }];
const needsWork = (o: Order) => !!o.unconfirmed || o.status === '환불 처리 중';

export default function Orders() {
  const db = useDB();
  const nav = useNavigate();
  const [chip, setChip] = useState<Chip>('all');
  const [f, setF] = useState(Q0);
  const rows = db.orders.filter(o => (chip === 'all' || (chip === 'unk' ? o.unconfirmed : o.status === '환불 처리 중')) && listHit(db, f, prodOf(db, o.pid), o.owner, o.at));

  const columns: TableColumnsType<Order> = [
    { title: '결제 일시', dataIndex: 'at', render: (v: string) => dtA(v) },
    { title: '주문번호', dataIndex: 'id', render: (v: string) => <span className={s.mono}>{v}</span> },
    { title: '상품', key: 'p', render: (_, o) => { const p = prodOf(db, o.pid); return <>{p.name}<span className="sub">{storeOf(db, p.sid).name}</span></>; } },
    { title: '고객', dataIndex: 'owner', render: (v: string) => who(v) },
    { title: '결제 금액', dataIndex: 'amount', align: 'right', render: (v: number) => won(v) },
    { title: '상태', key: 'st', render: (_, o) => { const st = oStatus(o); return <><StatusTag kind={orderTag(st)}>{st}</StatusTag>{o.note && <span className="sub">{o.note}</span>}</>; } },
    { title: '동작', key: 'act', render: (_, o) => <Button size="small" onClick={() => nav(`/admin/orders/${o.id}`)}>상세</Button> },
  ];

  return (
    <>
      <PageHead title="주문" id="A-03-01" desc="유료 주문의 결제·발급 상태예요. [상세]를 누르면 주문 상세가 열려요." />
      <SearchBox onReset={() => { setChip('all'); setF(Q0); }}>
        <SearchRadio label="주문 상태" value={chip} options={CHIPS} onChange={setChip} />
        <ListQFields db={db} value={f} onChange={setF} />
      </SearchBox>
      <ListBox total={rows.length}>
        <Table<Order> {...tableProps} rowKey="id" columns={columns} dataSource={rows}
          rowClassName={o => (needsWork(o) ? 'row-warn' : '')} locale={{ emptyText: '조건에 맞는 주문이 없어요' }} />
      </ListBox>
    </>
  );
}
