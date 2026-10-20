import { DownOutlined, LogoutOutlined, MobileOutlined } from '@ant-design/icons';
import { App as AntApp, Breadcrumb, Button, ConfigProvider, Dropdown, Layout, Menu, type MenuProps } from 'antd';
import koKR from 'antd/locale/ko_KR';
import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useMatches, useNavigate } from 'react-router-dom';
import { adminStatus } from '@/entities/product';
import { useDB } from '@/shared/api';
import { onLogo } from '@/shared/ui/brand';
import { SiderIcon } from '@/shared/ui/icon';
import '../styles/admin.css';
import { RequireAdmin } from '../router/RequireAdmin';
import { adminTheme } from './adminTheme';
import { adminLogout } from '@/features/admin-auth';

/** 라우트 handle: 브레드크럼 (메뉴 묶음 > 메뉴 > 상세) */
export type Crumb = { crumb: string[] };

const badge = (n: number) => (n ? <span className="a-menu-badge">{n}</span> : null);

/** 좌측 메뉴 (A-00-02): IA 묶음 구조. 묶음 아이콘은 쿠핀+ 사이드바와 같은 채움형 (DESIGN.md 7.7), 하위 메뉴에는 아이콘을 두지 않는다 */
function useMenu(): MenuProps['items'] {
  const db = useDB();
  const draft = db.products.filter(p => adminStatus(db, p).k === 'draft').length;
  const uncat = db.products.filter(p => !p.cat).length;
  const unconfirmed = db.orders.filter(o => o.unconfirmed).length;
  const stuck = db.orders.filter(o => o.status === '환불 처리 중').length;
  const inq = db.inquiries.filter(q => q.status !== '답변 완료').length;
  const L = (to: string, label: string, n = 0) => ({ key: to, label: <Link to={to}>{label}{badge(n)}</Link> });
  return [
    { key: '/admin', icon: SiderIcon.dashboard, label: <Link to="/admin">판매 현황</Link> },
    { key: 'g-product', icon: SiderIcon.sale, label: '상품·판매 관리', children: [L('/admin/plus-products', 'PLUS 상품'), L('/admin/products', '상품 관리', draft), L('/admin/categories', '카테고리', uncat)] },
    { key: 'g-order', icon: SiderIcon.coupon, label: '주문·쿠폰', children: [L('/admin/orders', '주문', unconfirmed), L('/admin/refunds', '환불', stuck), L('/admin/coupons', '발급 내역')] },
    { key: 'g-settle', icon: SiderIcon.settle, label: '정산', children: [L('/admin/settlements', '월별 정산')] },
    { key: 'g-cs', icon: SiderIcon.support, label: '고객 지원', children: [L('/admin/inquiries', '문의', inq)] },
    { key: 'g-sys', icon: SiderIcon.system, label: '시스템', children: [L('/admin/sync', 'PLUS 동기화')] },
  ];
}

function Shell() {
  const { pathname } = useLocation();
  const matches = useMatches();
  const nav = useNavigate();
  const name = useDB(s => s.admin.name);
  const [collapsed, setCollapsed] = useState(false);
  const crumb = (matches.map(m => (m.handle as Crumb | undefined)?.crumb).filter(Boolean).pop() ?? ['판매 현황']) as string[];
  // 상세 화면도 메뉴는 목록 항목에 불이 들어오게: /admin/orders/ON-... → /admin/orders
  const selected = pathname === '/admin' ? '/admin' : `/admin/${pathname.split('/')[2] ?? ''}`;
  // console처럼 지금 화면이 속한 묶음은 저절로 펼치고, 나머지 묶음은 운영자가 직접 여닫는다
  const items = useMenu();
  const group = items?.find(g => g && 'children' in g && g.children?.some(c => c?.key === selected))?.key as string | undefined;
  const [openKeys, setOpenKeys] = useState<string[]>(group ? [group] : []);
  useEffect(() => { if (group) setOpenKeys(k => (k.includes(group) ? k : [...k, group])); }, [group]);
  return (
    <Layout className="a-root" hasSider>
      {/* 쿠핀+ console 사이드바 (cims-ui CustomSider): 폭 256, 992px 이하나 [접기]로 72. 머리(로고·접기) · 메뉴 · 아래 사용자 영역 */}
      <Layout.Sider width={256} className="a-sider" breakpoint="lg" collapsedWidth={72} collapsed={collapsed} onBreakpoint={setCollapsed} trigger={null}>
        <div className="a-sider-head">
          {!collapsed && <Link to="/admin" className="a-logo" aria-label="쿠핀 ON 관리자 판매 현황"><img src={onLogo} alt="" width={125} height={22} /></Link>}
          <button type="button" className={`a-fold ${collapsed ? 'closed' : ''}`} onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? '메뉴 펼치기' : '메뉴 접기'}>
            {SiderIcon.fold}
          </button>
        </div>
        <div className="a-sider-menu">
          <Menu theme="dark" mode="inline" items={items} selectedKeys={[selected]} openKeys={collapsed ? undefined : openKeys} onOpenChange={setOpenKeys} />
        </div>
        <Dropdown trigger={['click']} placement="topRight" menu={{ items: [{ key: 'logout', icon: <LogoutOutlined />, label: '로그아웃', onClick: () => { adminLogout(); nav('/admin/login'); } }] }}>
          <button type="button" className="a-sider-user" aria-label={`${name} 님 계정 메뉴`}>
            {SiderIcon.user}
            {!collapsed && <><span className="nm"><b>{name}</b> 님</span><DownOutlined className="caret" /></>}
          </button>
        </Dropdown>
      </Layout.Sider>
      <Layout>
        <Layout.Header className="a-header">
          <Breadcrumb items={crumb.map(t => ({ title: t }))} />
          <span className="sp" />
          <Button icon={<MobileOutlined />} onClick={() => nav('/')}>고객 앱</Button>
        </Layout.Header>
        <Layout.Content className="a-content"><Outlet /></Layout.Content>
      </Layout>
    </Layout>
  );
}

/** antd 테마·한국어·메시지(App) 범위. 로그인 화면도 이 안에서 그린다 */
export function AdminProviders() {
  return (
    <ConfigProvider theme={adminTheme} locale={koKR}>
      <AntApp className="a-root"><Outlet /></AntApp>
    </ConfigProvider>
  );
}

export function AdminLayout() {
  return <RequireAdmin><Shell /></RequireAdmin>;
}
