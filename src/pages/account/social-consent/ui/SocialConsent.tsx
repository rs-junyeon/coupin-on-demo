import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useDB } from '@/shared/api';
import { accountCss as s, NotFound, useUi } from '@/shared/ui/mobile';
import { isProv, SNS } from '@/entities/account';
import { safeNext } from '@/shared/lib';
import { linkSocial, socialLogin } from '@/features/auth';

const EXT = {
  kakao: { acct: '카카오계정', mail: 'kim.on@kakao.com', items: '닉네임, 이메일', mark: 'K' },
  google: { acct: 'Google 계정', mail: 'kim.on@gmail.com', items: '이름, 이메일', mark: 'G' },
} as const;

/**
 * 소셜 로그인 동의 화면 (카카오·Google이 띄우는 외부 화면을 대신한다).
 * mode=link: 로그인한 계정에 연결 / mode=login: 로그인 → 처음이면 휴대폰 확인으로
 */
export default function SocialConsent() {
  const { prov } = useParams();
  const [sp] = useSearchParams();
  const nav = useNavigate();
  const db = useDB();
  const toast = useUi(st => st.showToast);
  if (!isProv(prov)) return <NotFound />;
  const rawNext = sp.get('next');
  const link = sp.get('mode') === 'link' && db.account.logged;
  const x = EXT[prov], name = SNS[prov];
  const ok = () => {
    if (link) {
      linkSocial(prov);
      nav(safeNext(rawNext, '/my/profile'), { replace: true });
      toast(`${name} 로그인을 이 계정에 연결했어요`);
      return;
    }
    if (socialLogin(prov) === 'logged') {
      nav(safeNext(rawNext), { replace: true });
      if (!rawNext) toast(`${name}로 로그인했어요`);
      return;
    }
    nav(`/oauth/${prov}/phone${rawNext ? `?next=${encodeURIComponent(safeNext(rawNext))}` : ''}`, { replace: true });
  };
  const cancel = () => {
    if (window.history.length > 1) nav(-1); else nav(link ? '/my/profile' : '/login', { replace: true });
    toast(link ? '연결을 취소했어요' : '로그인을 취소했어요');
  };
  return (
    <div className="c-page">
      <div className="ext" role="dialog" aria-label={`${name} 로그인 화면`}>
        <div className="ext-bar">외부 화면 · {name} 로그인</div>
        <div className="ext-card">
          <span className="s">{x.acct}</span>
          <b className={s.extTitle}>'쿠핀 ON'에 로그인할까요?</b>
          <div className="rows">
            <div><span className="k">계정</span><span>{x.mail}</span></div>
            <div><span className="k">제공 항목</span><span>{x.items}</span></div>
          </div>
          <button type="button" className={`sns ${prov}`} onClick={ok}><i aria-hidden="true">{x.mark}</i>동의하고 계속하기</button>
          <button type="button" className="cta line" onClick={cancel}>취소</button>
        </div>
        <p className="ext-note">휴대폰 번호는 {name}에서 받지 않고, 처음 한 번 문자로 확인해요.</p>
      </div>
    </div>
  );
}
