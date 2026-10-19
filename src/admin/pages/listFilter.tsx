// 주문·환불·발급 내역이 같이 쓰는 검색조건: 기간, 상품 카테고리, 가게 이름·상품명·고객 이름 (여러 칸에 적으면 모두 맞는 건만)
import { Input, Select } from 'antd';
import { storeOf, who } from '../../domain/rules';
import { addDays, today } from '../../domain/time';
import type { DB, Product, Refund } from '../../domain/types';
import { SearchField, type TagKind } from '../components/ui';

export type Period = 'all' | 'today' | '7';
export type ListQ = { per: Period; cat: string; qs: string; qp: string; qc: string };
export const Q0: ListQ = { per: 'all', cat: '전체', qs: '', qp: '', qc: '' };

const PERIODS: { value: Period; label: string }[] = [{ value: 'all', label: '전체' }, { value: 'today', label: '오늘' }, { value: '7', label: '최근 7일' }];
const QF = [['qs', '가게 이름'], ['qp', '상품명'], ['qc', '고객 이름']] as const;

/** 기간은 오늘(0시) 기준: 오늘, 오늘 포함 최근 7일 */
export const inPeriod = (at: string, per: Period) => per === 'all' || new Date(at) >= (per === 'today' ? today() : addDays(today(), -6));
export const catHit = (p: Product, v: string) => v === '전체' || (v === 'none' ? !p.cat : p.cat === v);
export const qHit = (db: Pick<DB, 'stores'>, f: ListQ, p: Product, owner: string) =>
  storeOf(db, p.sid).name.includes(f.qs.trim()) && p.name.includes(f.qp.trim()) && who(owner).includes(f.qc.trim());
/** 기간·카테고리·검색칸을 모두 통과하는지 */
export const listHit = (db: Pick<DB, 'stores'>, f: ListQ, p: Product, owner: string, at: string) => inPeriod(at, f.per) && catHit(p, f.cat) && qHit(db, f, p, owner);

/** 주문 상태 표시: 완료, 환불 완료·실패, 그 밖(발급 중·결과 미확인·환불 처리 중)은 확인 필요 */
export const orderTag = (st: string): TagKind => (st === '완료' ? 'ok' : st === '환불 완료' || st.startsWith('실패') ? 'cancel' : 'warn');
export const refundTag = (r: Refund['result']): TagKind => (r === '완료' ? 'ok' : r === '거절' ? 'cancel' : 'warn');
export const settleTag = (st: '확정' | '대사 중' | '차이 있음'): TagKind => (st === '확정' ? 'ok' : st === '차이 있음' ? 'warn' : 'part');

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
