import { AccountBookOutlined, AppstoreOutlined, BarChartOutlined, CustomerServiceOutlined, LogoutOutlined, MobileOutlined, SettingOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { App as AntApp, Breadcrumb, Button, ConfigProvider, Layout, Menu, type MenuProps } from 'antd';
import koKR from 'antd/locale/ko_KR';
import { Link, Outlet, useLocation, useMatches, useNavigate } from 'react-router-dom';
import { adminStatus } from '@/entities/product';
import { useDB } from '@/shared/api';
import '../styles/admin.css';
import { RequireAdmin } from '../router/RequireAdmin';
import { adminTheme } from './adminTheme';
import { adminLogout } from '@/features/admin-auth';

/** 라우트 handle: 브레드크럼 (메뉴 묶음 > 메뉴 > 상세) */
export type Crumb = { crumb: string[] };

const badge = (n: number) => (n ? <span className="a-menu-badge">{n}</span> : null);

/** 좌측 메뉴 (A-00-02): IA 묶음 구조 */
function useMenu(): MenuProps['items'] {
  const db = useDB();
  const draft = db.products.filter(p => adminStatus(db, p).k === 'draft').length;
  const uncat = db.products.filter(p => !p.cat).length;
  const unconfirmed = db.orders.filter(o => o.unconfirmed).length;
  const stuck = db.orders.filter(o => o.status === '환불 처리 중').length;
  const inq = db.inquiries.filter(q => q.status !== '답변 완료').length;
  const L = (to: string, label: string, n = 0) => ({ key: to, label: <Link to={to}>{label}{badge(n)}</Link> });
  return [
    { key: '/admin', icon: <BarChartOutlined />, label: <Link to="/admin">판매 현황</Link> },
    { key: 'g-product', icon: <AppstoreOutlined />, label: '상품·판매 관리', children: [L('/admin/plus-products', 'PLUS 상품'), L('/admin/products', '상품 관리', draft), L('/admin/categories', '카테고리', uncat)] },
    { key: 'g-order', icon: <ShoppingCartOutlined />, label: '주문·쿠폰', children: [L('/admin/orders', '주문', unconfirmed), L('/admin/refunds', '환불', stuck), L('/admin/coupons', '발급 내역')] },
    { key: 'g-settle', icon: <AccountBookOutlined />, label: '정산', children: [L('/admin/settlements', '월별 정산')] },
    { key: 'g-cs', icon: <CustomerServiceOutlined />, label: '고객 지원', children: [L('/admin/inquiries', '문의', inq)] },
    { key: 'g-sys', icon: <SettingOutlined />, label: '시스템', children: [L('/admin/sync', 'PLUS 동기화')] },
  ];
}

function Shell() {
  const { pathname } = useLocation();
  const matches = useMatches();
  const nav = useNavigate();
  const name = useDB(s => s.admin.name);
  const crumb = (matches.map(m => (m.handle as Crumb | undefined)?.crumb).filter(Boolean).pop() ?? ['판매 현황']) as string[];
  // 상세 화면도 메뉴는 목록 항목에 불이 들어오게: /admin/orders/ON-... → /admin/orders
  const selected = pathname === '/admin' ? '/admin' : `/admin/${pathname.split('/')[2] ?? ''}`;
  return (
    <Layout className="a-root" hasSider>
      <Layout.Sider width={220} className="a-sider" breakpoint="lg" collapsedWidth={0}>
        <div className="a-logo"><span className="mark">ON</span>ON 관리자</div>
        <Menu theme="dark" mode="inline" items={useMenu()} selectedKeys={[selected]} defaultOpenKeys={['g-product', 'g-order', 'g-settle', 'g-cs', 'g-sys']} />
      </Layout.Sider>
      <Layout>
        <Layout.Header className="a-header">
          <Breadcrumb items={crumb.map(t => ({ title: t }))} />
          <span className="sp" />
          <Button icon={<MobileOutlined />} onClick={() => nav('/')}>고객 앱</Button>
          <span className="a-user"><b>{name}</b> 님</span>
          <Button type="text" icon={<LogoutOutlined />} aria-label="로그아웃" onClick={() => { adminLogout(); nav('/admin/login'); }} />
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
