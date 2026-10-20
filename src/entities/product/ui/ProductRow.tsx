import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { blockReason, isFree, pct } from '../model/product';
import { won } from '@/shared/lib';
import { type Product, useDB } from '@/shared/api';
import { CatIcon } from '@/entities/category/@x/product';

/** 상품 한 줄 (목업 productRow). 누르면 상품 상세. rep이면 대표 상품 표시, icon·sub는 검색 결과용 */
export function ProductRow({ p, rep = false, icon = false, sub }: { p: Product; rep?: boolean; icon?: boolean; sub?: ReactNode }) {
  const why = blockReason(useDB(), p);
  return (
    <Link to={`/products/${p.id}`} className={`prow ${rep ? 'rep' : ''}`}>
      {icon && <CatIcon cat={p.cat} size={20} />}
      <span>
        {rep && p.rep && <span className="rep-l">대표 상품</span>}
        <span className="pn">{p.name}</span>
        {sub && <span className="sub">{sub}</span>}
      </span>
      <span className="pp">
        {isFree(p) ? <span className="free">무료</span> : <><s>{won(p.list ?? p.price)}</s><span className="pct">{pct(p)}%</span><b className="num">{won(p.price)}</b></>}
      </span>
      {why && !why.startsWith('이미') && <span className="no">{why}</span>}
    </Link>
  );
}
