// 고객 앱 C 묶음(마이·주문·문의·설정·계정) 공용 부품: 휴대폰 문자 인증, 약관 문서, 표기 도우미
import { useState } from 'react';
import { digits } from '../../domain/rules';
import type { Account, InquiryStatus, OrderStatus, SocialProvider } from '../../domain/types';
import { useUi } from '../../store/ui';
import s from './account.module.css';

export const SNS: Record<SocialProvider, string> = { kakao: '카카오', google: 'Google' };
export const isProv = (x: string | null | undefined): x is SocialProvider => x === 'kakao' || x === 'google';

/** 로그인 뒤 돌아갈 주소: 앱 안 경로만 받는다 */
export const safeNext = (raw: string | null, fallback = '/') => (raw && raw.startsWith('/') && !raw.startsWith('//') ? raw : fallback);

export const maskPhone = (p: string) => { const d = digits(p); return `${d.slice(0, 3)}-****-${d.slice(-4)}`; };
export const maskId = (id: string) => `${id.slice(0, 4)}****`;
export const fmtPhone = (p: string) => { const d = digits(p); return d.length === 11 ? `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}` : d.length === 10 ? `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}` : p; };
export const loginWays = (l: Account['links']) => [l.pw && '아이디·비밀번호', l.kakao && '카카오', l.google && 'Google'].filter(Boolean).join(', ');

export const orderChip = (st: OrderStatus) => (st === '완료' ? 'st-ok' : st === '환불 완료' || st.startsWith('실패') ? 'st-cancel' : 'st-warn');
export const inqChip = (st: InquiryStatus) => (st === '답변 완료' ? 'st-ok' : st === '처리 중' ? 'st-part' : 'st-warn');

/** 약관 문서 (/docs/:key, 가입 화면 안에서도 연다) */
export type DocKey = 'terms' | 'privacy' | 'privacy-policy' | 'location';
export const DOCS: Record<DocKey, { t: string; sec: [string, string][] }> = {
  terms: { t: '서비스 이용약관', sec: [
    ['제1조 목적', '이 약관은 쿠핀 ON에서 쿠폰을 받고 사는 데 필요한 회사와 회원의 권리와 의무를 정해요.'],
    ['제2조 쿠폰의 발급과 사용', '쿠폰은 매장을 운영하는 점주가 쿠핀 PLUS로 발급해요. 매장에서 바코드나 PIN을 보여 주면 직원이 확인한 뒤 사용 처리해요.'],
    ['제3조 청약 철회와 환불', '쓰지 않은 유료 쿠폰은 유효기간 안에 환불을 요청할 수 있어요.'],
  ] },
  privacy: { t: '개인정보 수집·이용', sec: [
    ['수집하는 정보', '아이디, 비밀번호, 휴대폰 번호, 주문·결제 기록'],
    ['쓰는 곳', '회원 확인, 쿠폰 발급과 주문 처리, 문의 답변'],
    ['보관 기간', '탈퇴하면 바로 지워요. 결제·발급 기록은 법에서 정한 기간 동안 보관한 뒤 지워요.'],
  ] },
  'privacy-policy': { t: '개인정보처리방침', sec: [
    ['수집 항목과 목적', '아이디, 비밀번호, 휴대폰 번호(회원 확인·쿠폰 발급), 주문·결제 기록(주문 처리·환불), 문의 내용(답변)'],
    ['보관 기간과 파기', '탈퇴하면 바로 지워요. 계약·결제 기록 5년, 불만·분쟁 기록 3년처럼 법으로 정한 기록은 따로 보관한 뒤 지워요.'],
    ['제3자 제공과 처리 위탁', '쿠폰 발급을 위해 쿠핀 PLUS에, 결제를 위해 결제사에, 문자 인증을 위해 문자 발송 업체에 필요한 정보만 넘겨요.'],
    ['이용자 권리', '내 정보를 보거나 고치고 지우도록 요청할 수 있어요. 개인정보 보호책임자에게 연락해 주세요.'],
  ] },
  location: { t: '위치기반서비스 이용약관', sec: [
    ['위치를 쓰는 곳', '가까운 가게를 찾고 거리를 보여 주는 데만 써요.'],
    ['위치를 확인하는 때', '앱을 켤 때, 앱을 다시 열 때, [내 위치]를 누를 때만 확인해요. 계속 따라가지 않고, 백그라운드에서는 받지 않아요.'],
    ['보관', '내 위치는 저장하지 않아요.'],
  ] },
};
export const isDocKey = (k: string | undefined): k is DocKey => !!k && k in DOCS;

export function DocBody({ k }: { k: DocKey }) {
  return (
    <div className="doc">
      {DOCS[k].sec.map(([h, t]) => <section key={h}><h4>{h}</h4><p>{t}</p></section>)}
    </div>
  );
}

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
