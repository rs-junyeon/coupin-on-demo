import { useNavigate } from 'react-router-dom';
import { useDB } from '@/shared/api';
import { accountCss as s, BizInfo, TopBar, useUi } from '@/shared/ui/mobile';
import { type DocKey, DOCS } from '@/shared/ui/legal-doc';
import { setMkt } from '../model/setMkt';

const APP_VERSION = '1.0.0';
const REQUIRED: DocKey[] = ['terms', 'privacy', 'location'];

/** 설정·약관: 필수 약관 동의 내역과 전문, 마케팅 정보 받기, 앱 버전 */
export default function Settings() {
  const nav = useNavigate();
  const mkt = useDB(st => st.account.mkt);
  const toast = useUi(st => st.showToast);
  const toggle = () => { setMkt(!mkt); toast(!mkt ? '마케팅 정보 받기를 켰어요' : '마케팅 정보 받기를 껐어요'); };
  return (
    <div className="c-page">
      <TopBar title="설정·약관" />
      <div className="scroll">
        <div className="terms">
          {REQUIRED.map(k => (
            <div className="term" key={k}>
              <div className="r"><b>{DOCS[k].t}</b><span className="st-chip st-ok">필수 · 동의함</span></div>
              <p>{DOCS[k].sec[0][1]}</p>
              <button type="button" className={`lnk ${s.start}`} onClick={() => nav(`/docs/${k}`)}>전문 보기</button>
            </div>
          ))}
          <div className="term">
            <div className="r">
              <b id="mkt-l">마케팅 정보 받기</b>
              <button type="button" className={`tgl ${mkt ? 'on' : ''}`} role="switch" aria-checked={mkt} aria-labelledby="mkt-l" onClick={toggle} />
            </div>
            <p>선택 · 새로 생긴 동네 혜택과 만료 임박 쿠폰 소식을 알림톡으로 받아요.</p>
          </div>
          <button type="button" className={`lnk ${s.start}`} onClick={() => nav('/docs/privacy-policy')}>개인정보처리방침 보기</button>
          <div className={s.version}><b>앱 버전</b><span>{APP_VERSION}</span></div>
        </div>
        <BizInfo />
      </div>
    </div>
  );
}
