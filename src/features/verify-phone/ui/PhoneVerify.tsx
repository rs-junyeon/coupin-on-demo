import { useState } from 'react';
import { digits } from '@/shared/lib';
import { accountCss as s, useUi } from '@/shared/ui/mobile';

const PHONE_RE = /^01\d{8,9}$/;
/**
 * 휴대폰 문자 인증: [인증번호 받기] → 6자리 입력 → [확인].
 * 인증 여부는 부모가 갖고, 번호를 고치면 부모가 인증을 풀어 준다
 */
export function PhoneVerify({ phone, onPhone, verified, onVerify, okText = '휴대폰 인증이 끝났어요', idp }: {
  phone: string; onPhone(v: string): void; verified: boolean; onVerify(): void; okText?: string | null; idp: string;
}) {
  const toast = useUi(st => st.showToast);
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');
  const send = () => {
    if (!PHONE_RE.test(digits(phone))) { setErr('휴대폰 번호를 다시 확인해 주세요'); return; }
    setErr(''); setSent(true); setCode('');
    toast('문자로 인증번호를 보냈어요');
  };
  const verify = () => {
    if (!/^\d{6}$/.test(code.trim())) { setErr('문자로 받은 6자리 숫자를 입력해 주세요'); return; }
    setErr(''); onVerify();
  };
  return (
    <>
      <div className="field">
        <span id={`${idp}-ph-l`}>휴대폰 번호</span>
        <div className="field-row">
          <input id={`${idp}-ph`} aria-labelledby={`${idp}-ph-l`} value={phone} inputMode="tel" autoComplete="tel" placeholder="숫자만 입력"
            onChange={e => onPhone(e.target.value)} />
          <button type="button" onClick={send}>{sent ? '다시 받기' : '인증번호 받기'}</button>
        </div>
        {!sent && err && <p className={s.err} role="alert">{err}</p>}
      </div>
      {sent && (
        <div className="field">
          <span id={`${idp}-code-l`}>인증번호</span>
          <div className="field-row">
            <input id={`${idp}-code`} aria-labelledby={`${idp}-code-l`} value={code} inputMode="numeric" autoComplete="one-time-code" maxLength={6}
              disabled={verified} onChange={e => setCode(e.target.value.replace(/\D/g, ''))} />
            <button type="button" onClick={verify} disabled={verified}>{verified ? '인증됨' : '확인'}</button>
          </div>
          {err ? <p className={s.err} role="alert">{err}</p>
            : verified ? okText && <span className="ok-text">{okText}</span>
              : <small className="hint">문자로 받은 6자리 숫자를 입력해 주세요</small>}
        </div>
      )}
    </>
  );
}
