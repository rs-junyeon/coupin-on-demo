import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { useDB } from '@/shared/api';
import { renderReady } from './render';

// jsdom에는 canvas가 없어 이미지 변환 결과만 흉내 낸다 (실제 변환은 브라우저에서 확인)
const toIconImage = vi.hoisted(() => vi.fn());
vi.mock('@/shared/lib', async importOriginal => ({ ...(await importOriginal<object>()), toIconImage }));

const png = () => new File(['x'], 'pet.png', { type: 'image/png' });

describe('카테고리 아이콘 직접 올리기', () => {
  it('PNG를 올리면 미리보기에 보이고, 추가하면 그 아이콘으로 저장된다', async () => {
    toIconImage.mockResolvedValueOnce({ ok: true, src: 'data:image/png;base64,PET', opaque: false, bgRemoved: true });
    const user = userEvent.setup();
    await renderReady('/admin/categories', { admin: true });
    await user.type(screen.getByLabelText('새 카테고리 이름'), '반려동물');
    await user.upload(screen.getAllByLabelText('아이콘 이미지 올리기 (PNG·SVG)')[0], png());
    expect(await screen.findByRole('button', { name: '다시 올리기' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('status')).toHaveTextContent('배경을 자동으로 지웠어요');
    await user.click(screen.getByRole('button', { name: '추가' }));
    await waitFor(() => expect(useDB.getState().cats['반려동물']?.img).toBe('data:image/png;base64,PET'));
  });

  it('배경을 지우지 못하면 사각형으로 보인다고 알려 주고, 못 읽는 파일은 막는다', async () => {
    const user = userEvent.setup();
    await renderReady('/admin/categories', { admin: true });
    toIconImage.mockResolvedValueOnce({ ok: true, src: 'data:image/png;base64,SQ', opaque: true, bgRemoved: false });
    await user.upload(screen.getAllByLabelText('아이콘 이미지 올리기 (PNG·SVG)')[0], png());
    expect(await screen.findByRole('status')).toHaveTextContent('배경을 지우지 못해 사각형으로 보여요');
    toIconImage.mockResolvedValueOnce({ ok: false, error: 'PNG나 SVG 파일만 올릴 수 있어요' });
    await user.upload(screen.getAllByLabelText('아이콘 이미지 올리기 (PNG·SVG)')[0], png());
    expect(await screen.findByRole('alert')).toHaveTextContent('PNG나 SVG 파일만 올릴 수 있어요');
  });
});
