import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUi } from '../../store/ui';

/** 토스트 (3초 뒤 사라짐) */
export function Toast() {
  const t = useUi(s => s.toast);
  const hide = useUi(s => s.hideToast);
  useEffect(() => { if (!t) return; const id = setTimeout(hide, 3200); return () => clearTimeout(id); }, [t, hide]);
  if (!t) return null;
  return (
    <div className="toast enter" role="status" key={t.id}>
      <span>{t.text}</span>
      {t.action && <Link to={t.action.to} onClick={hide}><button type="button">{t.action.label}</button></Link>}
    </div>
  );
}

/** 처리 중 화면 (결제 확인, 발급 중). 끝날 때까지 다른 동작을 막는다 */
export function Busy() {
  const b = useUi(s => s.busy);
  if (!b) return null;
  return (
    <div className="proc" role="alert" aria-busy="true">
      <span className="spin" />
      <b>{b}</b>
      <p>잠시만 기다려 주세요. 화면을 닫지 마세요.</p>
    </div>
  );
}
