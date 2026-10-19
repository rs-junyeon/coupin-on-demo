import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ME, useDB } from '@/shared/api';
import { hm, ymdDot } from '@/shared/lib';
import { accountCss as s, NotFound, TopBar } from '@/shared/ui/mobile';
import { inqChip } from '@/entities/inquiry';
import { markInquirySeen } from '../model/markInquirySeen';

/** 문의 상세: 열면 새 답변 표시를 지운다 */
export default function InquiryDetail() {
  const { qid } = useParams();
  const q = useDB(st => st.inquiries.find(x => x.id === qid && x.owner === ME));
  const unseen = !!q?.answer && !q.seen;
  useEffect(() => { if (unseen && qid) markInquirySeen(qid); }, [unseen, qid]);
  if (!q) return <NotFound />;
  return (
    <div className="c-page">
      <TopBar title="문의 상세" />
      <div className="scroll">
        <div className="ck">
          <div className={s.metaRow}>
            <span className="tag">{q.type}</span>
            <span className={`st-chip ${inqChip(q.status)}`}>{q.status}</span>
            <span className={s.metaAt}>{ymdDot(q.at)} {hm(q.at)}</span>
          </div>
          <b className={s.qTitle}>{q.title}</b>
          <div className="qbox">{q.body}</div>
          {q.answer
            ? <div className="abox"><b>쿠핀 ON 답변</b>{q.answer}</div>
            : <div className={`empty ${s.waitBox}`}><b>답변을 기다리고 있어요</b><span>보통 하루 안에 답해 드려요. 답변이 오면 마이 탭과 문의 목록에 표시돼요.</span></div>}
        </div>
      </div>
    </div>
  );
}
