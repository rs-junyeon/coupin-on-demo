// 카테고리 (A-02-05): 고객 앱 카테고리 칩과 핀 아이콘. 점주가 아니라 ON 운영자가 관리한다
import { InfoCircleOutlined } from '@ant-design/icons';
import { App, Button, Input, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CAT_ICONS, CatIcon } from '@/entities/category';
import { catShown, visible } from '@/entities/product';
import { type IconName, useDB } from '@/shared/api';
import { Icon } from '@/shared/ui/icon';
import { Card, catalogCss as s, ListBox, PageHead, StatusTag, tableProps } from '@/shared/ui/admin';
import { addCat, deleteCat, editCat } from '../model/actions';

const IC_NAME: Record<(typeof CAT_ICONS)[number], string> = { beauty: '뷰티', hair: '헤어', fit: '운동', cafe: '카페', class: '클래스', photo: '사진', food: '음식', pet: '반려동물', gift: '선물', box: '기타' };

function IconPick({ value, onChange }: { value: IconName; onChange: (v: IconName) => void }) {
  return (
    <div className={s.icpick} role="group" aria-label="아이콘">
      {CAT_ICONS.map(i => (
        <button key={i} type="button" aria-label={`아이콘 ${IC_NAME[i]}`} aria-pressed={value === i} onClick={() => onChange(i)}><Icon name={i} size={16} /></button>
      ))}
    </div>
  );
}

type Row = { key: string; live: number; total: number };

export default function Categories() {
  const db = useDB();
  const { message } = App.useApp();
  const [n, setN] = useState({ name: '', icon: 'box' as IconName, err: '' });
  const [ed, setEd] = useState<{ key: string; name: string; icon: IconName; err: string } | null>(null);
  const uncat = db.products.filter(p => !p.cat).length;

  const add = () => {
    const r = addCat(n.name, n.icon);
    if (!r.ok) { setN(x => ({ ...x, err: r.error })); return; }
    message.success(`'${n.name.trim()}' 카테고리를 만들었어요. 이 카테고리로 상품을 게시하면 고객 앱에 칩이 생겨요`);
    setN({ name: '', icon: 'box', err: '' });
  };
  const saveEdit = () => {
    if (!ed) return;
    const r = editCat(ed.key, ed.name, ed.icon);
    if (!r.ok) { setEd({ ...ed, err: r.error }); return; }
    setEd(null);
    message.success('카테고리를 바꿨어요. 고객 앱에 바로 반영돼요');
  };
  const del = (k: string) => {
    const r = deleteCat(k);
    if (r.ok) message.success(`'${k}' 카테고리를 지웠어요`); else message.error(r.error);
  };

  const rows: Row[] = Object.keys(db.cats).map(k => {
    const ps = db.products.filter(p => p.cat === k);
    return { key: k, live: ps.filter(p => visible(db, p)).length, total: ps.length };
  });
  const editing = (r: Row) => ed?.key === r.key;
  const span = (r: Row) => ({ colSpan: editing(r) ? 0 : 1 });
  const columns: ColumnsType<Row> = [
    {
      title: '카테고리', onCell: r => ({ colSpan: editing(r) ? 4 : 1 }),
      render: (_, r) => (editing(r) && ed ? (
        <div className={s.editRow}>
          <div className={s.catForm}>
            <Input className={s.catName} aria-label="카테고리 이름" value={ed.name} onChange={e => setEd({ ...ed, name: e.target.value, err: '' })} onPressEnter={saveEdit} />
            <IconPick value={ed.icon} onChange={icon => setEd({ ...ed, icon })} />
          </div>
          {ed.err && <p className={s.err} role="alert">{ed.err}</p>}
        </div>
      ) : <div className="pmini"><CatIcon cat={r.key} size={16} /><b>{r.key}</b></div>),
    },
    { title: '고객 앱', onCell: span, render: (_, r) => (catShown(db, r.key) ? <StatusTag kind="ok">칩 보임</StatusTag> : <StatusTag kind="exp">게시 상품 없음 · 칩 숨김</StatusTag>) },
    { title: '게시 중 상품', align: 'right', onCell: span, render: (_, r) => `${r.live}개` },
    { title: '전체 상품', align: 'right', onCell: span, render: (_, r) => `${r.total}개` },
    {
      title: '동작', render: (_, r) => (
        <div className={s.acts}>
          {editing(r) ? <>
            <Button size="small" onClick={() => setEd(null)}>취소</Button>
            <Button size="small" type="primary" onClick={saveEdit}>저장</Button>
          </> : <>
            <Button size="small" aria-label={`${r.key} 수정`} onClick={() => setEd({ key: r.key, name: r.key, icon: db.cats[r.key].icon, err: '' })}>수정</Button>
            <Button size="small" danger aria-label={`${r.key} 삭제`} disabled={r.total > 0} title={r.total > 0 ? '쓰는 상품이 있으면 지울 수 없어요' : undefined} onClick={() => del(r.key)}>삭제</Button>
          </>}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHead title="카테고리" id="A-02-05" desc="고객 앱 둘러보기·매장 탭의 카테고리 칩과 핀 아이콘이에요. ON 운영자가 게시 전에 상품마다 하나를 골라요. 게시 중인 상품이 있는 카테고리만 고객 앱에 칩으로 보여요." />
      {uncat > 0 && (
        <div className="a-alert">
          <InfoCircleOutlined className={s.alertIcon} />
          <span><b>카테고리를 고르지 않은 상품 {uncat}개</b> · 게시하려면 카테고리가 필요해요 <Link to="/admin/products?cat=none">미분류 상품 보기</Link></span>
        </div>
      )}
      <Card title="새 카테고리">
        <div className={s.catForm}>
          <Input className={s.catName} aria-label="새 카테고리 이름" placeholder="이름 (예: 반려동물)" value={n.name} onChange={e => setN(x => ({ ...x, name: e.target.value, err: '' }))} onPressEnter={add} />
          <IconPick value={n.icon} onChange={icon => setN(x => ({ ...x, icon }))} />
          <Button type="primary" onClick={add}>추가</Button>
        </div>
        {n.err && <p className={s.err} role="alert">{n.err}</p>}
      </Card>
      <ListBox total={rows.length}>
        <Table {...tableProps} rowKey="key" columns={columns} dataSource={rows} rowClassName={r => (editing(r) ? 'row-hl' : '')} />
        <p className="a-hint">쓰는 상품이 있는 카테고리는 지울 수 없어요. 이름을 바꾸면 고객 앱과 상품에 바로 반영돼요.</p>
      </ListBox>
    </>
  );
}
