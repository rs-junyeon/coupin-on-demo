import { useRef, useState, type FormEvent } from 'react';
import { useBlocker, useNavigate } from 'react-router-dom';
import { type InquiryType } from '@/shared/api';
import { accountCss as s, Sheet, TopBar, useUi } from '@/shared/ui/mobile';
import { createInquiry } from '../model/createInquiry';

const TYPES: InquiryType[] = ['결제·환불', '쿠폰 사용', '매장 정보 오류', '기타'];
const TITLE_MAX = 40;

/** 문의 작성: 쓰던 내용이 있으면 나가기 전에 확인한다 */
export default function InquiryNew() {
  const nav = useNavigate();
  const toast = useUi(st => st.showToast);
  const [type, setType] = useState<InquiryType>(TYPES[0]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const sent = useRef(false);
  const dirty = title.trim() !== '' || body.trim() !== '';
  // 뒤로(머리 버튼·브라우저) 모두 막고 확인 시트를 띄운다. 보낸 뒤에는 막지 않는다
  const blocker = useBlocker(({ currentLocation, nextLocation }) => dirty && !sent.current && currentLocation.pathname !== nextLocation.pathname);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    sent.current = true;
    const id = createInquiry({ type, title: title.trim(), body: body.trim() });
    nav(`/my/inquiries/${id}`, { replace: true });
    toast('문의를 남겼어요. 보통 하루 안에 답해 드려요');
  };
  return (
    <div className="c-page">
      <TopBar title="문의하기" close />
      <form className={`scroll form ${s.formTop}`} onSubmit={submit}>
        <label htmlFor="inq-type">문의 유형
          <select id="inq-type" value={type} onChange={e => setType(e.target.value as InquiryType)}>
            {TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </label>
        <label htmlFor="inq-title">제목
          <input id="inq-title" className={s.input} value={title} maxLength={TITLE_MAX} placeholder="한 줄로 적어 주세요" onChange={e => setTitle(e.target.value)} />
        </label>
        <label htmlFor="inq-body">내용
          <textarea id="inq-body" value={body} placeholder="어떤 점이 불편했는지 알려 주세요" onChange={e => setBody(e.target.value)} />
        </label>
        <p className={s.note}>답변은 마이 → 문의에서 확인할 수 있어요. 보통 하루 안에 답해 드려요.</p>
        <button className="cta primary" type="submit" disabled={!title.trim() || !body.trim()}>문의 남기기</button>
      </form>
      <Sheet open={blocker.state === 'blocked'} onClose={() => blocker.reset?.()} label="작성 취소 확인">
        <h3>작성을 그만둘까요?</h3>
        <p className="sub">지금 나가면 입력한 내용은 저장되지 않아요.</p>
        <button type="button" className="cta primary" onClick={() => blocker.reset?.()}>계속 작성</button>
        <button type="button" className="cta line" onClick={() => blocker.proceed?.()}>나가기</button>
      </Sheet>
    </div>
  );
}
