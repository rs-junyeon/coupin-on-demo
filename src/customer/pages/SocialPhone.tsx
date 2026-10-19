import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useDB } from '@/shared/api';
import { TopBar, useUi } from '@/shared/ui/mobile';
import NotFound from './NotFound';
import { isProv, loginWays, SNS } from '@/entities/account';
import { fmtPhone, maskId, maskPhone, safeNext } from '@/shared/lib';
import { PhoneVerify } from '@/features/verify-phone';

/**
 * 소셜 로그인을 처음 쓸 때: 휴대폰 번호를 문자로 확인해 같은 사람의 계정을 찾는다.
 * 같은 번호의 계정이 있으면 연결하고, 없으면 소셜 계정으로 새로 가입한다
 */
export default function SocialPhone() {
  const { prov } = useParams();
  const [sp] = useSearchParams();
  const nav = useNavigate();
  const db = useDB();
  const toast = useUi(st => st.showToast);
  const [phone, setPhone] = useState('');
  const [verified, setVerified] = useState(false);
  const [found, setFound] = useState(false);
  if (!isProv(prov)) return <NotFound />;
  const rawNext = sp.get('next'), next = safeNext(rawNext);
  const name = SNS[prov];

  const goNext = () => {
    if (db.socialPhone(phone) === 'link') { setFound(true); return; }
    const q = new URLSearchParams({ sns: prov, phone: fmtPhone(phone) });
    if (rawNext) q.set('next', next);
    nav(`/signup?${q.toString()}`, { replace: true });
  };
  const linkAndLogin = () => {
    db.socialLink(prov);
    nav(next, { replace: true });
    toast(`${name} 로그인을 연결했어요. 이제 어느 방법으로 로그인해도 같은 계정이에요`);
  };

  if (found) {
    const a = db.account;
    return (
      <div className="c-page">
        <TopBar title={`${name}로 계속하기`} onBack={() => setFound(false)} />
        <div className="scroll">
          <div className="login">
            <h2>이미 가입한 계정이 있어요</h2>
            <p className="sub">같은 휴대폰 번호로 가입한 계정이에요. {name} 로그인을 연결하면 어느 방법으로 로그인해도 같은 쿠폰과 주문 내역을 봐요.</p>
            <div className="box"><div className="rows">
              <div><span className="k">아이디</span><b>{a.userId ? maskId(a.userId) : '없음 (소셜로 가입)'}</b></div>
              <div><span className="k">휴대폰 번호</span><span>{maskPhone(a.phone)}</span></div>
              <div><span className="k">로그인 방법</span><span>{loginWays(a.links)}</span></div>
            </div></div>
          </div>
        </div>
        <div className="cta-bar"><button type="button" className="cta dark" onClick={linkAndLogin}>연결하고 로그인</button></div>
      </div>
    );
  }
  return (
    <div className="c-page">
      <TopBar title={`${name}로 계속하기`} />
      <div className="scroll">
        <div className="login">
          <h2>휴대폰 번호를<br />확인해 주세요</h2>
          <p className="sub">이 번호로 가입한 계정이 있으면 {name} 로그인을 그 계정에 연결해요. 로그인 방법이 달라도 계정은 하나예요.</p>
          <PhoneVerify idp="sn" phone={phone} onPhone={v => { setPhone(v); setVerified(false); }} verified={verified} onVerify={() => setVerified(true)} />
        </div>
      </div>
      <div className="cta-bar"><button type="button" className="cta dark" disabled={!verified} onClick={goNext}>다음</button></div>
    </div>
  );
}
