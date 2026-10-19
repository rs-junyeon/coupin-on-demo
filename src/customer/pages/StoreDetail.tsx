import { useParams } from 'react-router-dom';
import { catName, distTxt, storeCat, storeProducts } from '../../domain/rules';
import { useDB } from '../../store/db';
import { useUi } from '../../store/ui';
import { Icon } from '../../ui/Icon';
import { photo } from '../../ui/photos';
import { ProductRow } from '../components/ProductRow';
import { StoreActions } from '../components/StoreCard';
import { TopBar } from '../components/TopBar';
import styles from './Detail.module.css';
import NotFound from './NotFound';

/** 매장 상세 (목업 pStore): 소개·주소·영업시간, [길찾기]·[전화], 받을 수 있는 쿠폰 목록 */
export default function StoreDetail() {
  const { sid } = useParams();
  const db = useDB();
  const origin = useUi(s => s.origin);
  const s = db.stores.find(x => x.id === sid);
  if (!s) return <NotFound />;
  const ps = storeProducts(db, s.id);
  return (
    <div className="c-page">
      <TopBar title={s.name} />
      <div className="scroll">
        <div className="hero"><img src={photo(s.id)} alt={`${s.name} 매장 사진`} decoding="async" /></div>
        <div className="dsec">
          <div className="tags"><span className="tag">{catName(db, storeCat(db, s.id))}</span><span className="tag">쿠폰 {ps.length}</span></div>
          <h2>{s.name}</h2>
          <div className="st"><Icon name="place" size={15} />{s.pos ? `${distTxt(s, origin)} · ` : ''}{s.intro}</div>
          {s.desc && <p className="sd-desc">{s.desc}</p>}
          <dl className={`info ${styles.info}`}>
            <div><dt>주소</dt><dd>{s.addr}</dd></div>
            <div><dt>영업시간</dt><dd>{s.hours}</dd></div>
          </dl>
          <StoreActions store={s} />
        </div>
        <div className={`dsec ${styles.last}`}>
          <h3>쿠폰 {ps.length}개</h3>
          <div className="sd-list">
            {ps.length
              ? ps.map((p, i) => <ProductRow key={p.id} p={p} rep={i === 0} />)
              : <div className={`empty ${styles.none}`}><b>지금 받을 수 있는 쿠폰이 없어요</b></div>}
          </div>
        </div>
      </div>
    </div>
  );
}
