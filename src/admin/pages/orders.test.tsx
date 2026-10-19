import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { seed } from '../../data/seed';
import { settleMonths } from '../../domain/rules';
import { useDB } from '../../store/db';
import { renderReady } from '../../test/render';

const S = () => useDB.getState();

describe('관리자 주문·쿠폰·정산', () => {
  it('주문: 검색칸 여러 개는 모두 맞는 주문만 남긴다', async () => {
    await renderReady('/admin/orders', { admin: true });
    expect(await screen.findByText('전체 11건')).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText('가게 이름으로 찾기'), '공방');
    expect(screen.getByText('전체 2건')).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText('고객 이름으로 찾기'), '정*우');
    expect(screen.getByText('전체 1건')).toBeInTheDocument();
    expect(screen.getByText('PLUS 발급 응답 시간 초과 · tid로 결과 확인 중')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /초기화/ }));
    expect(screen.getByText('전체 11건')).toBeInTheDocument();
  });

  it('결과 미확인 주문: tid로 확인하면 쿠폰을 복구하고 완료로 바뀐다', async () => {
    const oid = seed().orders.find(o => o.unconfirmed)!.id;
    await renderReady(`/admin/orders/${oid}`, { admin: true });
    await userEvent.click(await screen.findByRole('button', { name: 'tid로 발급 결과 확인' }));
    const o = S().orders.find(x => x.id === oid)!;
    expect(o.unconfirmed).toBe(false);
    expect(o.status).toBe('완료');
    expect(screen.queryByRole('button', { name: 'tid로 발급 결과 확인' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /사용 가능/ })).toHaveAttribute('href', `/admin/coupons/${o.cid}`);
    expect(screen.getByRole('button', { name: '환불 처리' })).toBeEnabled();
  });

  it('쿠폰 취소 모달: 유료 쿠폰을 취소하면 결제도 취소되고 환불 기록이 남는다', async () => {
    await renderReady('/admin/coupons/c1', { admin: true });
    await userEvent.click(await screen.findByRole('button', { name: '쿠폰 취소' }));
    const dlg = await screen.findByRole('dialog');
    expect(within(dlg).getByText(/결제 19,900원도 함께 취소돼요/)).toBeInTheDocument();
    await userEvent.type(within(dlg).getByLabelText(/사유 직접 입력/), '중복 결제');
    await userEvent.click(within(dlg).getByRole('button', { name: '쿠폰 취소' }));
    const c = S().coupons.find(x => x.id === 'c1')!;
    expect(c.status).toBe('CANCELLED');
    expect(c.cancel?.reason).toBe('고객 요청 · 중복 결제');
    expect(S().refunds.some(r => r.oid === c.oid && r.kind === 'ops')).toBe(true);
    expect(await screen.findByText(/운영자 취소 · 박운영 · 사유: 고객 요청 · 중복 결제/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '쿠폰 취소' })).toBeDisabled();
  });

  it('정산 상세: PLUS와 차이를 반영해야 확정할 수 있다', async () => {
    const key = settleMonths(seed())[1].key, mm = Number(key.slice(5));
    await renderReady(`/admin/settlements/${key}`, { admin: true });
    const confirm = await screen.findByRole('button', { name: `${mm}월 정산 확정` });
    expect(confirm).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: /ON 6장 · PLUS 7장/ }));
    await userEvent.click(screen.getByRole('button', { name: 'ON 기록에 반영하고 확인 완료' }));
    expect(S().settle.checked).toBe(true);
    expect(confirm).toBeEnabled();
    await userEvent.click(confirm);
    expect(S().settle.done).toBe(true);
  });
});
