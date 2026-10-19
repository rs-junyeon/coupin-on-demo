import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { digits } from '@/domain/rules';
import { useDB } from '@/shared/api';
import { TopBar, useUi } from '@/shared/ui/mobile';
import { loginWays, maskId, PhoneVerify } from './accountKit';
import s from './account.module.css';

type Tab = 'id' | 'pw';
const PW_OK = (v: string) => v.length >= 8 && /[A-Za-z]/.test(v) && /\d/.test(v);

/** 계정 찾기: 가입할 때 인증한 휴대폰 번호로 아이디를 찾거나 비밀번호를 다시 정한다 */
export default function FindAccount() {
  const nav = useNavigate();
  const account = useDB(st => st.account);
  const toast = useUi(st => st.showToast);
  const [tab, setTab] = useState<Tab>('id');
  const [userId, setUserId] = useState('');
  const [phone, setPhone] = useState('');
  const [verified, setVerified] = useState(false);
  const [newPw, setNewPw] = useState('');
  const [err, setErr] = useState('');
  const switchTab = (t: Tab) => { setTab(t); setPhone(''); setUserId(''); setVerified(false); setNewPw(''); setErr(''); };
  const samePhone = digits(phone) === digits(account.phone);
  // 아이디 찾기는 번호만, 비밀번호 재설정은 아이디와 번호가 같은 계정이어야 한다
  const found = verified && samePhone && (tab === 'id' || (account.links.pw && userId.trim() === account.userId));
  const toLogin = () => { nav('/login', { replace: true }); toast('찾은 아이디로 로그인해 주세요'); };
  const savePw = () => {
    if (!PW_OK(newPw)) { setErr('비밀번호는 영문과 숫자를 섞어 8자 이상으로 만들어 주세요'); return; }
    nav('/login', { replace: true });
    toast('비밀번호를 바꿨어요. 새 비밀번호로 로그인해 주세요');
  };
  return (
    <div className="c-page">
      <TopBar title="계정 찾기" />
      <div className="wtabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === 'id'} className={tab === 'id' ? 'on' : ''} onClick={() => switchTab('id')}>아이디 찾기</button>
        <button type="button" role="tab" aria-selected={tab === 'pw'} className={tab === 'pw' ? 'on' : ''} onClick={() => switchTab('pw')}>비밀번호 재설정</button>
      </div>
      <div className="scroll">
        <div className="login" key={tab}>
          <p className="sub">가입할 때 인증한 휴대폰 번호로 찾아요.</p>
          {tab === 'pw' && (
            <label className="field" htmlFor="fd-id"><span>아이디</span>
              <input id="fd-id" value={userId} autoComplete="username" autoCapitalize="off" onChange={e => { setUserId(e.target.value); setVerified(false); }} />
            </label>
          )}
          <PhoneVerify idp="fd" phone={phone} onPhone={v => { setPhone(v); setVerified(false); }} verified={verified} onVerify={() => setVerified(true)} okText={null} />
          {verified && !found && (
            <div className="box" role="alert">
              <b className={s.boxTitle}>{tab === 'id' ? '이 번호로 가입한 계정이 없어요' : '아이디와 휴대폰 번호가 맞는 계정이 없어요'}</b>
              <p className={s.boxNote}>{tab === 'id' ? '처음이라면 회원가입을 해 주세요.' : '아이디를 모르면 아이디 찾기에서 먼저 확인해 주세요.'}</p>
            </div>
          )}
          {found && tab === 'id' && (
            <div className="box">
              <div className="rows">
                <div><span className="k">가입한 아이디</span><b>{account.userId ? maskId(account.userId) : '없음 (소셜로 가입)'}</b></div>
                <div><span className="k">로그인 방법</span><span>{loginWays(account.links)}</span></div>
              </div>
            </div>
          )}
          {found && tab === 'pw' && (
            <div className="field"><span><label htmlFor="fd-new">새 비밀번호</label></span>
              <input id="fd-new" type="password" aria-describedby="fd-new-h" value={newPw} autoComplete="new-password" onChange={e => { setNewPw(e.target.value); setErr(''); }} />
              <small id="fd-new-h" className="hint">영문과 숫자를 섞어 8자 이상</small>
            </div>
          )}
          {err && <p className={s.err} role="alert">{err}</p>}
        </div>
      </div>
      {verified && !found && tab === 'id' && <div className="cta-bar"><button type="button" className="cta dark" onClick={() => nav('/signup', { replace: true })}>회원가입</button></div>}
      {found && (
        <div className="cta-bar">
          {tab === 'id'
            ? <button type="button" className="cta dark" onClick={toLogin}>로그인하러 가기</button>
            : <button type="button" className="cta dark" onClick={savePw}>비밀번호 바꾸기</button>}
        </div>
      )}
    </div>
  );
}
