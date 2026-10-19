// 문의 (A-05-01)와 문의 상세·답변 (A-05-01-01): 왼쪽 목록, 오른쪽 상세. 고른 문의는 ?id=
import { InfoCircleOutlined, ProfileOutlined, SendOutlined } from '@ant-design/icons';
import { App, Button, Input, Select, Tag } from 'antd';
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { oStatus } from '@/entities/order';
import { type Inquiry, type InquiryStatus, type InquiryType, prodOf, useDB } from '@/shared/api';
import { who } from '@/entities/account';
import { dtA } from '@/shared/lib';
import { PageHead, SearchBox, SearchField, StatusTag, type TagKind } from '@/shared/ui/admin';
import s from './orders.module.css';

const TYPES: InquiryType[] = ['결제·환불', '쿠폰 사용', '매장 정보 오류', '기타'];
const STS: InquiryStatus[] = ['접수', '처리 중', '답변 완료'];
const stTag = (st: InquiryStatus): TagKind => (st === '답변 완료' ? 'ok' : st === '처리 중' ? 'part' : 'warn');
/** 유형별 답변 기본 문구 */
const draftOf = (t: InquiryType) =>
  t === '결제·환불' ? '안녕하세요, 쿠핀 ON입니다. 카드사 응답이 늦어 결제 취소가 지연됐어요. 오늘 다시 처리했고, 카드사에 따라 3~5영업일 안에 취소돼요.'
    : t === '매장 정보 오류' ? '알려 주셔서 고마워요. 점주에게 위치 수정을 요청했어요. 고쳐지면 지도에 바로 반영돼요.'
      : '안녕하세요, 쿠핀 ON입니다. ';

export default function Inquiries() {
  const db = useDB();
  const [sp, setSp] = useSearchParams();
  const [type, setType] = useState<'all' | InquiryType>('all');
  const [st, setSt] = useState<'all' | InquiryStatus>('all');
  const list = db.inquiries.filter(x => (type === 'all' || x.type === type) && (st === 'all' || x.status === st));
  const q = list.find(x => x.id === sp.get('id')) ?? list[0] ?? null;

  return (
    <>
      <PageHead title="문의" id="A-05-01" desc="고객이 마이 탭에서 남긴 문의예요." />
      <SearchBox onReset={() => { setType('all'); setSt('all'); }}>
        <SearchField label="문의 유형">
          <Select variant="borderless" aria-label="문의 유형" value={type} onChange={setType} options={[{ value: 'all', label: '전체' }, ...TYPES.map(t => ({ value: t, label: t }))]} />
        </SearchField>
        <SearchField label="처리 상태">
          <Select variant="borderless" aria-label="처리 상태" value={st} onChange={setSt} options={[{ value: 'all', label: '전체' }, ...STS.map(t => ({ value: t, label: t }))]} />
        </SearchField>
      </SearchBox>
      <div className="a-box-title"><h3>목록</h3></div>
      <div className={s.inq}>
        <div className={s.inqList}>
          {list.length ? list.map(x => (
            <button key={x.id} type="button" className={`${s.inqItem} ${x.id === q?.id ? s.on : ''}`} aria-current={x.id === q?.id} onClick={() => setSp({ id: x.id })}>
              <span className={s.r}><span>{x.type}</span><StatusTag kind={stTag(x.status)}>{x.status}</StatusTag></span>
              <b>{x.title}</b>
              <span className={s.r}><span>{who(x.owner)}</span><span>{dtA(x.at)}</span></span>
            </button>
          )) : <p className={s.inqEmpty}>조건에 맞는 문의가 없어요</p>}
        </div>
        {q && <Detail key={q.id} q={q} />}
      </div>
    </>
  );
}

function Detail({ q }: { q: Inquiry }) {
  const db = useDB();
  const { message } = App.useApp();
  const [text, setText] = useState(() => draftOf(q.type));
  const os = db.orders.filter(o => o.owner === q.owner).slice(0, 3);
  const send = () => { db.replyInquiry(q.id, text.trim()); message.success('답변을 보냈어요. 고객 앱 마이 탭과 문의 목록에 새 답변 표시가 생겨요'); };

  return (
    <section className={s.inqD} aria-label="문의 상세">
      <div className={s.inqHead}>
        <Tag>{q.type}</Tag>
        <Select aria-label="처리 상태 바꾸기" value={q.status} options={STS.map(t => ({ value: t, label: t }))}
          onChange={v => { db.setInquiryStatus(q.id, v); message.success(`문의 상태를 '${v}'(으)로 바꿨어요`); }} />
        <span className={s.meta}>{who(q.owner)} · {dtA(q.at)}</span>
      </div>
      <h3 className={s.inqTitle}>{q.title}<span className="a-sid">A-05-01-01</span></h3>
      <div className={s.q}>{q.body}</div>
      <div className={s.ro}>
        <span className={s.rh}><ProfileOutlined /> 이 고객의 주문</span>
        {os.length
          ? os.map(o => <Link key={o.id} to={`/admin/orders/${o.id}`}><span className={s.mono}>{o.id}</span> · {prodOf(db, o.pid).name} · {oStatus(o)}</Link>)
          : <p>주문이 없어요 (무료 쿠폰만 받았거나 주문 전이에요)</p>}
      </div>
      {q.answer ? (
        <div className={s.a}><b>보낸 답변</b>{q.answer}</div>
      ) : (
        <>
          {q.type === '매장 정보 오류' && (
            <>
              <div className="a-alert"><InfoCircleOutlined /><span>가게 정보는 점주가 PLUS에서 고쳐요. 점주에게 수정 요청을 보내고 고객에게 안내해 주세요.</span></div>
              <div>
                <Button disabled={q.forwarded} onClick={() => { db.forwardInquiry(q.id); message.success('점주에게 수정 요청을 보냈어요'); }}>
                  {q.forwarded ? '점주에게 요청 보냄' : '점주에게 수정 요청 보내기'}
                </Button>
              </div>
            </>
          )}
          <label htmlFor="reply" className={s.lbl}>답변</label>
          <Input.TextArea id="reply" rows={4} value={text} onChange={e => setText(e.target.value)} />
          <div className={s.send}><Button type="primary" icon={<SendOutlined />} disabled={!text.trim()} onClick={send}>답변 보내기</Button></div>
        </>
      )}
    </section>
  );
}
