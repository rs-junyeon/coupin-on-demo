import { useNavigate } from 'react-router-dom';
import { type SocialProvider, useDB } from '@/shared/api';
import { TopBar, useUi } from '@/shared/ui/mobile';
import { maskPhone } from './accountKit';
import s from './account.module.css';
import { SNS } from '@/entities/account';

/** 회원 정보: 같은 휴대폰 번호의 계정 하나에 아이디·카카오·Google 로그인을 연결한다. 마지막 하나는 해제할 수 없다 */
export default function Profile() {
  const nav = useNavigate();
  const account = useDB(st => st.account);
  const unlinkSocial = useDB(st => st.unlinkSocial);
  const toast = useUi(st => st.showToast);
  const L = account.links;
  const unlink = (prov: SocialProvider) => {
    const r = unlinkSocial(prov);
    toast(r.ok ? `${SNS[prov]} 로그인 연결을 해제했어요` : r.error);
  };
  const link = (prov: SocialProvider) => nav(`/oauth/${prov}?mode=link&next=${encodeURIComponent('/my/profile')}`);
  const linked = (on: boolean) => (on ? <span className="st-chip st-ok">연결됨</span> : <span className={s.muted}>연결 안 함</span>);
  const way = (prov: SocialProvider) => (
    <div key={prov}>
      <span>{SNS[prov]}</span>
      <b>{linked(L[prov])}</b>
      {L[prov]
        ? <button type="button" onClick={() => unlink(prov)} aria-label={`${SNS[prov]} 연결 해제`}>해제</button>
        : <button type="button" onClick={() => link(prov)} aria-label={`${SNS[prov]} 연결하기`}>연결하기</button>}
    </div>
  );
  return (
    <div className="c-page">
      <TopBar title="회원 정보" />
      <div className="scroll">
        <div className="ck">
          <div className="kv">
            <div><span>아이디</span><b>{L.pw && account.userId ? account.userId : <span className={s.muted}>없음 (소셜로 가입)</span>}</b></div>
            <div><span>휴대폰 번호</span><b>{maskPhone(account.phone)}</b></div>
            {L.pw && <div><span>비밀번호</span><b aria-label="설정됨">••••••••</b></div>}
          </div>
          <h3 className={s.secTitle}>로그인 방법</h3>
          <div className="kv">
            <div><span>아이디</span><b>{linked(L.pw)}</b></div>
            {way('kakao')}
            {way('google')}
          </div>
          <p className={s.note}>같은 휴대폰 번호로 확인된 로그인 방법은 모두 이 계정 하나로 이어져요. 마지막 하나는 해제할 수 없어요.</p>
          <button type="button" className={`lnk ${s.withdrawLink}`} onClick={() => nav('/my/withdraw')}>회원 탈퇴</button>
        </div>
      </div>
    </div>
  );
}
