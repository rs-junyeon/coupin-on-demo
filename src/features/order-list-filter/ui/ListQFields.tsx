import { Input, Select } from 'antd';
import type { DB } from '@/shared/api';
import { SearchField } from '@/shared/ui/admin';
import type { ListQ, Period } from '../model/listQuery';

const PERIODS: { value: Period; label: string }[] = [{ value: 'all', label: '전체' }, { value: 'today', label: '오늘' }, { value: '7', label: '최근 7일' }];
const QF = [['qs', '가게 이름'], ['qp', '상품명'], ['qc', '고객 이름']] as const;

export function ListQFields({ db, value, onChange }: { db: Pick<DB, 'cats'>; value: ListQ; onChange: (f: ListQ) => void }) {
  const set = (k: keyof ListQ, v: string) => onChange({ ...value, [k]: v });
  const cats = [{ value: '전체', label: '전체' }, ...Object.keys(db.cats).map(c => ({ value: c, label: c })), { value: 'none', label: '미분류' }];
  return (
    <>
      <SearchField label="기간"><Select variant="borderless" aria-label="기간" value={value.per} options={PERIODS} onChange={v => set('per', v)} /></SearchField>
      <SearchField label="카테고리"><Select variant="borderless" aria-label="카테고리" value={value.cat} options={cats} onChange={v => set('cat', v)} /></SearchField>
      {QF.map(([k, t]) => (
        <SearchField key={k} label={t}>
          <Input variant="borderless" type="search" placeholder="검색어" aria-label={`${t}으로 찾기`} value={value[k]} onChange={e => set(k, e.target.value)} />
        </SearchField>
      ))}
    </>
  );
}
