import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useDB } from '@/shared/api';
import { renderReady, settle } from '@/test/render';

const prod = (id: string) => useDB.getState().products.find(p => p.id === id)!;
/** antd Select 열고 옵션 고르기 */
function pick(label: string, option: string) {
  fireEvent.mouseDown(screen.getByRole('combobox', { name: label }));
  const opts = document.querySelectorAll<HTMLElement>(`.ant-select-item-option[title="${option}"]`);
  fireEvent.click(opts[opts.length - 1]);
}

describe('관리자 상품', () => {
  it('로그인하지 않으면 운영자 로그인으로 보내고, 로그인하면 판매 현황이 열린다', async () => {
    const { router } = await renderReady('/admin/products');
    expect(router.state.location.pathname).toBe('/admin/login');
    expect(screen.getByLabelText('아이디')).toHaveValue('ops.park');
    fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'pw1234' } });
    fireEvent.click(screen.getByRole('button', { name: '로그인' }));
    await waitFor(() => expect(router.state.location.pathname).toBe('/admin'));
    expect(await screen.findByRole('heading', { name: /판매 현황/ })).toBeInTheDocument();
    expect(screen.getByText('결제 취소 실패')).toBeInTheDocument();
  });

  it('p14 판매 조건에서 카테고리를 고르고 저장하고 게시한다', async () => {
    const { router } = await renderReady('/admin/products?st=draft', { admin: true });
    const row = screen.getByText('프로필 사진 촬영 체험').closest('tr')!;
    fireEvent.click(within(row).getByRole('button', { name: /판매 조건/ }));
    await waitFor(() => expect(router.state.location.pathname).toBe('/admin/products/p14/terms'));
    await settle(router);
    await screen.findByRole('button', { name: '저장하고 게시' });

    // 카테고리 없이 게시하면 막는다
    fireEvent.click(screen.getByRole('button', { name: '저장하고 게시' }));
    expect(await screen.findByText('게시하려면 카테고리를 골라 주세요')).toBeInTheDocument();
    expect(prod('p14').on).toBe('DRAFT');

    pick('카테고리', '사진');
    fireEvent.click(screen.getByRole('button', { name: '저장하고 게시' }));
    await waitFor(() => expect(router.state.location.pathname).toBe('/admin/products'));
    expect(prod('p14')).toMatchObject({ on: 'PUBLISHED', cat: '사진' });
    expect(await screen.findByText(/고객 지도에 '스튜디오 빛' 쿠폰이 나와요/)).toBeInTheDocument();
  });

  it('여러 상품을 골라 카테고리를 지정하고 게시한다 (노출 불가는 건너뜀)', async () => {
    await renderReady('/admin/products?cat=none', { admin: true });
    ['프로필 사진 촬영 체험', '물레 체험 2인', '소금빵 3개 교환권'].forEach(name =>
      fireEvent.click(within(screen.getByText(name).closest('tr')!).getByRole('checkbox')));
    const bar = screen.getByRole('region', { name: '일괄 처리' });
    expect(within(bar).getByText('3개 선택')).toBeInTheDocument();
    pick('한 번에 지정할 카테고리', '클래스');
    fireEvent.click(within(bar).getByRole('button', { name: '지정하고 게시' }));
    expect(await screen.findByText("3개 상품을 '클래스' 카테고리로 지정했어요 · 2개 게시 (1개는 이미 게시 중이거나 노출 불가라 건너뜀)")).toBeInTheDocument();
    expect(prod('p16')).toMatchObject({ on: 'PUBLISHED', cat: '클래스' });
    expect(prod('p15')).toMatchObject({ on: 'DRAFT', cat: '클래스' });
    expect(screen.queryByRole('region', { name: '일괄 처리' })).not.toBeInTheDocument();
  });

  it('카테고리 화면의 미분류 상품 보기는 미분류만 보여 준다', async () => {
    const { router } = await renderReady('/admin/categories', { admin: true });
    fireEvent.click(screen.getByRole('link', { name: '미분류 상품 보기' }));
    await waitFor(() => expect(router.state.location.search).toBe('?cat=none'));
    const n = useDB.getState().products.filter(p => !p.cat).length;
    expect(await screen.findByText(`전체 ${n}건`)).toBeInTheDocument();
  });

  it('PLUS 상품 상세의 상품변경 이력은 바뀐 칸을 표시하고, 동기화를 실행하면 기록이 쌓인다', async () => {
    const { router } = await renderReady('/admin/plus-products', { admin: true });
    fireEvent.click(screen.getByText('1:1 체험 레슨 50분'));
    await waitFor(() => expect(router.state.location.pathname).toBe('/admin/plus-products/p4'));
    fireEvent.click(await screen.findByRole('tab', { name: /상품변경 이력/ }));
    expect(router.state.location.search).toBe('?tab=history');
    expect(document.querySelectorAll('td.cell-chg').length).toBeGreaterThan(0);

    await router.navigate('/admin/sync');
    const before = useDB.getState().syncLog.length;
    fireEvent.click(await screen.findByRole('button', { name: /수동 실행/ }));
    expect(useDB.getState().syncLog.length).toBe(before + 1);
    expect(await screen.findByText(/PLUS에서 상품 \d+개를 다시 받았어요/)).toBeInTheDocument();
  });

  it('카테고리를 추가하고 행 안에서 이름을 바꾼다, 판매 현황에서 한도를 고친다', async () => {
    const { router } = await renderReady('/admin/categories', { admin: true });
    fireEvent.change(screen.getByLabelText('새 카테고리 이름'), { target: { value: '반려동물' } });
    fireEvent.click(screen.getByRole('button', { name: '아이콘 반려동물' }));
    fireEvent.click(screen.getByRole('button', { name: '추가' }));
    expect(useDB.getState().cats['반려동물']).toMatchObject({ icon: 'pet' });
    fireEvent.click(screen.getByRole('button', { name: '반려동물 수정' }));
    fireEvent.change(screen.getByLabelText('카테고리 이름'), { target: { value: '펫' } });
    fireEvent.click(screen.getByRole('button', { name: '저장' }));
    expect(Object.keys(useDB.getState().cats)).toContain('펫');
    expect(screen.getByRole('button', { name: '뷰티 삭제' })).toBeDisabled();

    await router.navigate('/admin');
    fireEvent.click(await screen.findByRole('button', { name: '한도 수정' }));
    fireEvent.change(await screen.findByLabelText('유료 한도'), { target: { value: '4000000' } });
    fireEvent.click(screen.getByRole('button', { name: '저장' }));
    await waitFor(() => expect(useDB.getState().limit.total).toBe(4000000));
  });
});

