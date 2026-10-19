import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cStatus } from '@/entities/coupon';
import { myCoupons, useDB } from '@/shared/api';
import { accountCss as s, Sheet, TopBar, useUi } from '@/shared/ui/mobile';

/** 회원 탈퇴: 안내 확인 → [탈퇴하기] → 확인 시트 → 탈퇴 */
export default function Withdraw() {
  const nav = useNavigate();
  const db = useDB();
  const toast = useUi(st => st.showToast);
  const [agree, setAgree] = useState(false);
  const [ask, setAsk] = useState(false);
  const active = myCoupons(db).filter(c => cStatus(c).active).length;
  const go = () => {
    setAsk(false);
    // 먼저 둘러보기로 옮긴 뒤 탈퇴한다 (로그인이 필요한 화면에 남아 있으면 로그인 화면으로 넘어가기 때문)
    void Promise.resolve(nav('/', { replace: true })).then(() => { db.withdraw(); toast('탈퇴했어요. 그동안 이용해 주셔서 고마워요'); });
  };
  return (
    <div className="c-page">
      <TopBar title="회원 탈퇴" />
      <div className="scroll">
        <div className="ck">
          <h2 className={s.pageTitle}>탈퇴하기 전에 확인해 주세요</h2>
          <ul className="warn-list">
            <li>쓰지 않은 쿠폰 {active}장은 탈퇴하면 쓸 수 없고 되살릴 수 없어요.</li>
            <li>환불이 필요한 쿠폰은 탈퇴하기 전에 환불을 요청해 주세요.</li>
            <li>결제·발급 기록은 법에서 정한 기간 동안 보관한 뒤 지워요.</li>
          </ul>
          <label className="agree" htmlFor="wd-agree">
            <input type="checkbox" id="wd-agree" checked={agree} onChange={e => setAgree(e.target.checked)} />
            <span>안내를 모두 확인했어요</span>
          </label>
        </div>
      </div>
      <div className="cta-bar">
        <button type="button" className="cta danger" disabled={!agree} onClick={() => setAsk(true)}>탈퇴하기</button>
      </div>
      <Sheet open={ask} onClose={() => setAsk(false)} label="탈퇴 확인">
        <h3>정말 탈퇴할까요?</h3>
        <p className="sub">탈퇴하면 받은 쿠폰과 주문 내역을 앱에서 볼 수 없어요.</p>
        <button type="button" className="cta danger" onClick={go}>탈퇴하기</button>
        <button type="button" className="cta line" onClick={() => setAsk(false)}>취소</button>
      </Sheet>
    </div>
  );
}
