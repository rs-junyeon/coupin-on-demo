// 상품 관리 (A-02-06): 판매 조건·게시·숨김, 여러 상품을 골라 카테고리 지정·게시 (A-02-06-01)
import { App, Button, Input, Select, Table, type CheckboxProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { adminStatus, editable, storeOf } from '@/domain/rules';
import { type Product, useDB } from '@/shared/api';
import { ListBox, PageHead, tableProps } from '@/shared/ui/admin';
import { CatCell, LimitCell, OnPriceCell, ProdCell, StateCell, useProductFilter } from './catalog';
import s from './catalog.module.css';

const NEW = '__new';

export default function Products() {
  const db = useDB();
  const nav = useNavigate();
  const flash = (useLocation().state as { flash?: string } | null)?.flash;
  const { message, modal } = App.useApp();
  const { rows, search, filterKey } = useProductFilter(db);
  const [sel, setSel] = useState<string[]>([]);
  const [bulk, setBulk] = useState({ cat: '', newCat: '', err: '' });

  const clearSel = () => { setSel([]); setBulk({ cat: '', newCat: '', err: '' }); };
  // 검색조건을 바꾸면 고른 상품을 비운다
  useEffect(clearSel, [filterKey]);

  const applyBulk = (andPublish: boolean) => {
    const cat = bulk.cat === NEW ? bulk.newCat.trim() : bulk.cat;
    if (!cat) { setBulk(b => ({ ...b, err: b.cat === NEW ? '새 카테고리 이름을 적어 주세요' : '지정할 카테고리를 골라 주세요' })); return; }
    const r = db.bulkApply(sel, cat, andPublish);
    const msg = `${r.count}개 상품을 '${cat}' 카테고리로 지정했어요`;
    message.success(!andPublish ? msg : `${msg} · ${r.published ? `${r.published}개 게시` : '게시한 상품 없음'}${r.skipped ? ` (${r.skipped}개는 이미 게시 중이거나 노출 불가라 건너뜀)` : ''}`);
    clearSel();
  };

  const publish = (p: Product) => {
    if (!p.cat && editable(db, p)) { nav(`/admin/products/${p.id}/terms`, { state: { catErr: '게시하려면 카테고리를 먼저 골라 주세요' } }); return; }
    const r = db.publish(p.id);
    if (!r.ok) { message.error(r.error); return; }
    message.success(`게시했어요. 고객 지도에 '${storeOf(db, p.sid).name}' 쿠폰이 나와요`);
  };
  const hide = (p: Product) => modal.confirm({
    title: '이 상품을 숨길까요?',
    content: `${p.name} · 고객 화면에서 바로 사라져요. 이미 받은 쿠폰은 그대로 쓸 수 있어요.`,
    okText: '숨김', cancelText: '닫기',
    onOk: () => { db.hide(p.id); message.success('숨겼어요. 고객 화면에서 바로 사라져요. 이미 받은 쿠폰은 그대로 쓸 수 있어요'); },
  });

  const columns: ColumnsType<Product> = [
    { title: '상품 · 가게', render: (_, p) => <ProdCell db={db} p={p} /> },
    { title: '카테고리', render: (_, p) => <CatCell p={p} /> },
    { title: 'ON 판매가', align: 'right', render: (_, p) => <OnPriceCell p={p} /> },
    { title: '상품별 한도', align: 'right', render: (_, p) => <LimitCell p={p} /> },
    { title: '상태', render: (_, p) => <StateCell st={adminStatus(db, p)} /> },
    {
      title: '동작', render: (_, p) => {
        const k = adminStatus(db, p).k;
        return (
          <div className={s.acts}>
            <Button size="small" disabled={!editable(db, p)} onClick={() => nav(`/admin/products/${p.id}/terms`)} aria-label={`${p.name} 판매 조건`}>판매 조건</Button>
            {(k === 'draft' || k === 'hidden') && <Button size="small" type="primary" onClick={() => publish(p)} aria-label={`${p.name} 게시`}>게시</Button>}
            {k === 'pub' && <Button size="small" onClick={() => hide(p)} aria-label={`${p.name} 숨김`}>숨김</Button>}
          </div>
        );
      },
    },
  ];

  const catOpts = [...Object.keys(db.cats).map(k => ({ value: k, label: k })), { value: NEW, label: '＋ 새 카테고리 추가' }];

  return (
    <>
      <PageHead title="상품 관리" id="A-02-06" desc="PLUS 상품의 판매 조건(카테고리·ON 판매가·한도)과 게시·숨김을 정하는 화면이에요. 카테고리는 ON 운영자가 게시 전에 골라요. 여러 상품을 체크해 한 번에 지정·게시할 수도 있어요. 가격은 할인 방향으로만 조정해요." />
      {search}
      <ListBox total={rows.length}>
        {sel.length > 0 && (
          <div className="a-bulk" role="region" aria-label="일괄 처리">
            <b>{sel.length}개 선택</b><span className="a-sid">A-02-06-01</span>
            <Select className={s.bulkSel} aria-label="한 번에 지정할 카테고리" placeholder="카테고리를 골라 주세요" value={bulk.cat || undefined}
              options={catOpts} onChange={v => setBulk(b => ({ ...b, cat: v, err: '' }))} />
            {bulk.cat === NEW && <Input className={s.bulkInput} aria-label="새 카테고리 이름" placeholder="새 카테고리 이름" value={bulk.newCat} onChange={e => setBulk(b => ({ ...b, newCat: e.target.value, err: '' }))} />}
            <Button onClick={() => applyBulk(false)}>카테고리 지정</Button>
            <Button type="primary" onClick={() => applyBulk(true)}>지정하고 게시</Button>
            <span className={s.sp} />
            <Button onClick={clearSel}>선택 해제</Button>
            {bulk.err && <p className={s.err} role="alert">{bulk.err}</p>}
          </div>
        )}
        <Table {...tableProps} rowKey="id" columns={columns} dataSource={rows}
          locale={{ emptyText: '조건에 맞는 상품이 없어요' }}
          rowClassName={p => (p.id === flash ? 'row-hl' : '')}
          rowSelection={{ selectedRowKeys: sel, onChange: keys => setSel(keys as string[]), getCheckboxProps: p => ({ 'aria-label': `${p.name} 고르기` }) as CheckboxProps }} />
      </ListBox>
    </>
  );
}
