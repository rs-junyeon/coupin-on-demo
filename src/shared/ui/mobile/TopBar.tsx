import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/shared/ui/icon';

/** 화면 머리: 뒤로(push) 또는 닫기(모달) + 제목 + 오른쪽 버튼 (목업 .bar / .mh-row) */
export function TopBar({ title, close = false, onBack, right, big = false }: { title: ReactNode; close?: boolean; onBack?: () => void; right?: ReactNode; big?: boolean }) {
  const nav = useNavigate();
  const back = onBack ?? (() => (window.history.length > 1 ? nav(-1) : nav('/')));
  if (big) return <header className="bar big"><h1>{title}</h1>{right}</header>;
  return (
    <header className="bar">
      <button type="button" className="ib" onClick={back} aria-label={close ? '닫기' : '뒤로'}><Icon name={close ? 'x' : 'back'} size={24} /></button>
      <h1>{title}</h1>
      {right ?? <span className="ib" aria-hidden="true" />}
    </header>
  );
}
