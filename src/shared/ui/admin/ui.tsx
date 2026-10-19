// 관리자 공용 부품: 화면 제목, 검색조건 박스, 목록 박스, 상태 표시, 상세 카드 (쿠핀+ 관리자 웹 구조)
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Radio } from 'antd';
import type { ReactNode } from 'react';

export function PageHead({ title, id, desc, extra }: { title: ReactNode; id: string; desc?: ReactNode; extra?: ReactNode }) {
  return (
    <div className="a-head">
      <div><h2>{title}<span className="a-sid">{id}</span></h2>{desc && <p>{desc}</p>}</div>
      {extra && <><span className="sp" />{extra}</>}
    </div>
  );
}

/** '검색조건' 박스. 칸은 바꾸는 즉시 걸러지고, [초기화]는 이 화면의 조건을 처음으로 되돌린다 */
export function SearchBox({ children, onReset }: { children: ReactNode; onReset: () => void }) {
  return (
    <>
      <div className="a-box-title"><h3>검색조건</h3></div>
      <div className="a-box">
        <div className="a-sform">
          {children}
          <div className="a-sbtns">
            <Button type="primary" icon={<SearchOutlined />}>검색</Button>
            <Button icon={<ReloadOutlined />} onClick={onReset}>초기화</Button>
          </div>
        </div>
      </div>
    </>
  );
}

/** 이름표가 붙은 검색 칸 (cims-assets .search-box .ant-form-item-row). 안쪽 컨트롤은 variant="borderless" */
export function SearchField({ label, children }: { label: string; children: ReactNode }) {
  return <div className="a-sf"><span className="lbl">{label}</span>{children}</div>;
}

/** 상태 칩 묶음 (쿠핀+ 라디오 버튼 묶음) */
export function SearchRadio<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: { value: T; label: string; count?: number }[]; onChange: (v: T) => void }) {
  return (
    <div className="a-sf rg" role="group" aria-label={label}>
      <span className="lbl">{label}</span>
      <Radio.Group optionType="button" value={value} onChange={e => onChange(e.target.value as T)}>
        {options.map(o => <Radio.Button key={o.value} value={o.value}>{o.label}{o.count != null && <small> {o.count}</small>}</Radio.Button>)}
      </Radio.Group>
    </div>
  );
}

/** '목록' 박스: 전체 N건 + 오른쪽 버튼 + 표 */
export function ListBox({ title = '목록', total, extra, children }: { title?: string; total?: number; extra?: ReactNode; children: ReactNode }) {
  return (
    <>
      <div className="a-box-title"><h3>{title}</h3></div>
      <div className="a-box">
        {(total != null || extra) && (
          <div className="a-lhead">
            {total != null ? <h4>전체 {total.toLocaleString()}건</h4> : <span />}
            {extra && <div className="extra">{extra}</div>}
          </div>
        )}
        {children}
      </div>
    </>
  );
}

export type TagKind = 'ok' | 'part' | 'used' | 'exp' | 'cancel' | 'warn';
export const StatusTag = ({ kind, children }: { kind: TagKind; children: ReactNode }) => <span className={`a-tag ${kind}`}>{children}</span>;

export function Card({ title, extra, children, bodyClass = 'a-card-body' }: { title: ReactNode; extra?: ReactNode; children: ReactNode; bodyClass?: string }) {
  return (
    <section className="a-card">
      <h4>{title}{extra && <><span className="sp" />{extra}</>}</h4>
      <div className={bodyClass}>{children}</div>
    </section>
  );
}

/** 라벨·값 줄 묶음 (plus-admin-web 상품 상세 .issue-detail-list dl) */
export function DlGroup({ title, rows, children }: { title?: string; rows?: [ReactNode, ReactNode][]; children?: ReactNode }) {
  return (
    <div className="a-dgrp">
      {title && <h5>{title}</h5>}
      {children}
      {rows && <dl>{rows.map(([k, v], i) => <div key={i}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>}
    </div>
  );
}

export const BtnBox = ({ children }: { children: ReactNode }) => <div className="a-btnbox">{children}</div>;

/** 표 공통 설정: 10줄씩, 가운데 페이지 넘김 */
export const tableProps = { className: 'a-table', size: 'middle' as const, pagination: { pageSize: 10, position: ['bottomCenter' as const], showSizeChanger: false, hideOnSinglePage: true }, scroll: { x: 'max-content' as const } };
