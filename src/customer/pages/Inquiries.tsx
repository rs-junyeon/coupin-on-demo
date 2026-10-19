import { useNavigate } from 'react-router-dom';
import { ME } from '../../domain/rules';
import { hm, ymdDot } from '../../domain/time';
import { useDB } from '../../store/db';
import { Icon } from '../../ui/Icon';
import { TopBar } from '../components/TopBar';
import { inqChip } from './accountKit';
import s from './account.module.css';

/** 내 문의 목록. 새 답변은 점으로 표시한다 */
export default function Inquiries() {
  const nav = useNavigate();
  const mine = useDB(st => st.inquiries).filter(q => q.owner === ME);
  return (
    <div className="c-page">
      <TopBar title="문의" />
      <div className="scroll">
        <div className="olist">
          {mine.length ? mine.map(q => (
            <button type="button" key={q.id} className="oc btn" onClick={() => nav(`/my/inquiries/${q.id}`)}>
              <div className="r"><span className="tag">{q.type}</span><span className={`st-chip ${inqChip(q.status)}`}>{q.status}</span></div>
              <b>{q.answer && !q.seen && <i className={`ndot ${s.ndotGap}`} role="img" aria-label="새 답변" />}{q.title}</b>
              <span className="s">{ymdDot(q.at)} {hm(q.at)}</span>
            </button>
          )) : (
            <div className="empty"><Icon name="chat" size={36} stroke={1.6} /><b>남긴 문의가 없어요</b><span>궁금한 점을 남기면 보통 하루 안에 답해 드려요.</span></div>
          )}
        </div>
      </div>
      <div className="cta-bar">
        <button type="button" className="cta dark" onClick={() => nav('/my/inquiries/new')}><Icon name="chat" size={18} />문의하기</button>
      </div>
    </div>
  );
}
