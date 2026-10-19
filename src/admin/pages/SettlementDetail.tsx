// 정산 상세 (A-04-01-01): ON 주문·발급·취소 기록으로 만든 내역을 PLUS 발급 기록과 맞춰 본다. 지난달만 상세가 있다
import { CheckOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import { App, Button, Radio, Table, type TableColumnsType } from 'antd';
import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { FEE, prodOf, settleCalc, settleMonths, settleRows, settleTot, storeOf, type SettleRow } from '../../domain/rules';
import { md, p2, won } from '../../domain/time';
import { useDB } from '../../store/db';
import { BtnBox, ListBox, PageHead, StatusTag, tableProps } from '../components/ui';
import s from './orders.module.css';

type View = 'store' | 'product';
type Line = { key: string; label: string; sub: string; n: number; cx: number; gross: number; ded: number; fee: number; pay: number; plusN: number | null };

/** CSV 한 칸: 쉼표·따옴표·줄바꿈이 있으면 따옴표로 감싼다 */
const cell = (v: string | number) => { const t = String(v); return /[",\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t; };

function downloadCsv(name: string, rows: (string | number)[][]) {
  // 엑셀에서 한글이 깨지지 않게 BOM을 붙인다
  const blob = new Blob(['﻿' + rows.map(r => r.map(cell).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

export default function SettlementDetail() {
  const { month } = useParams();
  const db = useDB();
  const nav = useNavigate();
  const { message } = App.useApp();
  const [view, setView] = useState<View>('store');
  const [open, setOpen] = useState(false);
  const last = settleMonths(db)[1];
  if (month !== last.key) return <Navigate to="/admin/settlements" replace />;

  const [y, m] = last.key.split('-').map(Number);
  const pr = settleRows(db), tot = settleTot(pr), diff = !db.settle.checked, done = db.settle.done;
  const missRow = pr.find(r => r.plusN);
  const lines: Line[] = view === 'store'
    ? db.stores.filter(st => pr.some(r => r.sid === st.id)).map(st => {
        const rs = pr.filter(r => r.sid === st.id), t = settleTot(rs), bad = rs.find(r => r.plusN);
        return { key: st.id, label: st.name, sub: '', n: t.n, cx: t.cx, gross: t.gross, ded: t.ded, fee: t.fee, pay: t.pay, plusN: bad ? t.n - bad.n + bad.plusN! : null };
      })
    : pr.map((r: SettleRow) => { const c = settleCalc(r); return { key: r.pid, label: prodOf(db, r.pid).name, sub: storeOf(db, r.sid).name, n: r.n, cx: r.cx, gross: r.gross, ded: r.ded, fee: c.fee, pay: c.pay, plusN: r.plusN }; });

  const check = () => { db.settleCheck(); setOpen(false); message.success('차이 1건을 반영했어요. 이제 PLUS 정산과 일치해요'); };
  const csv = () => {
    const head = [view === 'store' ? '가게' : '상품', ...(view === 'product' ? ['가게'] : []), '발급', '취소', '판매가 합계', '취소·환불 차감', '판매수수료', '점주 지급액', 'PLUS 대조'];
    const body = lines.map(l => [l.label, ...(view === 'product' ? [l.sub] : []), l.n, l.cx, l.gross, -l.ded, l.fee, l.pay, l.plusN != null ? `PLUS ${l.plusN}장` : '일치']);
    const sum = ['합계', ...(view === 'product' ? [''] : []), tot.n, tot.cx, tot.gross, -tot.ded, tot.fee, tot.pay, diff ? '차이 있음' : '일치'];
    downloadCsv(`정산_${last.key}_${view === 'store' ? '가게별' : '상품별'}.csv`, [head, ...body, sum]);
    message.success('CSV 파일을 내려받았어요');
  };

  // PLUS에만 있는 발급 1건: 지난달 21일 발급 응답이 끊긴 주문
  const missAt = new Date(y, m - 1, 21);
  const missP = missRow ? prodOf(db, missRow.pid) : null;
  const miss = missRow && missP && (
    <div className={s.miss}>
      <span><b>PLUS에만 있는 발급 1건</b> · 주문번호 <span className={s.mono}>ON-{y}{p2(m)}21-0113</span> · {missP.name} · 판매가 {won(missRow.gross / missRow.n)}</span>
      <span>{md(missAt)} 발급 응답이 끊겨 결과를 확인하던 주문이에요. 다음 날 주문번호로 조회해 쿠폰을 복구했지만 ON 정산 집계에서 빠졌어요.</span>
      <Button type="primary" size="small" onClick={check}>ON 기록에 반영하고 확인 완료</Button>
    </div>
  );

  const columns: TableColumnsType<Line> = [
    { title: view === 'store' ? '가게' : '상품 · 가게', key: 'label', render: (_, l) => <>{l.label}{l.sub && <span className="sub">{l.sub}</span>}</> },
    { title: '발급', dataIndex: 'n', align: 'right' },
    { title: '취소', dataIndex: 'cx', align: 'right' },
    { title: '판매가 합계', dataIndex: 'gross', align: 'right', render: (v: number) => won(v) },
    { title: '취소·환불 차감', dataIndex: 'ded', align: 'right', render: (v: number) => (v ? `-${won(v)}` : '0원') },
    { title: '판매수수료', dataIndex: 'fee', align: 'right', render: (v: number) => won(v) },
    { title: '점주 지급액', dataIndex: 'pay', align: 'right', render: (v: number) => won(v) },
    {
      title: 'PLUS 대조', key: 'plus', render: (_, l) => (l.plusN != null && diff
        ? <Button size="small" aria-expanded={open} onClick={() => setOpen(!open)}>ON {l.n}장 · PLUS {l.plusN}장 {open ? <UpOutlined /> : <DownOutlined />}</Button>
        : <StatusTag kind="ok"><CheckOutlined /> 일치</StatusTag>),
    },
  ];

  return (
    <>
      <PageHead title={`정산 상세 · ${last.label}`} id="A-04-01-01" desc="ON 주문·발급·취소 기록으로 만든 내역을 PLUS 발급 기록과 맞춰 봐요. 무료 쿠폰은 수수료와 지급액이 0원이에요." />
      <div className="a-kpis">
        <div className="a-kpi"><span className="k">발급</span><span className="v">{tot.n}장</span><span className="d">취소·환불 {tot.cx}장 포함</span></div>
        <div className="a-kpi"><span className="k">판매가 합계</span><span className="v">{won(tot.gross)}</span><span className="d">취소·환불 차감 -{won(tot.ded)}</span></div>
        <div className="a-kpi"><span className="k">판매수수료</span><span className="v">{won(tot.fee)}</span><span className="d">취소·환불분을 뺀 판매가의 {Math.round(FEE * 100)}%</span></div>
        <div className="a-kpi"><span className="k">점주 지급액</span><span className="v">{won(tot.pay)}</span>
          <span className={`d ${s.kpiTag}`}>{done ? <StatusTag kind="ok">확정됨</StatusTag> : diff ? <StatusTag kind="warn">PLUS와 차이 1건</StatusTag> : <StatusTag kind="ok">PLUS와 일치</StatusTag>}</span></div>
      </div>
      <ListBox total={lines.length} extra={
        <Radio.Group optionType="button" aria-label="보기" value={view} onChange={e => { setView(e.target.value as View); setOpen(false); }}
          options={[{ value: 'store', label: '가게별' }, { value: 'product', label: '상품별' }]} />
      }>
        <Table<Line> {...tableProps} rowKey="key" columns={columns} dataSource={lines}
          rowClassName={l => (l.plusN != null && diff ? 'row-warn' : '')}
          expandable={{
            showExpandColumn: false,
            expandedRowKeys: open && diff ? lines.filter(l => l.plusN != null).map(l => l.key) : [],
            rowExpandable: l => l.plusN != null && diff,
            expandedRowRender: () => miss,
          }} />
      </ListBox>
      <BtnBox>
        <Button onClick={() => nav('/admin/settlements')}>목록</Button>
        <Button onClick={csv}>CSV 내려받기</Button>
        <Button type="primary" disabled={diff || done} onClick={() => { db.settleConfirm(); message.success(`${m}월 정산을 확정했어요`); }}>{done ? `${m}월 정산 확정됨` : `${m}월 정산 확정`}</Button>
      </BtnBox>
      {diff && !done && <p className={s.why}>PLUS와 차이가 나는 건을 확인해야 확정할 수 있어요.</p>}
    </>
  );
}
