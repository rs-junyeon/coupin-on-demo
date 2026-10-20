import { useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useDB } from '@/shared/api';
import { accountCss as s, TopBar, useUi } from '@/shared/ui/mobile';
import { Icon } from '@/shared/ui/icon';
import { isProv, loginWays, SNS } from '@/entities/account';
import { DocBody, type DocKey, DOCS } from '@/shared/ui/legal-doc';
import { fmtPhone, maskId, safeNext } from '@/shared/lib';
import { PhoneVerify } from '@/features/verify-phone';
import { signup, signupCheckPhone, socialJoin } from '@/features/auth';

type AgreeKey = 'age' | 'svc' | 'priv' | 'loc' | 'mkt';
const ROWS: { k: AgreeKey; t: string; req: boolean; doc?: DocKey }[] = [
  { k: 'age', t: '만 14세 이상이에요', req: true },
  { k: 'svc', t: '서비스 이용약관', req: true, doc: 'terms' },
  { k: 'priv', t: '개인정보 수집·이용', req: true, doc: 'privacy' },
  { k: 'loc', t: '위치기반서비스 이용약관', req: true, doc: 'location' },
  { k: 'mkt', t: '마케팅 정보 받기', req: false },
];
const NONE: Record<AgreeKey, boolean> = { age: false, svc: false, priv: false, loc: false, mkt: false };
const PW_OK = (v: string) => v.length >= 8 && /[A-Za-z]/.test(v) && /\d/.test(v);

/**
 * 회원가입: 약관 동의 → 아이디·비밀번호·휴대폰 인증 → 완료.
 * 소셜 가입(?sns=kakao&phone=…)은 같은 번호의 계정이 없을 때 약관 동의만 받고 소셜 계정으로 만든다
 */
export default function Signup() {
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const rawNext = sp.get('next');
  const next = safeNext(rawNext);
  const snsRaw = sp.get('sns'), snsPhone = sp.get('phone') ?? '';
  const prov = isProv(snsRaw) && snsPhone ? snsRaw : null;
  const db = useDB();
  const toast = useUi(st => st.showToast);
  const [wasLogged] = useState(db.account.logged);
  const [step, setStep] = useState<'terms' | 'info' | 'done'>('terms');
  const [doc, setDoc] = useState<DocKey | null>(null);
  const [agree, setAgree] = useState(NONE);
  const [userId, setUserId] = useState('');
  const [pw, setPw] = useState('');
  const [phone, setPhone] = useState('');
  const [verified, setVerified] = useState(false);
  const [dup, setDup] = useState(false);
  const [err, setErr] = useState('');
  const [doneId, setDoneId] = useState('');
  if (wasLogged) return <Navigate to={next} replace />;

  const all = ROWS.every(r => agree[r.k]);
  const req = ROWS.every(r => !r.req || agree[r.k]);
  const q = rawNext ? `?next=${encodeURIComponent(next)}` : '';
  const title = prov ? `${SNS[prov]}로 가입` : '회원가입';
  const finish = () => { nav(next, { replace: true }); if (!rawNext) toast('가입을 환영해요'); };

  if (doc) return (
    <div className="c-page">
      <TopBar title={DOCS[doc].t} onBack={() => setDoc(null)} />
      <div className="scroll"><DocBody k={doc} /></div>
    </div>
  );

  if (step === 'done') return (
    <div className="c-page">
      <TopBar title="회원가입" close onBack={finish} />
      <div className="scroll">
        <div className="done">
          <div className="done-ic"><Icon name="check" size={64} /></div>
          <h2>가입이 끝났어요</h2>
          <p>{prov ? `${SNS[prov]} 계정으로 가입했어요.` : `${doneId} 님, 반가워요.`}<br />이제 쿠폰을 받고 살 수 있어요.</p>
        </div>
      </div>
      <div className="cta-bar"><button type="button" className="cta primary" onClick={finish}>{rawNext ? '하려던 일 계속하기' : '시작하기'}</button></div>
    </div>
  );

  if (step === 'info') {
    const onVerify = () => { setVerified(true); setDup(signupCheckPhone(phone) === 'dup'); };
    const join = () => {
      const id = userId.trim();
      if (!id) { setErr('아이디를 입력해 주세요'); return; }
      if (id === db.account.userId) { setErr('이미 쓰고 있는 아이디예요'); return; }
      if (!PW_OK(pw)) { setErr('비밀번호는 영문과 숫자를 섞어 8자 이상으로 만들어 주세요'); return; }
      signup({ userId: id, phone: fmtPhone(phone), mkt: agree.mkt });
      setDoneId(id); setStep('done');
    };
    const toLogin = () => {
      nav(`/login${q}`, { replace: true });
      toast('기존 계정으로 로그인해 주세요. 카카오·Google로도 같은 계정에 들어갈 수 있어요');
    };
    return (
      <div className="c-page">
        <TopBar title="회원가입" onBack={() => setStep('terms')} />
        <div className="scroll login">
          <span className="stepno">2 / 3</span>
          <h2>정보를 입력하고<br />휴대폰을 인증해 주세요</h2>
          <label className="field" htmlFor="su-id"><span>아이디</span>
            <input id="su-id" value={userId} autoComplete="username" autoCapitalize="off" onChange={e => { setUserId(e.target.value); setErr(''); }} />
          </label>
          <div className="field"><span><label htmlFor="su-pw">비밀번호</label></span>
            <input id="su-pw" type="password" aria-describedby="su-pw-h" value={pw} autoComplete="new-password" onChange={e => { setPw(e.target.value); setErr(''); }} />
            <small id="su-pw-h" className="hint">영문과 숫자를 섞어 8자 이상</small>
          </div>
          <PhoneVerify idp="su" phone={phone} onPhone={v => { setPhone(v); setVerified(false); setDup(false); }} verified={verified} onVerify={onVerify} okText={dup ? null : undefined} />
          {dup && (
            <div className="box" role="alert">
              <b className={s.boxTitle}>이미 가입한 휴대폰 번호예요</b>
              <div className={`rows ${s.boxRows}`}>
                <div><span className="k">아이디</span><b>{db.account.userId ? maskId(db.account.userId) : '없음 (소셜로 가입)'}</b></div>
                <div><span className="k">로그인 방법</span><span>{loginWays(db.account.links)}</span></div>
              </div>
              <p className={s.boxNote}>한 사람은 계정 하나만 쓸 수 있어요. 기존 계정으로 로그인해 주세요.</p>
            </div>
          )}
          {err && <p className={s.err} role="alert">{err}</p>}
        </div>
        <div className="cta-bar">
          {dup
            ? <button type="button" className="cta primary" onClick={toLogin}>로그인하기</button>
            : <button type="button" className="cta primary" disabled={!verified} onClick={join}>가입하기</button>}
        </div>
      </div>
    );
  }

  const snsJoin = () => { if (prov) { socialJoin(prov, fmtPhone(snsPhone), agree.mkt); setStep('done'); } };
  return (
    <div className="c-page">
      <TopBar title={title} />
      <div className="scroll">
        <div className="login">
          {prov ? <p className={`sub ${s.subLead}`}>{fmtPhone(snsPhone)} 번호로 가입한 계정이 없어서 새로 만들어요.</p> : <span className="stepno">1 / 3</span>}
          <h2>약관에 동의해 주세요</h2>
          <label className="agree-all" htmlFor="su-all">
            <input type="checkbox" id="su-all" className="chk" checked={all} onChange={() => setAgree(all ? NONE : { age: true, svc: true, priv: true, loc: true, mkt: true })} />전체 동의
          </label>
          {ROWS.map(r => (
            <div className="su-row" key={r.k}>
              <input type="checkbox" id={`su-${r.k}`} className="chk" checked={agree[r.k]} onChange={() => setAgree(a => ({ ...a, [r.k]: !a[r.k] }))} />
              <label htmlFor={`su-${r.k}`}>{r.req ? '(필수)' : '(선택)'} {r.t}</label>
              {r.doc && <button type="button" className="view" onClick={() => setDoc(r.doc!)} aria-label={`${r.t} 보기`}>보기</button>}
            </div>
          ))}
          <button type="button" className={`lnk ${s.start}`} onClick={() => setDoc('privacy-policy')}>개인정보처리방침 보기</button>
        </div>
      </div>
      <div className="cta-bar">
        {prov
          ? <button type="button" className="cta primary" disabled={!req} onClick={snsJoin}>동의하고 가입하기</button>
          : <button type="button" className="cta primary" disabled={!req} onClick={() => setStep('info')}>다음</button>}
      </div>
    </div>
  );
}
