// PLUS 상품·상품 관리 공용: 검색조건(노출 상태·카테고리·판매 여부)과 표 칸, 숫자 입력 표기
import { Select } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { type AdminState, adminStatus } from '@/entities/product';
import { type DB } from '@/shared/api';
import { SearchBox, SearchField, SearchRadio } from '@/shared/ui/admin';

export { numFmt, numParse } from '@/shared/lib';

type St = 'all' | AdminState['k'];
const ST_OPTS: [St, string][] = [['all', '전체'], ['pub', '게시 중'], ['draft', '미게시'], ['hidden', '숨김'], ['block', '노출 불가']];
const SALE_OPTS = [{ value: 'all', label: '전체' }, { value: 'on', label: 'PLUS 판매 중' }, { value: 'stop', label: 'PLUS 판매 중지' }];

/** 검색조건은 주소 검색어(st·cat·sale)에 둔다. 카테고리 화면에서 ?cat=none으로 미분류만 열 수 있다 */
export function useProductFilter(db: DB) {
  const [sp, setSp] = useSearchParams();
  const st = (sp.get('st') ?? 'all') as St, cat = sp.get('cat') ?? '전체', sale = sp.get('sale') ?? 'all';
  const set = (k: string, v: string, def: string) => setSp(prev => {
    const n = new URLSearchParams(prev);
    if (v === def) n.delete(k); else n.set(k, v);
    return n;
  }, { replace: true });
  const base = db.products.filter(p => (cat === '전체' || (cat === 'none' ? !p.cat : p.cat === cat))
    && (sale === 'all' || (sale === 'on' ? p.plus === 'ON_SALE' : p.plus === 'STOPPED')));
  const counts: Record<St, number> = { all: base.length, pub: 0, draft: 0, hidden: 0, block: 0 };
  base.forEach(p => { counts[adminStatus(db, p).k]++; });
  const rows = base.filter(p => st === 'all' || adminStatus(db, p).k === st);
  const catOpts = [{ value: '전체', label: '전체' }, ...Object.keys(db.cats).map(k => ({ value: k, label: k })), { value: 'none', label: '미분류' }];
  const search = (
    <SearchBox onReset={() => setSp(new URLSearchParams(), { replace: true })}>
      <SearchRadio label="노출 상태" value={st} onChange={v => set('st', v, 'all')} options={ST_OPTS.map(([value, label]) => ({ value, label, count: counts[value] }))} />
      <SearchField label="카테고리"><Select variant="borderless" aria-label="카테고리" value={cat} onChange={v => set('cat', v, '전체')} options={catOpts} popupMatchSelectWidth={false} /></SearchField>
      <SearchField label="판매 여부"><Select variant="borderless" aria-label="판매 여부" value={sale} onChange={v => set('sale', v, 'all')} options={SALE_OPTS} popupMatchSelectWidth={false} /></SearchField>
    </SearchBox>
  );
  return { rows, search, filterKey: sp.toString() };
}
