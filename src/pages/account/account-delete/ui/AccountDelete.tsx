import { Navigate, useNavigate } from 'react-router-dom';
import { useDB } from '@/shared/api';
import { accountCss as s, TopBar } from '@/shared/ui/mobile';

/** 계정 삭제 안내: 앱 밖(스토어 등록 주소)에서 들어온 경우. 로그인 상태면 회원 탈퇴로 바로 보낸다 */
export default function AccountDelete() {
  const logged = useDB(st => st.account.logged);
  const nav = useNavigate();
  if (logged) return <Navigate to="/my/withdraw" replace />;
  return (
    <div className="c-page">
      <TopBar title="계정 삭제" />
      <div className="scroll">
        <div className="ck">
          <h2 className={s.pageTitle}>쿠핀 ON 계정을 삭제하려면</h2>
          <p className={s.lead}>로그인한 뒤 회원 탈퇴를 진행해 주세요. 앱이 없어도 이 페이지에서 바로 할 수 있어요.</p>
          <ul className="warn-list">
            <li>쓰지 않은 쿠폰은 탈퇴하면 쓸 수 없고 되살릴 수 없어요.</li>
            <li>결제·발급 기록은 법에서 정한 기간 동안 보관한 뒤 지워요.</li>
          </ul>
        </div>
      </div>
      <div className="cta-bar">
        <button type="button" className="cta danger" onClick={() => nav(`/login?next=${encodeURIComponent('/my/withdraw')}`)}>로그인하고 탈퇴하기</button>
      </div>
    </div>
  );
}
