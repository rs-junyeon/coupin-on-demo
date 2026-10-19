import type { ReactElement } from 'react';
import { createBrowserRouter, Navigate, type RouteObject } from 'react-router-dom';
import type { Crumb } from './admin/AdminLayout';
import { RequireLogin } from './customer/components/RequireLogin';
import { CustomerLayout } from './customer/CustomerLayout';
import AccountDelete from './customer/pages/AccountDelete';
import Checkout from './customer/pages/Checkout';
import Complete from './customer/pages/Complete';
import CouponView from './customer/pages/CouponView';
import Docs from './customer/pages/Docs';
import Fail from './customer/pages/Fail';
import FindAccount from './customer/pages/FindAccount';
import Home from './customer/pages/Home';
import Inquiries from './customer/pages/Inquiries';
import InquiryDetail from './customer/pages/InquiryDetail';
import InquiryNew from './customer/pages/InquiryNew';
import Login from './customer/pages/Login';
import My from './customer/pages/My';
import NotFound from './customer/pages/NotFound';
import OrderDetail from './customer/pages/OrderDetail';
import Orders from './customer/pages/Orders';
import PgPay from './customer/pages/PgPay';
import ProductDetail from './customer/pages/ProductDetail';
import Profile from './customer/pages/Profile';
import Search from './customer/pages/Search';
import Settings from './customer/pages/Settings';
import Signup from './customer/pages/Signup';
import SocialConsent from './customer/pages/SocialConsent';
import SocialPhone from './customer/pages/SocialPhone';
import StoreDetail from './customer/pages/StoreDetail';
import Stores from './customer/pages/Stores';
import Wallet from './customer/pages/Wallet';
import Withdraw from './customer/pages/Withdraw';

const c = (...crumb: string[]): Crumb => ({ crumb });
/** 관리자(antd)는 화면마다 나눠 불러온다. 고객 모바일 웹은 관리자 코드를 내려받지 않는다 */
const A = (page: string): Pick<RouteObject, 'lazy'> => ({ lazy: async () => ({ Component: (await import(`./admin/pages/${page}.tsx`)).default }) });
const L = (el: ReactElement) => <RequireLogin>{el}</RequireLogin>;

/** 고객 앱 `/` (모바일 웹), 관리자 `/admin` (웹) */
export const routes: RouteObject[] = [
  {
    path: '/admin',
    lazy: async () => ({ Component: (await import('./admin/AdminLayout')).AdminProviders }),
    hydrateFallbackElement: <p className="page-loading">관리자 화면을 불러오고 있어요</p>,
    children: [
      { path: 'login', ...A('Login') },
      {
        lazy: async () => ({ Component: (await import('./admin/AdminLayout')).AdminLayout }),
        children: [
          { index: true, ...A('Dashboard'), handle: c('판매 현황') },
          { path: 'plus-products', ...A('PlusProducts'), handle: c('상품·판매 관리', 'PLUS 상품') },
          { path: 'plus-products/:pid', ...A('PlusProductDetail'), handle: c('상품·판매 관리', 'PLUS 상품', '상품 상세') },
          { path: 'products', ...A('Products'), handle: c('상품·판매 관리', '상품 관리') },
          { path: 'products/:pid/terms', ...A('Terms'), handle: c('상품·판매 관리', '상품 관리', '판매 조건') },
          { path: 'categories', ...A('Categories'), handle: c('상품·판매 관리', '카테고리') },
          { path: 'orders', ...A('Orders'), handle: c('주문·쿠폰', '주문') },
          { path: 'orders/:oid', ...A('OrderDetail'), handle: c('주문·쿠폰', '주문', '주문 상세') },
          { path: 'refunds', ...A('Refunds'), handle: c('주문·쿠폰', '환불') },
          { path: 'coupons', ...A('Coupons'), handle: c('주문·쿠폰', '발급 내역') },
          { path: 'coupons/:cid', ...A('CouponDetail'), handle: c('주문·쿠폰', '발급 내역', '쿠폰 상세') },
          { path: 'settlements', ...A('Settlements'), handle: c('정산', '월별 정산') },
          { path: 'settlements/:month', ...A('SettlementDetail'), handle: c('정산', '월별 정산', '정산 상세') },
          { path: 'inquiries', ...A('Inquiries'), handle: c('고객 지원', '문의') },
          { path: 'sync', ...A('Sync'), handle: c('시스템', 'PLUS 동기화') },
          { path: '*', element: <Navigate to="/admin" replace /> },
        ],
      },
    ],
  },
  {
    path: '/',
    element: <CustomerLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'search', element: <Search /> },
      { path: 'stores', element: <Stores /> },
      { path: 'stores/:sid', element: <StoreDetail /> },
      { path: 'products/:pid', element: <ProductDetail /> },
      { path: 'checkout/:pid', element: L(<Checkout />) },
      { path: 'pay/:pid', element: L(<PgPay />) },
      { path: 'complete/:cid', element: L(<Complete />) },
      { path: 'fail/:pid', element: L(<Fail />) },
      { path: 'wallet', element: L(<Wallet />) },
      { path: 'coupons/:cid', element: L(<CouponView />) },
      { path: 'my', element: L(<My />) },
      { path: 'my/orders', element: L(<Orders />) },
      { path: 'my/orders/:oid', element: L(<OrderDetail />) },
      { path: 'my/profile', element: L(<Profile />) },
      { path: 'my/withdraw', element: L(<Withdraw />) },
      { path: 'my/inquiries', element: L(<Inquiries />) },
      { path: 'my/inquiries/new', element: L(<InquiryNew />) },
      { path: 'my/inquiries/:qid', element: L(<InquiryDetail />) },
      { path: 'my/settings', element: L(<Settings />) },
      { path: 'docs/:key', element: <Docs /> },
      { path: 'login', element: <Login /> },
      { path: 'signup', element: <Signup /> },
      { path: 'find-account', element: <FindAccount /> },
      { path: 'oauth/:prov', element: <SocialConsent /> },
      { path: 'oauth/:prov/phone', element: <SocialPhone /> },
      { path: 'account/delete', element: <AccountDelete /> },
      { path: '*', element: <NotFound /> },
    ],
  },
];

export const router = createBrowserRouter(routes);
