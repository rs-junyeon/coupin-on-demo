import { useNavigate } from 'react-router-dom';
import { ME, unseenAnswer } from '../../domain/rules';
import { useDB } from '../../store/db';
import { useUi } from '../../store/ui';
import { Icon } from '../../ui/Icon';
import { BizInfo } from '../components/BizInfo';
import { loginWays, maskPhone } from './accountKit';

/** 마이 탭: 프로필, 회원 정보·주문·문의·설정, 로그아웃 */
export default function My() {
  const nav = useNavigate();
  const db = useDB();
  const toast = useUi(s => s.showToast);
  const { account } = db;
  const nOrders = db.orders.filter(o => o.owner === ME).length;
  const nInq = db.inquiries.filter(q => q.owner === ME).length;
  const logout = () => {
    // 먼저 둘러보기로 옮긴 뒤 로그아웃한다 (마이에 남아 있으면 로그인 화면으로 넘어가기 때문)
    void Promise.resolve(nav('/', { replace: true })).then(() => { db.logout(); toast('로그아웃했어요'); });
  };
  return (
    <div className="c-page">
      <header className="bar big"><h1>마이</h1></header>
      <div className="scroll">
        <div className="prof">
          <span className="av" aria-hidden="true">{account.name.slice(-1)}</span>
          <div><b>{account.name} 님</b><span>{account.userId || `${loginWays(account.links)} 계정`} · {maskPhone(account.phone)}</span></div>
        </div>
        <nav className="menu" aria-label="마이 메뉴">
          <button type="button" onClick={() => nav('/my/profile')}><Icon name="user" /><span>회원 정보</span><Icon name="chev" size={16} /></button>
          <button type="button" onClick={() => nav('/my/orders')}><Icon name="receipt" /><span>주문·환불 내역</span><small>{nOrders}건</small><Icon name="chev" size={16} /></button>
          <button type="button" onClick={() => nav('/my/inquiries')}>
            <Icon name="chat" /><span>문의</span>
            {unseenAnswer(db) && <i className="ndot" role="img" aria-label="새 답변" />}
            {nInq > 0 && <small>{nInq}건</small>}<Icon name="chev" size={16} />
          </button>
          <button type="button" onClick={() => nav('/my/settings')}><Icon name="doc" /><span>설정·약관</span><Icon name="chev" size={16} /></button>
          <hr />
          <button type="button" onClick={logout}><Icon name="out" /><span>로그아웃</span></button>
        </nav>
        <BizInfo />
      </div>
    </div>
  );
}
