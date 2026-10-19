import { useParams } from 'react-router-dom';
import { NotFound, TopBar } from '@/shared/ui/mobile';
import { DocBody, DOCS, isDocKey } from '@/shared/ui/legal-doc';

/** 약관 문서: /docs/terms · /docs/privacy · /docs/privacy-policy · /docs/location */
export default function Docs() {
  const { key } = useParams();
  if (!isDocKey(key)) return <NotFound />;
  return (
    <div className="c-page">
      <TopBar title={DOCS[key].t} />
      <div className="scroll"><DocBody k={key} /></div>
    </div>
  );
}
