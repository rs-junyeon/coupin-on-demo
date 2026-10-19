// antd 5 테마: 쿠핀+ 관리자 웹(plus-admin-web) 구조 + 쿠핀 컬러 시스템 ON 색
// 주요 버튼은 Lime 500 바탕에 Lime 900 글자 (컬러 시스템 Positive Button 500·900)
import type { ThemeConfig } from 'antd';

export const adminTheme: ThemeConfig = {
  token: {
    fontFamily: '"Pretendard", "Pretendard Variable", -apple-system, system-ui, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif',
    colorPrimary: '#7FA557', colorLink: '#3F82BC', colorSuccess: '#3FA597', colorWarning: '#F5B544', colorError: '#E55F6B', colorInfo: '#7CCBFF',
    colorText: '#10162E', colorTextSecondary: '#3F4866', colorTextTertiary: '#8B92A8', colorTextQuaternary: '#B8BECC',
    colorBorder: '#D0D2E0', colorBorderSecondary: '#E8E9F3', colorBgLayout: '#F4F5FA', colorFillAlter: '#F8FAFC',
    borderRadius: 6, fontSize: 14, controlHeight: 36,
  },
  components: {
    Layout: { siderBg: '#24324A', headerBg: '#FFFFFF', bodyBg: '#F4F5FA', headerHeight: 64, headerPadding: '0 32px' },
    Menu: {
      darkItemBg: '#24324A', darkSubMenuItemBg: '#24324A', darkPopupBg: '#24324A',
      darkItemColor: 'rgba(255,255,255,.62)', darkItemHoverColor: '#FFFFFF', darkItemHoverBg: 'rgba(255,255,255,.12)',
      darkItemSelectedBg: 'rgba(255,255,255,.08)', darkItemSelectedColor: '#FFFFFF',
      itemHeight: 40, itemBorderRadius: 6, subMenuItemBorderRadius: 6, iconSize: 18, itemMarginInline: 12,
    },
    Button: { colorPrimary: '#C3E89E', colorPrimaryHover: '#B6DE8B', colorPrimaryActive: '#A3CC7A', primaryColor: '#3C5325', primaryShadow: 'none', defaultShadow: 'none', dangerShadow: 'none', fontWeight: 600 },
    Table: { headerBg: '#F8FAFC', headerColor: '#5E6782', headerSplitColor: 'transparent', rowHoverBg: '#F4FBEC', borderColor: '#E8E9F3', cellPaddingBlock: 10, cellPaddingInline: 10 },
    Tabs: { inkBarColor: '#7FA557', itemSelectedColor: '#10162E', itemHoverColor: '#3F4866', itemColor: '#8B92A8', titleFontSize: 15, horizontalItemPadding: '14px 0' },
    Radio: { buttonCheckedBg: '#F4FBEC', buttonSolidCheckedBg: '#C3E89E', buttonSolidCheckedColor: '#3C5325' },
    Card: { headerFontSize: 16, borderRadiusLG: 12 },
    Modal: { titleFontSize: 16 },
    Pagination: { itemActiveBg: '#C3E89E' },
  },
};
