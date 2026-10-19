// PLUS 상품 (A-02-01): 점주가 PLUS에서 내보낸 상품과 지금 상태를 본다. 판매 조건·게시·숨김은 상품 관리에서
import { SyncOutlined } from '@ant-design/icons';
import { App, Button, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import { adminStatus, CatCell, isFree, LimitCell, OnPriceCell, ProdCell, StateCell } from '@/entities/product';
import { dtA, won } from '@/shared/lib';
import { type Product, useDB } from '@/shared/api';
import { catalogCss as s, ListBox, PageHead, StatusTag, tableProps } from '@/shared/ui/admin';
import { useProductFilter } from '@/features/product-filter';

export default function PlusProducts() {
  const db = useDB();
  const nav = useNavigate();
  const { message } = App.useApp();
  const { rows, search } = useProductFilter(db);
  const last = db.syncLog.find(x => x.ok);

  const runSync = () => {
    db.sync();
    message.success(`PLUS에서 상품 ${useDB.getState().syncLog[0].n ?? 0}개를 다시 받았어요`);
  };

  const columns: ColumnsType<Product> = [
    { title: '상품 · 가게', render: (_, p) => <ProdCell db={db} p={p} /> },
    { title: '카테고리', render: (_, p) => <CatCell p={p} /> },
    { title: '구분', render: (_, p) => (isFree(p) ? <StatusTag kind="part">무료</StatusTag> : <StatusTag kind="used">판매</StatusTag>) },
    { title: '소비자가', align: 'right', render: (_, p) => (p.list != null ? won(p.list) : <span className={s.dash}>-</span>) },
    { title: '점주 판매가', align: 'right', render: (_, p) => (isFree(p) ? '무료' : won(p.own)) },
    { title: 'ON 판매가', align: 'right', render: (_, p) => <OnPriceCell p={p} /> },
    { title: '상품별 한도', align: 'right', render: (_, p) => <LimitCell p={p} /> },
    { title: '상태', render: (_, p) => <StateCell st={adminStatus(db, p)} /> },
  ];

  return (
    <>
      <PageHead title="PLUS 상품" id="A-02-01" desc="점주가 쿠핀 PLUS의 ON 내보내기 페이지에서 내보낸 상품과 지금 상태를 보는 화면이에요. 상품 정보·위치·판매가는 점주가 PLUS에서 정해요. 판매 조건·게시·숨김은 상품 관리에서 해요. 행을 누르면 상품 상세가 열려요." />
      {search}
      <ListBox total={rows.length} extra={<>
        {last && <span className="a-meta">마지막 동기화 {dtA(last.at)}</span>}
        <Button icon={<SyncOutlined />} onClick={runSync}>동기화 실행</Button>
      </>}>
        <Table {...tableProps} rowKey="id" columns={columns} dataSource={rows} rowClassName="row-link"
          locale={{ emptyText: '조건에 맞는 상품이 없어요' }}
          onRow={p => ({
            onClick: () => nav(`/admin/plus-products/${p.id}`),
            onKeyDown: e => { if (e.key === 'Enter') nav(`/admin/plus-products/${p.id}`); },
            tabIndex: 0, title: '상품 상세 보기',
          })} />
      </ListBox>
    </>
  );
}
