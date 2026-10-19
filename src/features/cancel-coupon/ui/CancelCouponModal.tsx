// 쿠폰 취소 모달 (A-03-03-02): 발급 내역·쿠폰 상세·주문 상세에서 같이 쓴다. 처리자·시각·사유는 쿠폰 상태 이력에 남는다
import { App, Button, Form, Input, Modal, Select } from 'antd';
import { useState } from 'react';
import { prodOf, useDB } from '@/shared/api';
import { who } from '@/entities/account';
import { won } from '@/shared/lib';
import { ordersCss as s } from '@/shared/ui/admin';

const REASONS = ['고객 요청', '매장 영업 종료', '잘못 발급됨', '직접 입력'] as const;

/** cid가 있을 때만 열린다. 닫으면 입력값은 처음으로 돌아간다 */
export function CancelCouponModal({ cid, onClose }: { cid: string | null; onClose: () => void }) {
  return cid ? <CancelBody key={cid} cid={cid} onClose={onClose} /> : null;
}

function CancelBody({ cid, onClose }: { cid: string; onClose: () => void }) {
  const { message } = App.useApp();
  const db = useDB();
  const [sel, setSel] = useState<(typeof REASONS)[number]>('고객 요청');
  const [txt, setTxt] = useState('');
  const c = db.coupons.find(x => x.id === cid);
  if (!c) return null;
  const p = prodOf(db, c.pid);
  const t = txt.trim();
  const needText = sel === '직접 입력' && !t;
  const go = () => {
    const reason = t ? (sel === '직접 입력' ? t : `${sel} · ${t}`) : sel;
    db.adminCancelCoupon(c.id, reason);
    message.success(c.paid ? `쿠폰을 취소하고 결제 ${won(c.paid)}을 환불했어요` : '쿠폰을 취소했어요');
    onClose();
  };
  return (
    <Modal
      open
      centered
      width={480}
      title={<span className={s.mtitle}>쿠폰을 취소할까요?<span className="a-sid">A-03-03-02</span></span>}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>닫기</Button>,
        <Button key="go" type="primary" danger disabled={needText} onClick={go}>쿠폰 취소</Button>,
      ]}
    >
      <div className={s.mbody}>
        <p className={s.mprod}>{p.name} · {who(c.owner)}</p>
        <p>PLUS에 발급 취소를 요청해요. 매장에서 이미 쓴 쿠폰이면 PLUS가 거절해요.{c.paid > 0 && <> <b>결제 {won(c.paid)}도 함께 취소돼요.</b></>}</p>
        <Form layout="vertical" className={s.mform} component="div">
          <Form.Item label="취소 사유" htmlFor="cx-reason">
            <Select id="cx-reason" value={sel} onChange={setSel} options={REASONS.map(r => ({ value: r, label: r }))} />
          </Form.Item>
          <Form.Item label={sel === '직접 입력' ? '사유 직접 입력' : '사유 직접 입력 (선택)'} htmlFor="cx-text" required={sel === '직접 입력'}>
            <Input.TextArea id="cx-text" rows={2} placeholder="자세한 사유를 적어 주세요" value={txt} onChange={e => setTxt(e.target.value)} />
          </Form.Item>
        </Form>
        <p className={s.mmeta}>처리자({db.admin.name})와 처리 시각이 쿠폰 상태 이력에 남아요.</p>
      </div>
    </Modal>
  );
}
