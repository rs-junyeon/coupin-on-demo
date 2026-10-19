import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useDB } from '@/shared/api';
import { BizInfo, TopBar, useUi } from '@/shared/ui/mobile';
import { safeNext } from './accountKit';
import s from './account.module.css';

/** 로그인: 아이디·비밀번호 또는 카카오·Google. 로그인하면 ?next= 화면으로 이어진다 */
export default function Login() {
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const rawNext = sp.get('next');
  const next = safeNext(rawNext);
  const login = useDB(st => st.login);
  const logged = useDB(st => st.account.logged);
  const toast = useUi(st => st.showToast);
  const [wasLogged] = useState(logged);
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  if (wasLogged) return <Navigate to={next} replace />;
  const q = rawNext ? `?next=${encodeURIComponent(next)}` : '';
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const r = login(id, pw);
    if (!r.ok) { setErr(r.error); return; }
    nav(next, { replace: true });
    if (!rawNext) toast('로그인했어요');
  };
  return (
    <div className="c-page">
      <TopBar title="" close />
      <form className="scroll login" onSubmit={submit} noValidate>
        <h2>쿠핀 ON 계정으로<br />로그인해 주세요</h2>
        <p className="sub">{rawNext ? '로그인하면 하려던 일로 바로 이어져요.' : '받은 쿠폰과 주문 내역을 어느 기기에서든 볼 수 있어요.'}</p>
        <label className="field" htmlFor="lid"><span>아이디</span>
          <input id="lid" value={id} autoComplete="username" autoCapitalize="off" onChange={e => { setId(e.target.value); setErr(''); }} />
        </label>
        <label className="field" htmlFor="lpw"><span>비밀번호</span>
          <input id="lpw" type="password" value={pw} autoComplete="current-password" onChange={e => { setPw(e.target.value); setErr(''); }} />
        </label>
        {err && <p className={s.err} role="alert">{err}</p>}
        <button className="cta dark" type="submit">로그인</button>
        <div className="links">
          <button type="button" className="lnk" onClick={() => nav('/find-account')}>아이디·비밀번호 찾기</button>
          <span aria-hidden="true">·</span>
          <button type="button" className="lnk" onClick={() => nav(`/signup${q}`)}>회원가입</button>
        </div>
        <div className="or">또는</div>
        <button type="button" className="sns kakao" onClick={() => nav(`/oauth/kakao${q}`)}><i aria-hidden="true">K</i>카카오로 계속하기</button>
        <button type="button" className="sns google" onClick={() => nav(`/oauth/google${q}`)}><i aria-hidden="true">G</i>Google로 계속하기</button>
        <BizInfo />
      </form>
    </div>
  );
}
