// 판매 현황 (A-01): 운영 알림, KPI, 발급 한도, 일별 발급, 월별 통계, 최근 발급
import { ExclamationCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { App, Button, Form, InputNumber, Modal, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cStatus } from '@/entities/coupon';
import { FEE } from '@/shared/config';
import { isFree } from '@/entities/product';
import { type Coupon, ME, prodOf, storeOf, useDB } from '@/shared/api';
import { opsAlerts } from '../model/opsAlerts';
import { stats } from '@/entities/settlement';
import { who } from '@/entities/account';
import { dtA, monthLabel, numFmt, numParse, today, won } from '@/shared/lib';
import { Card, catalogCss as s, DlGroup, ListBox, PageHead, StatusTag, tableProps } from '@/shared/ui/admin';

function Meter({ label, used, total, big, unit }: { label: string; used: number; total: number; big?: boolean; unit?: string }) {
  const f = (v: number) => (unit ? `${v.toLocaleString()}${unit}` : won(v));
  const r = total ? Math.min(1, used / total) : 1;
  const cls = r >= 1 ? 'full' : r >= 0.8 ? 'warn' : '';
  return (
    <div className="a-meter">
      <div className="mh">
        <b>{label}</b>
        <span className="num">
          {f(used)} / {f(total)} · 잔여 {f(Math.max(0, total - used))}
          {r >= 1 ? <StatusTag kind="cancel">소진 · 판매 막힘</StatusTag> : r >= 0.8 ? <StatusTag kind="warn">80% 넘음</StatusTag> : null}
        </span>
      </div>
      <div className={`a-track ${big ? 'big' : ''} ${cls}`}><i style={{ width: `${(r * 100).toFixed(1)}%` }} /></div>
    </div>
  );
}

/** 이번 달 일별 발급 막대 그래프. 오늘 막대는 민트색 */
function DailyChart({ data, month }: { data: number[]; month: number }) {
  const W = 460, H = 180, L = 26, B = 22, T = 16;
  const top = Math.max(...data), max = Math.max(25, Math.ceil(top / 5) * 5);
  const bw = (W - L - 4) / data.length, y = (v: number) => T + (H - T - B) * (1 - v / max);
  const ticks = Array.from({ length: Math.floor(max / 10) + 1 }, (_, i) => i * 10);
  const last = data.length - 1, peak = data.indexOf(top);
  return (
    <svg className="a-chart" viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`${month}월 일별 발급 건수 막대 그래프`}>
      {ticks.map(v => (
        <g key={v}><line className={s.grid} x1={L} x2={W} y1={y(v)} y2={y(v)} /><text x={L - 6} y={y(v) + 3.5} textAnchor="end">{v}</text></g>
      ))}
      {data.map((v, i) => {
        const x = L + 4 + i * bw, w = bw - 2, tp = y(v), base = y(0), r = Math.min(4, (base - tp) / 2);
        return (
          <g key={i} className={s.barG}>
            <title>{`${month}월 ${i + 1}일 · ${v}건 발급`}</title>
            <rect className={s.hit} x={x - 1} y={T} width={bw} height={H - T - B} />
            {v > 0 && <path className={i === last ? s.barToday : s.bar} d={`M${x} ${base} V${tp + r} Q${x} ${tp} ${x + r} ${tp} H${x + w - r} Q${x + w} ${tp} ${x + w} ${tp + r} V${base} Z`} />}
            {(i === peak || i === last) && <text className="lbl-v" x={x + w / 2} y={tp - 5} textAnchor="middle">{v}</text>}
            {i % 2 === 0 && <text x={x + w / 2} y={H - 6} textAnchor="middle">{i + 1}일</text>}
          </g>
        );
      })}
    </svg>
  );
}

const Alert = ({ danger, title, children }: { danger?: boolean; title: string; children: ReactNode }) => (
  <div className={`a-alert ${danger ? s.danger : ''}`}>
    {danger ? <ExclamationCircleOutlined className={s.alertIcon} /> : <InfoCircleOutlined className={s.alertIcon} />}
    <span><b>{title}</b> · {children}</span>
  </div>
);

export default function Dashboard() {
  const db = useDB();
  const { message } = App.useApp();
  const [limitOpen, setLimitOpen] = useState(false);
  const [lim, setLim] = useState({ total: 0, ftotal: 0 });

  const t = today(), y = t.getFullYear(), m = t.getMonth() + 1, d = t.getDate();
  const st = stats(db), al = opsAlerts(db);
  const live = db.coupons.filter(c => c.live && c.status !== 'CANCELLED').length;
  const daily = db.daily.map((v, i) => (i === db.daily.length - 1 ? v + live : v));
  const recent = db.coupons.filter(c => c.owner !== ME || c.live).sort((a, b) => +new Date(b.issuedAt) - +new Date(a.issuedAt)).slice(0, 6);
  const months: { key: string; label: string; n: number; gmv: number }[] = [
    ...[[3, 128, 1684000], [2, 152, 1980500], [1, 170, 1644700]].map(([k, n, gmv]) => ({ key: `m${k}`, label: monthLabel(new Date(y, m - 1 - k, 1)), n, gmv })),
    { key: 'm0', label: `${monthLabel(t)} (${d}일까지)`, n: st.issued, gmv: st.gmv },
  ];

  const must = [
    ...al.stuck.map(o => <Alert key={o.id} danger title="결제 취소 실패"><span className={s.mono}>{o.id}</span>{o.note && ` · ${o.note}`} <Link to={`/admin/orders/${o.id}`}>주문 보기</Link></Alert>),
    ...al.unconfirmed.map(o => <Alert key={o.id} danger title="결과 미확인 주문"><span className={s.mono}>{o.id}</span>{o.note && ` · ${o.note}`} <Link to={`/admin/orders/${o.id}`}>주문 보기</Link></Alert>),
  ];
  const should = [
    ...(al.near.length ? [<Alert key="near" title="한도 80% 넘음">{al.near.map(p => p.name).join(', ')}</Alert>] : []),
    ...al.syncFails.map(x => <Alert key={x.at} title="상품 동기화 실패">{dtA(x.at)} · {x.err} <Link to="/admin/sync">PLUS 동기화 보기</Link></Alert>),
  ];
  const none = <p className={s.none}>지금 확인할 알림이 없어요.</p>;

  const openLimit = () => { setLim({ total: db.limit.total, ftotal: db.limit.ftotal }); setLimitOpen(true); };
  const saveLimit = () => {
    if (!lim.total || !lim.ftotal) { message.error('한도를 입력해 주세요'); return; }
    db.setLimit(lim.total, lim.ftotal);
    setLimitOpen(false);
    message.success(`${m}월 전체 한도를 바꿨어요`);
  };

  const monthCols: ColumnsType<(typeof months)[number]> = [
    { title: '월', dataIndex: 'label' },
    { title: '발급', align: 'right', render: (_, r) => `${r.n.toLocaleString()}장` },
    { title: '판매액', align: 'right', render: (_, r) => won(r.gmv) },
    { title: '판매수수료 수익', align: 'right', render: (_, r) => won(Math.round(r.gmv * FEE)) },
  ];
  const recentCols: ColumnsType<Coupon> = [
    { title: '발급 일시', render: (_, c) => <span className="num">{dtA(c.issuedAt)}</span> },
    { title: '상품', render: (_, c) => { const p = prodOf(db, c.pid); return <>{p.name}<span className="sub">{storeOf(db, p.sid).name}</span></>; } },
    { title: '고객', render: (_, c) => who(c.owner) },
    { title: '결제', align: 'right', render: (_, c) => (c.paid ? won(c.paid) : '무료') },
    { title: '상태', render: (_, c) => { const x = cStatus(c); return <StatusTag kind={x.k}>{x.t}</StatusTag>; } },
  ];

  return (
    <>
      <PageHead title="판매 현황" id="A-01" desc={`${y}년 ${m}월 1일 ~ ${d}일 · ON 주문·발급 기록 기준`} />
      <Card title={<>운영 알림<span className="a-sid">A-00-03</span><span className={s.cardSub}>메일이나 메신저로도 보내요</span></>}>
        <div className={s.alertGroups}>
          <div className={s.alerts}>{must.length ? must : none}</div>
          <DlGroup title="추가 알림"><div className={s.alerts}>{should.length ? should : none}</div></DlGroup>
        </div>
      </Card>
      <div className="a-kpis">
        <div className="a-kpi"><span className="k">발급 쿠폰</span><span className="v num">{st.issued.toLocaleString()}장</span><span className="d up">지난달 같은 기간보다 18% 늘었어요</span></div>
        <div className="a-kpi"><span className="k">판매액 (고객 결제 합계)</span><span className="v num">{won(st.gmv)}</span><span className="d">유료 쿠폰 기준</span></div>
        <div className="a-kpi"><span className="k">판매수수료 수익</span><span className="v num">{won(st.fee)}</span><span className="d">판매가의 {Math.round(FEE * 100)}% · 무료 쿠폰은 0원</span></div>
        <div className="a-kpi"><span className="k">한도 잔여 ({m}월 전체)</span><span className="v num">{won(Math.max(0, db.limit.total - db.limit.used))}</span><span className="d">{won(db.limit.total)} 중 {won(db.limit.used)} 사용 · 무료 {Math.max(0, db.limit.ftotal - db.limit.fused).toLocaleString()}장 남음</span></div>
      </div>
      <div className="a-grid2">
        <Card title={<>발급 한도<span className="a-sid">A-02-04</span><span className={s.cardSub}>유료는 판매가 합계, 무료는 쿠폰 수량 기준</span></>} extra={<Button onClick={openLimit}>한도 수정</Button>}>
          <Meter label={`${m}월 전체 · 유료 판매가 합계`} used={db.limit.used} total={db.limit.total} big />
          <Meter label={`${m}월 전체 · 무료 쿠폰`} used={db.limit.fused} total={db.limit.ftotal} big unit="장" />
          {db.products.filter(p => p.limit).map(p => <Meter key={p.id} label={p.name} used={p.limitUsed} total={p.limit!} unit={isFree(p) ? '장' : undefined} />)}
        </Card>
        <Card title={<>일별 발급 건수<span className={s.cardSub}>{m}월</span></>}>
          <DailyChart data={daily} month={m} />
          <p className="a-hint">막대에 마우스를 올리면 그날 발급 건수가 보여요. 오늘({d}일)은 민트색이에요.</p>
        </Card>
      </div>
      <ListBox title="월별 통계">
        <Table {...tableProps} rowKey="key" columns={monthCols} dataSource={months} pagination={false} />
      </ListBox>
      <ListBox title="최근 발급">
        <Table {...tableProps} rowKey="id" columns={recentCols} dataSource={recent} pagination={false} rowClassName={c => (c.live ? 'row-hl' : '')} />
      </ListBox>

      <Modal title={`${m}월 전체 발급 한도`} open={limitOpen} onCancel={() => setLimitOpen(false)} onOk={saveLimit} okText="저장" cancelText="닫기" destroyOnHidden>
        <p>유료는 판매가 합계, 무료는 쿠폰 수량 기준이에요. 한도에 닿으면 그 종류의 받기·구매가 모두 막혀요.</p>
        <Form layout="vertical" component="div">
          <Form.Item label="유료 · 판매가 합계" extra={`지금까지 ${won(db.limit.used)} 사용`}>
            <InputNumber className={s.wide} aria-label="유료 한도" min={0} step={100000} value={lim.total} formatter={numFmt} parser={numParse} suffix="원" onChange={v => setLim(x => ({ ...x, total: Number(v) || 0 }))} />
          </Form.Item>
          <Form.Item label="무료 · 쿠폰 수량" extra={`지금까지 ${db.limit.fused.toLocaleString()}장 발급`}>
            <InputNumber className={s.wide} aria-label="무료 한도" min={0} value={lim.ftotal} formatter={numFmt} parser={numParse} suffix="장" onChange={v => setLim(x => ({ ...x, ftotal: Number(v) || 0 }))} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
