// PLUS 상품·상품 관리 공용: 검색조건(노출 상태·카테고리·판매 여부)과 표 칸, 숫자 입력 표기
import { Select } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { type AdminState, adminStatus, isFree, limTxt } from '@/entities/product';
import { type DB, type Product, storeOf } from '@/shared/api';
import { won } from '@/shared/lib';
import { CatIcon } from '@/ui/CatIcon';
import { SearchBox, SearchField, SearchRadio, StatusTag, type TagKind } from '@/shared/ui/admin';

export const ST_KIND: Record<AdminState['k'], TagKind> = { pub: 'ok', hidden: 'exp', draft: 'warn', block: 'cancel' };
export const PLUS_KIND: Record<string, TagKind> = { '판매 중': 'ok', '재승인 대기': 'warn', '판매 중지': 'cancel', '구독 종료': 'cancel' };

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

export const ProdCell = ({ db, p }: { db: DB; p: Product }) => (
  <div className="pmini"><CatIcon cat={p.cat} size={16} /><div>{p.name}<span className="sub">{storeOf(db, p.sid).name}</span></div></div>
);
export const CatCell = ({ p }: { p: Product }) => (p.cat ? <>{p.cat}</> : <StatusTag kind="warn">미분류</StatusTag>);
export const OnPriceCell = ({ p }: { p: Product }) => (isFree(p) ? <>무료</> : <>{won(p.price)}{p.price < p.own && <span className="sub">ON에서 할인</span>}</>);
export const LimitCell = ({ p }: { p: Product }) => (p.limit
  ? <>{Math.round((p.limitUsed / p.limit) * 100)}% 사용<span className="sub">{limTxt(p, p.limit)}</span></>
  : <span className="sub">전체 한도만</span>);
export const StateCell = ({ st }: { st: AdminState }) => (
  <><StatusTag kind={ST_KIND[st.k]}>{st.t}</StatusTag>{st.why && <span className="why">{st.why}</span>}</>
);
