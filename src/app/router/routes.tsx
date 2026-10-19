import type { ReactElement } from 'react';
import { createBrowserRouter, Navigate, type RouteObject } from 'react-router-dom';
import type { Crumb } from '../layouts/AdminLayout';
import { RequireLogin } from './RequireLogin';
import { CustomerLayout } from '../layouts/CustomerLayout';
import { AccountDeletePage } from '@/pages/customer/account-delete';
import { CheckoutPage } from '@/pages/customer/checkout';
import { CompletePage } from '@/pages/customer/complete';
import { CouponViewPage } from '@/pages/customer/coupon';
import { DocsPage } from '@/pages/customer/docs';
import { FailPage } from '@/pages/customer/fail';
import { FindAccountPage } from '@/pages/customer/find-account';
import { HomePage } from '@/pages/customer/home';
import { InquiriesPage } from '@/pages/customer/inquiries';
import { InquiryDetailPage } from '@/pages/customer/inquiry-detail';
import { InquiryNewPage } from '@/pages/customer/inquiry-new';
import { LoginPage } from '@/pages/customer/login';
import { MyPage } from '@/pages/customer/my';
import { OrderDetailPage } from '@/pages/customer/order-detail';
import { OrdersPage } from '@/pages/customer/orders';
import { PgPayPage } from '@/pages/customer/pg-pay';
import { ProductDetailPage } from '@/pages/customer/product-detail';
import { ProfilePage } from '@/pages/customer/profile';
import { SearchPage } from '@/pages/customer/search';
import { SettingsPage } from '@/pages/customer/settings';
import { SignupPage } from '@/pages/customer/signup';
import { SocialConsentPage } from '@/pages/customer/social-consent';
import { SocialPhonePage } from '@/pages/customer/social-phone';
import { StoreDetailPage } from '@/pages/customer/store-detail';
import { StoresPage } from '@/pages/customer/stores';
import { WalletPage } from '@/pages/customer/wallet';
import { WithdrawPage } from '@/pages/customer/withdraw';
import { NotFound } from '@/shared/ui/mobile';

const c = (...crumb: string[]): Crumb => ({ crumb });
/** 관리자(antd)는 화면마다 나눠 불러온다. 고객 모바일 웹은 관리자 코드를 내려받지 않는다 */
const ADMIN = {
  Login: () => import('@/pages/admin/login').then(m => m.LoginPage),
  Dashboard: () => import('@/pages/admin/dashboard').then(m => m.DashboardPage),
  PlusProducts: () => import('@/pages/admin/plus-products').then(m => m.PlusProductsPage),
  PlusProductDetail: () => import('@/pages/admin/plus-product-detail').then(m => m.PlusProductDetailPage),
  Products: () => import('@/pages/admin/products').then(m => m.ProductsPage),
  Terms: () => import('@/pages/admin/terms').then(m => m.TermsPage),
  Categories: () => import('@/pages/admin/categories').then(m => m.CategoriesPage),
  Orders: () => import('@/pages/admin/orders').then(m => m.OrdersPage),
  OrderDetail: () => import('@/pages/admin/order-detail').then(m => m.OrderDetailPage),
  Refunds: () => import('@/pages/admin/refunds').then(m => m.RefundsPage),
  Coupons: () => import('@/pages/admin/coupons').then(m => m.CouponsPage),
  CouponDetail: () => import('@/pages/admin/coupon-detail').then(m => m.CouponDetailPage),
  Settlements: () => import('@/pages/admin/settlements').then(m => m.SettlementsPage),
  SettlementDetail: () => import('@/pages/admin/settlement-detail').then(m => m.SettlementDetailPage),
  Inquiries: () => import('@/pages/admin/inquiries').then(m => m.InquiriesPage),
  Sync: () => import('@/pages/admin/sync').then(m => m.SyncPage),
};
const A = (page: keyof typeof ADMIN): Pick<RouteObject, 'lazy'> => ({ lazy: async () => ({ Component: await ADMIN[page]() }) });
const L = (el: ReactElement) => <RequireLogin>{el}</RequireLogin>;

/** 고객 앱 `/` (모바일 웹), 관리자 `/admin` (웹) */
export const routes: RouteObject[] = [
  {
    path: '/admin',
    lazy: async () => ({ Component: (await import('../layouts/AdminLayout')).AdminProviders }),
    hydrateFallbackElement: <p className="page-loading">관리자 화면을 불러오고 있어요</p>,
    children: [
      { path: 'login', ...A('Login') },
      {
        lazy: async () => ({ Component: (await import('../layouts/AdminLayout')).AdminLayout }),
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
      { index: true, element: <HomePage /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'stores', element: <StoresPage /> },
      { path: 'stores/:sid', element: <StoreDetailPage /> },
      { path: 'products/:pid', element: <ProductDetailPage /> },
      { path: 'checkout/:pid', element: L(<CheckoutPage />) },
      { path: 'pay/:pid', element: L(<PgPayPage />) },
      { path: 'complete/:cid', element: L(<CompletePage />) },
      { path: 'fail/:pid', element: L(<FailPage />) },
      { path: 'wallet', element: L(<WalletPage />) },
      { path: 'coupons/:cid', element: L(<CouponViewPage />) },
      { path: 'my', element: L(<MyPage />) },
      { path: 'my/orders', element: L(<OrdersPage />) },
      { path: 'my/orders/:oid', element: L(<OrderDetailPage />) },
      { path: 'my/profile', element: L(<ProfilePage />) },
      { path: 'my/withdraw', element: L(<WithdrawPage />) },
      { path: 'my/inquiries', element: L(<InquiriesPage />) },
      { path: 'my/inquiries/new', element: L(<InquiryNewPage />) },
      { path: 'my/inquiries/:qid', element: L(<InquiryDetailPage />) },
      { path: 'my/settings', element: L(<SettingsPage />) },
      { path: 'docs/:key', element: <DocsPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'signup', element: <SignupPage /> },
      { path: 'find-account', element: <FindAccountPage /> },
      { path: 'oauth/:prov', element: <SocialConsentPage /> },
      { path: 'oauth/:prov/phone', element: <SocialPhonePage /> },
      { path: 'account/delete', element: <AccountDeletePage /> },
      { path: '*', element: <NotFound /> },
    ],
  },
];

export const router = createBrowserRouter(routes);
