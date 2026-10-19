// PLUS 상품 상세 (A-02-01-03): [상품정보 | 상품변경 이력] 탭
import { Button, Table, Tabs } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { ReactNode } from 'react';
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { adminStatus, editable, isFree, limTxt, PLUS_KIND, type PlusSnap, plusSnaps, StateCell, validityTxt } from '@/entities/product';
import { storeOf, useDB } from '@/shared/api';
import { dtA, won } from '@/shared/lib';
import { photo } from '@/shared/assets';
import { BtnBox, Card, catalogCss as s, DlGroup, PageHead, StatusTag, tableProps } from '@/shared/ui/admin';

const PlusTag = ({ t }: { t: string }) => <StatusTag kind={PLUS_KIND[t] ?? 'used'}>{t}</StatusTag>;
const lines = (xs: string[]) => (xs.length ? xs.map((x, i) => <span key={i}>{i > 0 && <br />}{x}</span>) : '없음');

export default function PlusProductDetail() {
  const { pid = '' } = useParams();
  const db = useDB();
  const nav = useNavigate();
  const [sp, setSp] = useSearchParams();
  const p = db.products.find(x => x.id === pid);
  if (!p) return <Navigate to="/admin/plus-products" replace />;

  const st = storeOf(db, p.sid), as = adminStatus(db, p), free = isFree(p), v = validityTxt(p);
  const snaps = plusSnaps(p), last = db.syncLog.find(x => x.ok);
  const tab = sp.get('tab') === 'history' ? 'history' : 'info';

  const info = (
    <Card title="상품 상세정보">
      <div className="a-dlist">
        <div className="col">
          <DlGroup title="상품 이미지"><div className="a-img"><img src={photo(p.id)} alt={p.name} decoding="async" /></div></DlGroup>
          <DlGroup title="기본 정보" rows={[
            ['상품명', <b>{p.name}</b>],
            ['상품코드', <span className={s.mono}>{p.code}</span>],
            ['쿠폰유형', `${p.type} · ${free ? '무료증정용' : '판매용'}`],
            ['소비자가', p.list != null ? won(p.list) : '없음'],
            ['점주 판매가', free ? '무료' : <b>{won(p.own)}</b>],
            ['유효기간', v.main],
            ['PLUS 상태', <PlusTag t={snaps[0]?.v.plus ?? '판매 중'} />],
            ['처음 내보낸 일시', snaps.length ? dtA(snaps[snaps.length - 1].at) : '-'],
          ]} />
        </div>
        <div className="col">
          <DlGroup title="상품 상세 정보" rows={[['예약 안내', p.resv || '없음'], ['사용제한', p.restr || '없음'], ['유의사항', lines(p.notes)]]} />
          <DlGroup title="가게 정보" rows={[
            ['가게명', st.name], ['주소', st.addr], ['영업시간', st.hours],
            ['PLUS 구독', st.sub ? <StatusTag kind="ok">구독 중</StatusTag> : <StatusTag kind="cancel">구독 종료</StatusTag>],
          ]} />
          <DlGroup title="ON 노출 정보" rows={[
            ['카테고리', p.cat || <StatusTag kind="warn">미분류</StatusTag>],
            ['ON 판매가', free ? '무료' : won(p.price)],
            ['상품별 한도', p.limit ? limTxt(p, p.limit) : '전체 한도만'],
            ['노출 상태', <StateCell st={as} />],
          ]} />
          <p className="a-hint">PLUS 정보는 점주가 PLUS에서 고쳐요. ON 노출 정보는 상품 관리에서 바꿔요.</p>
        </div>
      </div>
    </Card>
  );

  type K = keyof PlusSnap['v'];
  const chg = (key: K) => (r: PlusSnap) => ({ className: r.chg.includes(key) ? 'cell-chg' : '' });
  const clip = (t: string) => <span className="clip" title={t}>{t}</span>;
  const col = (title: string, key: K, render: (r: PlusSnap) => ReactNode = r => r.v[key], right = false): ColumnsType<PlusSnap>[number] =>
    ({ title, key, align: right ? 'right' : undefined, onCell: chg(key), render: (_, r) => render(r) });
  const histCols: ColumnsType<PlusSnap> = [
    { title: 'No', dataIndex: 'no' },
    { title: '변경일시', render: (_, r) => <span className="num">{dtA(r.at)}</span> },
    { title: '변경 주체', dataIndex: 'by' },
    col('상품명', 'name'),
    col('점주 판매가', 'own', undefined, true),
    col('소비자가', 'list', undefined, true),
    col('유효기간', 'val'),
    col('사용제한', 'restr', r => clip(r.v.restr)),
    col('유의사항', 'notes', r => clip(r.v.notes)),
    col('PLUS 상태', 'plus', r => <PlusTag t={r.v.plus} />),
    { title: 'ON 영향', render: (_, r) => (r.on.length ? clip(r.on.join(' · ')) : '-') },
  ];
  const history = (
    <Card title="상품변경 이력">
      <div className="a-lhead"><h4>전체 {snaps.length}건</h4></div>
      <Table {...tableProps} rowKey="no" columns={histCols} dataSource={snaps} locale={{ emptyText: '변경 이력이 없어요' }} />
      <p className="a-hint">
        동기화 때마다 PLUS 값을 저장해 시점별로 쌓아요{last && ` (마지막 동기화 ${dtA(last.at)})`}. 바로 앞 줄과 달라진 칸은 연두색으로 보여요.
        ON 운영자가 바꾼 판매 조건(카테고리·ON 판매가·한도)은 상품 관리의 판매 조건 변경 기록에 남아요.
      </p>
    </Card>
  );

  return (
    <>
      <PageHead title={p.name} id="A-02-01-03" desc={`${st.name} · 점주가 PLUS ON 내보내기 페이지에서 내보낸 상품이에요.`} />
      <div className="a-tabbox">
        <Tabs activeKey={tab} onChange={k => setSp(k === 'history' ? { tab: 'history' } : {}, { replace: true })}
          items={[{ key: 'info', label: '상품정보' }, { key: 'history', label: <>상품변경 이력 <small>{snaps.length}</small></> }]} />
      </div>
      {tab === 'info' ? info : history}
      <BtnBox>
        <Button onClick={() => nav('/admin/plus-products')}>목록</Button>
        <Button type="primary" onClick={() => nav(editable(db, p) ? `/admin/products/${p.id}/terms` : '/admin/products')}>상품 관리에서 보기</Button>
      </BtnBox>
    </>
  );
}
