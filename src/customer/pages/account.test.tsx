import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ACCT_PHONE, useDB } from '@/shared/api';
import { renderAt } from '@/test/render';

const S = () => useDB.getState();

async function verifyPhone(user: ReturnType<typeof userEvent.setup>, phone: string) {
  await user.type(screen.getByLabelText('휴대폰 번호'), phone);
  await user.click(screen.getByRole('button', { name: '인증번호 받기' }));
  await user.type(screen.getByLabelText('인증번호'), '123456');
  await user.click(screen.getByRole('button', { name: '확인' }));
}

describe('로그인', () => {
  it('틀린 아이디는 안내하고, 맞으면 next 화면으로 간다', async () => {
    const user = userEvent.setup();
    const { router } = renderAt('/login?next=/my/orders');
    await user.type(screen.getByLabelText('아이디'), 'nobody');
    await user.type(screen.getByLabelText('비밀번호'), 'pass1234');
    await user.click(screen.getByRole('button', { name: '로그인' }));
    expect(screen.getByRole('alert')).toHaveTextContent('아이디 또는 비밀번호가 맞지 않아요');
    await user.clear(screen.getByLabelText('아이디'));
    await user.type(screen.getByLabelText('아이디'), 'on_user');
    await user.click(screen.getByRole('button', { name: '로그인' }));
    await waitFor(() => expect(router.state.location.pathname).toBe('/my/orders'));
    expect(S().account.logged).toBe(true);
  });

  it('로그인이 필요한 화면은 로그인으로 보낸다', () => {
    const { router } = renderAt('/my');
    expect(router.state.location.pathname).toBe('/login');
    expect(router.state.location.search).toContain(encodeURIComponent('/my'));
  });
});

describe('회원가입', () => {
  it('이미 가입한 휴대폰 번호면 새로 만들지 않고 로그인으로 안내한다', async () => {
    const user = userEvent.setup();
    const { router } = renderAt('/signup');
    expect(screen.getByRole('button', { name: '다음' })).toBeDisabled();
    await user.click(screen.getByLabelText('전체 동의'));
    await user.click(screen.getByRole('button', { name: '다음' }));
    await user.type(screen.getByLabelText('아이디'), 'new_on');
    await user.type(screen.getByLabelText('비밀번호'), 'onpass123');
    await verifyPhone(user, ACCT_PHONE);
    expect(screen.getByText('이미 가입한 휴대폰 번호예요')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '가입하기' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '로그인하기' }));
    await waitFor(() => expect(router.state.location.pathname).toBe('/login'));
    expect(S().account.userId).toBe('on_user');
  });

  it('새 번호면 가입하고 완료 화면을 보여 준다', async () => {
    const user = userEvent.setup();
    const { router } = renderAt('/signup?next=/wallet');
    await user.click(screen.getByLabelText('(필수) 만 14세 이상이에요'));
    await user.click(screen.getByLabelText('(필수) 서비스 이용약관'));
    await user.click(screen.getByLabelText('(필수) 개인정보 수집·이용'));
    await user.click(screen.getByLabelText('(필수) 위치기반서비스 이용약관'));
    await user.click(screen.getByRole('button', { name: '다음' }));
    await user.type(screen.getByLabelText('아이디'), 'new_on');
    await user.type(screen.getByLabelText('비밀번호'), 'onpass123');
    await verifyPhone(user, '01055550101');
    await user.click(screen.getByRole('button', { name: '가입하기' }));
    expect(screen.getByText('가입이 끝났어요')).toBeInTheDocument();
    expect(S().account).toMatchObject({ logged: true, userId: 'new_on', phone: '010-5555-0101', mkt: false });
    await user.click(screen.getByRole('button', { name: '하려던 일 계속하기' }));
    await waitFor(() => expect(router.state.location.pathname).toBe('/wallet'));
  });
});

describe('소셜 로그인', () => {
  it('카카오 동의 → 휴대폰 확인 → 같은 번호 계정에 연결하고 로그인한다', async () => {
    const user = userEvent.setup();
    const { router } = renderAt('/login?next=/my');
    await user.click(screen.getByRole('button', { name: '카카오로 계속하기' }));
    expect(router.state.location.pathname).toBe('/oauth/kakao');
    await user.click(screen.getByRole('button', { name: '동의하고 계속하기' }));
    await waitFor(() => expect(router.state.location.pathname).toBe('/oauth/kakao/phone'));
    await verifyPhone(user, ACCT_PHONE);
    await user.click(screen.getByRole('button', { name: '다음' }));
    expect(screen.getByText('이미 가입한 계정이 있어요')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '연결하고 로그인' }));
    await waitFor(() => expect(router.state.location.pathname).toBe('/my'));
    expect(S().account).toMatchObject({ logged: true, links: { pw: true, kakao: true, google: false } });
  });

  it('같은 번호 계정이 없으면 소셜 가입으로 이어진다', async () => {
    const user = userEvent.setup();
    const { router } = renderAt('/oauth/google/phone');
    await verifyPhone(user, '010-7777-0000');
    await user.click(screen.getByRole('button', { name: '다음' }));
    await waitFor(() => expect(router.state.location.pathname).toBe('/signup'));
    expect(screen.getByText('Google로 가입')).toBeInTheDocument();
    await user.click(screen.getByLabelText('전체 동의'));
    await user.click(screen.getByRole('button', { name: '동의하고 가입하기' }));
    expect(S().account).toMatchObject({ logged: true, userId: '', phone: '010-7777-0000', mkt: true, links: { pw: false, kakao: false, google: true } });
  });

  it('로그인 방법이 하나만 남으면 해제할 수 없다', async () => {
    const user = userEvent.setup();
    renderAt('/my/profile', { logged: true });
    useDB.setState(s => ({ account: { ...s.account, links: { pw: false, kakao: true, google: false } } }));
    await user.click(await screen.findByRole('button', { name: '카카오 연결 해제' }));
    expect(screen.getByRole('status')).toHaveTextContent('로그인 방법이 하나만 남으면 해제할 수 없어요');
    expect(S().account.links.kakao).toBe(true);
  });
});

describe('마이', () => {
  it('주문 탭과 취소/환불 탭을 바꿔 본다', async () => {
    const user = userEvent.setup();
    const { router } = renderAt('/my/orders', { logged: true });
    const refundTab = screen.getByRole('tab', { name: /취소\/환불/ });
    await user.click(refundTab);
    expect(router.state.location.search).toBe('?tab=refund');
    expect(screen.getByRole('tab', { name: /취소\/환불/ })).toHaveAttribute('aria-selected', 'true');
    await user.click(screen.getByRole('tab', { name: /주문\(결제\)/ }));
    expect(router.state.location.search).toBe('');
  });

  it('로그아웃하면 둘러보기로 간다', async () => {
    const user = userEvent.setup();
    const { router } = renderAt('/my', { logged: true });
    await user.click(screen.getByRole('button', { name: '로그아웃' }));
    await waitFor(() => expect(S().account.logged).toBe(false));
    expect(router.state.location.pathname).toBe('/');
  });

  it('탈퇴는 동의 후 확인 시트를 거친다', async () => {
    const user = userEvent.setup();
    const { router } = renderAt('/my/withdraw', { logged: true });
    const btn = screen.getByRole('button', { name: '탈퇴하기' });
    expect(btn).toBeDisabled();
    await user.click(screen.getByLabelText('안내를 모두 확인했어요'));
    await user.click(btn);
    const sheet = screen.getByRole('dialog', { name: '탈퇴 확인' });
    await user.click(sheet.querySelector('.cta.danger')!);
    await waitFor(() => expect(S().account.logged).toBe(false));
    expect(router.state.location.pathname).toBe('/');
  });

  it('문의를 쓰다 나가려 하면 확인하고, 보내면 상세로 간다', async () => {
    const user = userEvent.setup();
    const { router } = renderAt('/my/inquiries/new', { logged: true });
    await user.type(screen.getByLabelText('제목'), '디카페인도 되나요?');
    await user.click(screen.getByRole('button', { name: '닫기' }));
    expect(screen.getByText('작성을 그만둘까요?')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '계속 작성' }));
    expect(router.state.location.pathname).toBe('/my/inquiries/new');
    await user.type(screen.getByLabelText('내용'), '아메리카노 쿠폰으로 디카페인도 받을 수 있나요?');
    await user.click(screen.getByRole('button', { name: '문의 남기기' }));
    await waitFor(() => expect(router.state.location.pathname).toMatch(/^\/my\/inquiries\/q\d+$/));
    expect(S().inquiries[0]).toMatchObject({ title: '디카페인도 되나요?', status: '접수' });
  });
});
