// 판매 조건 (A-02-02): 왼쪽 PLUS 상품 정보(읽기 전용), 오른쪽 ON 판매 조건, 아래 변경 기록 (A-02-02-01)
import { App, Button, Form, Input, InputNumber, Select, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { adminStatus, editable, isFree, ST_KIND, validityTxt } from '@/entities/product';
import { FEE } from '@/shared/config';
import { photo, storeOf, type TermsLog, useDB } from '@/shared/api';
import { dtA, numFmt, numParse, won } from '@/shared/lib';
import { BtnBox, Card, catalogCss as s, DlGroup, PageHead, StatusTag, tableProps } from '@/shared/ui/admin';

const NEW = '__new';

export default function Terms() {
  const { pid = '' } = useParams();
  const db = useDB();
  const nav = useNavigate();
  const { message } = App.useApp();
  const initErr = (useLocation().state as { catErr?: string } | null)?.catErr ?? '';
  const p = db.products.find(x => x.id === pid);
  const [cat, setCat] = useState(p?.cat ?? '');
  const [newCat, setNewCat] = useState('');
  const [catErr, setCatErr] = useState(initErr);
  const [price, setPrice] = useState<number | null>(p?.price ?? 0);
  const [limit, setLimit] = useState<number | null>(p?.limit ?? null);
  const [saveErr, setSaveErr] = useState('');
  if (!p || !editable(db, p)) return <Navigate to="/admin/products" replace />;

  const st = storeOf(db, p.sid), as = adminStatus(db, p), free = isFree(p), v = validityTxt(p);
  const pr = free ? 0 : price ?? 0, lim = limit || 0, fee = Math.round(pr * FEE);
  // ON 가격 조정은 할인만: 점주 판매가 이하, 유료 상품은 0원 불가
  const field: { k: 'p' | 'l'; t: string } | null =
    !free && !pr ? { k: 'p', t: '유료 상품은 0원으로 낮출 수 없어요.' }
      : !free && pr > p.own ? { k: 'p', t: '점주가 정한 판매가보다 높일 수 없어요 (할인만).' }
        : !free && lim && lim < pr ? { k: 'l', t: '한도가 판매가 1장보다 작아요.' } : null;
  const limNote = !lim ? '비워 두면 전체 한도만 적용돼요' : free ? `한 달에 최대 ${lim.toLocaleString()}장 발급` : pr ? `한 달에 최대 ${Math.floor(lim / pr).toLocaleString()}장 발급` : '';

  const save = (andPublish: boolean) => {
    let c = cat;
    if (c === NEW) {
      c = newCat.trim();
      if (!c) { setCatErr('새 카테고리 이름을 적어 주세요'); return; }
    }
    if (andPublish && !c) { setCatErr('게시하려면 카테고리를 골라 주세요'); return; }
    if (field) return;
    const r = db.saveTerms(p.id, { cat: c, price: pr, limit: lim || null }, andPublish);
    if (!r.ok) { setSaveErr(r.error); return; }
    message.success(r.published ? `게시했어요. 고객 지도에 '${st.name}' 쿠폰이 나와요`
      : r.moved ? '저장했어요. 바뀐 가격은 PLUS 내보내기 페이지에 보이고 점주에게 알렸어요' : '판매 조건을 저장했어요. 다음 주문부터 적용돼요');
    nav('/admin/products', { state: { flash: p.id } });
  };

  const catOpts = [...Object.keys(db.cats).map(k => ({ value: k, label: k })), { value: NEW, label: '＋ 새 카테고리 추가' }];
  const histCols: ColumnsType<TermsLog> = [
    { title: '변경일시', render: (_, h) => <span className="num">{dtA(h.at)}</span> },
    { title: '처리자', dataIndex: 'who' },
    { title: '내용', dataIndex: 'text' },
  ];

  return (
    <>
      <PageHead title="판매 조건" id="A-02-02" desc={`${p.name} · ${st.name} · 바꾼 조건은 다음 주문부터 적용돼요. 이미 결제된 주문의 금액은 그대로예요.`} />
      <div className="a-tgrid">
        <Card title={<>PLUS 상품 정보<span className="a-sid">A-02-01-01</span></>}>
          <div className={`a-img ${s.imgGap}`}><img src={photo(p.id)} alt={p.name} decoding="async" /></div>
          <DlGroup rows={[
            ['가게', st.name], ['위치', st.addr],
            ['쿠폰유형', `${p.type} · ${free ? '무료증정용' : '판매용'}`],
            ['소비자가', won(p.list ?? 0)],
            ['점주 판매가', free ? '무료' : won(p.own)],
            ['유효기간', v.main],
            ['사용제한', p.restr || '없음'],
            ['유의사항', p.notes.length ? p.notes.map((n, i) => <span key={i}>{i > 0 && <br />}{n}</span>) : '없음'],
            ['노출 상태', <StatusTag kind={ST_KIND[as.k]}>{as.t}</StatusTag>],
          ]} />
          <p className="a-hint">틀린 정보는 점주가 PLUS에서 고쳐요. ON에서는 바꿀 수 없어요.</p>
        </Card>
        <Card title="ON 판매 조건">
          <Form layout="vertical" component="div" className={s.terms}>
            <Form.Item label="카테고리 · 게시하려면 꼭 골라요" validateStatus={catErr ? 'error' : undefined}
              help={catErr ? <span role="alert">{catErr}</span> : undefined}
              extra="고객 앱의 카테고리 칩과 핀 아이콘에 쓰여요. 아이콘·이름은 카테고리 메뉴에서 바꿔요.">
              <Select aria-label="카테고리" placeholder="카테고리를 골라 주세요" value={cat || undefined} options={catOpts}
                onChange={x => { setCat(x); setCatErr(''); }} />
              {cat === NEW && <Input className={s.newCat} aria-label="새 카테고리 이름" placeholder="새 카테고리 이름" value={newCat} onChange={e => { setNewCat(e.target.value); setCatErr(''); }} />}
            </Form.Item>
            <Form.Item label="점주 판매가" extra="점주가 PLUS ON 내보내기 페이지에서 정하고 판매수수료에 동의한 가격이에요.">
              <div className={`${s.roVal} num`}>{free ? '무료' : won(p.own)}</div>
            </Form.Item>
            <Form.Item label="ON 판매가 · 고객이 내는 금액" validateStatus={field?.k === 'p' ? 'error' : undefined}
              help={field?.k === 'p' ? <span role="alert">{field.t}</span> : undefined}
              extra={free ? '무료 상품은 판매가가 없어요.' : '점주 판매가 이하로만 낮출 수 있어요 (할인만, 0원 불가). 바꾸면 PLUS 내보내기 페이지에 보이고 점주에게 알려요.'}>
              <InputNumber className={s.wide} aria-label="ON 판매가" min={0} value={free ? 0 : price} disabled={free} formatter={numFmt} parser={numParse} suffix="원" onChange={x => { setPrice(x); setSaveErr(''); }} />
            </Form.Item>
            <Form.Item label={`상품별 월 한도 · ${free ? '쿠폰 수량' : '판매가 합계'}`} validateStatus={field?.k === 'l' ? 'error' : undefined}
              help={field?.k === 'l' ? <span role="alert">{field.t}</span> : limNote}>
              <InputNumber className={s.wide} aria-label="상품별 월 한도" min={0} value={limit} formatter={numFmt} parser={numParse} suffix={free ? '장' : '원'} onChange={x => { setLimit(x); setSaveErr(''); }} />
            </Form.Item>
            <div className="a-calc">
              <div><span>할인율 (소비자가 대비)</span><b className="num">{free ? '무료' : p.list ? `${Math.round((1 - pr / p.list) * 100)}%` : '-'}</b></div>
              <div><span>1장당 판매수수료</span><b className="num">{won(fee)}</b></div>
              <div><span>1장당 점주 지급액</span><b className="num">{won(pr - fee)}</b></div>
            </div>
            <p className="a-hint">판매수수료는 고객이 낸 판매가의 {Math.round(FEE * 100)}%예요.</p>
            {saveErr && <p className={s.err} role="alert">{saveErr}</p>}
          </Form>
        </Card>
      </div>
      <Card title={<>변경 기록<span className="a-sid">A-02-02-01</span></>}>
        <Table {...tableProps} rowKey={h => `${h.at}${h.text}`} columns={histCols} dataSource={p.hist} locale={{ emptyText: '변경 기록이 없어요' }} />
      </Card>
      <BtnBox>
        <Button onClick={() => nav('/admin/products')}>목록</Button>
        <Button onClick={() => save(false)}>저장</Button>
        {as.k !== 'pub' && as.k !== 'block' && <Button type="primary" onClick={() => save(true)}>저장하고 게시</Button>}
      </BtnBox>
    </>
  );
}
