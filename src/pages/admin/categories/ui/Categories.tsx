// 카테고리 (A-02-05): 고객 앱 카테고리 칩과 핀 아이콘. 점주가 아니라 ON 운영자가 관리한다
import { InfoCircleOutlined, UploadOutlined } from '@ant-design/icons';
import { App, Button, Input, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CAT_ICONS, CatIcon, CatSwatch, nextCatColor } from '@/entities/category';
import { catShown, visible } from '@/entities/product';
import { type IconName, useDB } from '@/shared/api';
import { toIconImage } from '@/shared/lib';
import { Icon, MaskIcon } from '@/shared/ui/icon';
import { Card, catalogCss as s, ListBox, PageHead, StatusTag, tableProps } from '@/shared/ui/admin';
import { addCat, deleteCat, editCat } from '../model/actions';

const IC_NAME: Record<(typeof CAT_ICONS)[number], string> = {
  cafe: '카페', dessert: '디저트·음료', hair: '헤어', beauty: '뷰티·케어', fit: '운동·스포츠', class: '클래스·교육', experiment: '체험·공방',
  photo: '사진·스튜디오', pet: '건강·반려', shopping: '소품·리빙', dumbbell: '운동(덤벨)', food: '식당', nail: '네일',
};

/** 고른 아이콘: 기본 아이콘(icon) 또는 운영자가 올린 아이콘(img). warn·err는 올릴 때 안내 */
type Pick = { icon: IconName; img: string | null; warn: string; err: string; note?: string };
const OPAQUE_WARN = '배경을 지우지 못해 사각형으로 보여요. 배경이 투명하거나 한 가지 색인 PNG·SVG를 올려 주세요';
const BG_NOTE = '배경을 자동으로 지웠어요. 미리보기에서 모양을 확인해 주세요';

/** 기본 아이콘 10개 중 고르거나 PNG·SVG를 직접 올린다. 오른쪽은 고객 앱에 보일 모습 (카테고리 색 위 흰색) */
function IconPick({ value, onChange, color, idp }: { value: Pick; onChange: (v: Pick) => void; color: string; idp: string }) {
  const file = useRef<HTMLInputElement>(null);
  const upload = async (f: File | undefined) => {
    if (!f) return;
    const r = await toIconImage(f);
    if (!r.ok) { onChange({ ...value, warn: '', err: r.error }); return; }
    onChange({ ...value, img: r.src, warn: r.opaque ? OPAQUE_WARN : '', note: r.bgRemoved && !r.opaque ? BG_NOTE : '', err: '' });
  };
  return (
    <div className={s.icpick} role="group" aria-label="아이콘">
      {CAT_ICONS.map(i => (
        <button key={i} type="button" aria-label={`아이콘 ${IC_NAME[i]}`} aria-pressed={!value.img && value.icon === i}
          onClick={() => onChange({ icon: i, img: null, warn: '', err: '' })}><Icon name={i} size={16} /></button>
      ))}
      <button type="button" className={s.icUpload} aria-pressed={!!value.img} onClick={() => file.current?.click()}>
        {value.img ? <MaskIcon src={value.img} size={16} /> : <UploadOutlined />}{value.img ? '다시 올리기' : '직접 올리기'}
      </button>
      <input ref={file} id={`${idp}-file`} type="file" accept=".png,.svg,image/png,image/svg+xml" className={s.fileInput} aria-label="아이콘 이미지 올리기 (PNG·SVG)"
        onChange={e => { void upload(e.target.files?.[0]); e.target.value = ''; }} />
      <span className={`pmini ${s.icPreview}`}><CatSwatch c={{ color, icon: value.icon, img: value.img ?? undefined }} size={16} />미리보기</span>
    </div>
  );
}
const pickMsg = (v: Pick, extra: string) => (
  <>
    {(extra || v.err) && <p className={s.err} role="alert">{extra || v.err}</p>}
    {!extra && !v.err && v.warn && <p className={s.warn} role="status">{v.warn}</p>}
    {!extra && !v.err && !v.warn && v.note && <p className={s.note} role="status">{v.note}</p>}
  </>
);
const PICK0: Pick = { icon: 'box', img: null, warn: '', err: '' };

type Row = { key: string; live: number; total: number };

export default function Categories() {
  const db = useDB();
  const { message } = App.useApp();
  const [n, setN] = useState({ name: '', pick: PICK0, err: '' });
  const [ed, setEd] = useState<{ key: string; name: string; pick: Pick; err: string } | null>(null);
  const uncat = db.products.filter(p => !p.cat).length;

  const add = () => {
    const r = addCat(n.name, n.pick.icon, n.pick.img);
    if (!r.ok) { setN(x => ({ ...x, err: r.error })); return; }
    message.success(`'${n.name.trim()}' 카테고리를 만들었어요. 이 카테고리로 상품을 게시하면 고객 앱에 칩이 생겨요`);
    setN({ name: '', pick: PICK0, err: '' });
  };
  const saveEdit = () => {
    if (!ed) return;
    const r = editCat(ed.key, ed.name, ed.pick.icon, ed.pick.img);
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
            <IconPick idp="ed" value={ed.pick} color={db.cats[ed.key].color} onChange={pick => setEd({ ...ed, pick, err: '' })} />
          </div>
          {pickMsg(ed.pick, ed.err)}
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
            <Button size="small" aria-label={`${r.key} 수정`} onClick={() => setEd({ key: r.key, name: r.key, pick: { ...PICK0, icon: db.cats[r.key].icon, img: db.cats[r.key].img ?? null }, err: '' })}>수정</Button>
            <Button size="small" danger aria-label={`${r.key} 삭제`} disabled={r.total > 0} title={r.total > 0 ? '쓰는 상품이 있으면 지울 수 없어요' : undefined} onClick={() => del(r.key)}>삭제</Button>
          </>}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHead title="카테고리" id="A-02-05" desc="고객 앱 둘러보기·매장 탭의 카테고리 칩과 핀 아이콘이에요. ON 운영자가 게시 전에 상품마다 하나를 골라요. 게시 중인 상품이 있는 카테고리만 고객 앱에 칩으로 보여요. 아이콘은 기본 아이콘에서 고르거나 PNG·SVG를 직접 올릴 수 있어요 (단색 배경은 자동으로 지우고, 그림의 모양만 흰색으로 보여요)." />
      {uncat > 0 && (
        <div className="a-alert">
          <InfoCircleOutlined className={s.alertIcon} />
          <span><b>카테고리를 고르지 않은 상품 {uncat}개</b> · 게시하려면 카테고리가 필요해요 <Link to="/admin/products?cat=none">미분류 상품 보기</Link></span>
        </div>
      )}
      <Card title="새 카테고리">
        <div className={s.catForm}>
          <Input className={s.catName} aria-label="새 카테고리 이름" placeholder="이름 (예: 반려동물)" value={n.name} onChange={e => setN(x => ({ ...x, name: e.target.value, err: '' }))} onPressEnter={add} />
          <IconPick idp="new" value={n.pick} color={nextCatColor(db.cats)} onChange={pick => setN(x => ({ ...x, pick, err: '' }))} />
          <Button type="primary" onClick={add}>추가</Button>
        </div>
        {pickMsg(n.pick, n.err)}
      </Card>
      <ListBox total={rows.length}>
        <Table {...tableProps} rowKey="key" columns={columns} dataSource={rows} rowClassName={r => (editing(r) ? 'row-hl' : '')} />
        <p className="a-hint">쓰는 상품이 있는 카테고리는 지울 수 없어요. 이름을 바꾸면 고객 앱과 상품에 바로 반영돼요.</p>
      </ListBox>
    </>
  );
}
