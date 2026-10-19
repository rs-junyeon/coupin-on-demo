// 관리자 상품 표 칸 (PLUS 상품·상품 관리·판매 조건): 상품·가게, 카테고리, ON 판매가, 상품별 한도, 노출 상태
import { CatIcon } from '@/entities/category';
import { type DB, type Product, storeOf } from '@/shared/api';
import { won } from '@/shared/lib';
import { StatusTag, type TagKind } from '@/shared/ui/admin';
import { type AdminState, isFree, limTxt } from '../model/product';

export const ST_KIND: Record<AdminState['k'], TagKind> = { pub: 'ok', hidden: 'exp', draft: 'warn', block: 'cancel' };
export const PLUS_KIND: Record<string, TagKind> = { '판매 중': 'ok', '재승인 대기': 'warn', '판매 중지': 'cancel', '구독 종료': 'cancel' };


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
