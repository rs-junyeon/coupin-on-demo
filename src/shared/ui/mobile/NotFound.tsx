import { useNavigate } from 'react-router-dom';
import { Icon } from '@/shared/ui/icon';
import { accountCss as s } from '.';

/** 없는 주소·대상으로 들어왔을 때 */
export function NotFound() {
  const nav = useNavigate();
  return (
    <div className="c-page">
      <div className="scroll">
        <div className="empty errst">
          <Icon name="alert" size={44} stroke={1.6} />
          <b>페이지를 찾을 수 없어요</b>
          <span>주소가 바뀌었거나 없어진 페이지예요.<br />링크를 다시 확인해 주세요.</span>
          <button type="button" className={`sbtn ${s.sbtnWide}`} onClick={() => nav('/', { replace: true })}>둘러보기로 가기</button>
        </div>
      </div>
    </div>
  );
}
