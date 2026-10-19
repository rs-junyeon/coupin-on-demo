import { useEffect, type ReactNode } from 'react';

/** 바텀시트 (목업 .dim-bg + .bsheet). 바깥이나 Esc로 닫는다 */
export function Sheet({ open, onClose, children, label }: { open: boolean; onClose: () => void; children: ReactNode; label: string }) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="layer is-sheet enter c-sheet-layer">
      <div className="dim-bg" onClick={onClose}>
        <div className="bsheet" role="dialog" aria-modal="true" aria-label={label} onClick={e => e.stopPropagation()}>
          <span className="sheet-grab"><span className="grabber" /></span>
          {children}
        </div>
      </div>
    </div>
  );
}
