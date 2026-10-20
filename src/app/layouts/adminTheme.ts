// antd 5 테마 (DESIGN.md 8.1): 쿠핀+ console(app.tsx)과 같은 구조에 ON 색. 솔리드·폼 요소 = Lime 800, 그라데이션·다크 면은 admin.css
// 색 값은 app/styles/tokens.css와 같아야 한다 (adminTheme.test.ts가 확인)
import type { ThemeConfig } from 'antd';

export const adminTheme: ThemeConfig = {
  token: {
    fontFamily: '"Pretendard Variable", Pretendard, -apple-system, system-ui, Roboto, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif',
    colorPrimary: '#378247', colorLink: '#378247', colorLinkHover: '#1B5431',
    colorSuccess: '#3FA597', colorWarning: '#F5B544', colorError: '#E55F6B', colorInfo: '#7CCBFF',
    colorText: '#10162E', colorTextSecondary: '#3F4866', colorTextTertiary: '#8B92A8', colorTextQuaternary: '#B0B4C8',
    colorBorder: '#D0D2E0', colorBorderSecondary: '#E8E9F3', colorBgLayout: '#F8FAFC', colorFillAlter: '#F8FAFC',
    borderRadius: 6, borderRadiusLG: 12, fontSize: 14, controlHeight: 36,
  },
  components: {
    Layout: { siderBg: '#161F27', triggerBg: '#161F27', headerBg: '#FFFFFF', bodyBg: '#F8FAFC', headerHeight: 64, headerPadding: '0 72px' },
    Menu: {
      darkItemBg: '#161F27', darkSubMenuItemBg: '#161F27', darkPopupBg: '#161F27',
      darkItemColor: '#ACACAC', darkItemHoverColor: '#C3E89E', darkItemHoverBg: 'rgba(255, 255, 255, 0.12)',
      darkItemSelectedBg: 'rgba(255, 255, 255, 0.06)', darkItemSelectedColor: '#FFFFFF',
      itemHeight: 48, itemBorderRadius: 6, subMenuItemBorderRadius: 6, iconSize: 24, collapsedIconSize: 24, iconMarginInlineEnd: 10, itemMarginInline: 0,
    },
    Button: { primaryShadow: 'none', defaultShadow: 'none', dangerShadow: 'none', fontWeight: 600 },
    Table: { headerBg: '#FBFBFB', headerColor: '#5E6280', headerSplitColor: 'transparent', headerBorderRadius: 0, rowHoverBg: '#F2FCE7', borderColor: '#E8E9F3', cellPaddingBlock: 12, cellPaddingInline: 12 },
    Tabs: { inkBarColor: '#378247', itemSelectedColor: '#10162E', itemHoverColor: '#1B5431', itemColor: '#5E6280', titleFontSize: 15, horizontalItemPadding: '14px 0' },
    Radio: { buttonCheckedBg: '#F2FCE7', buttonSolidCheckedBg: '#378247', buttonSolidCheckedHoverBg: '#1B5431' },
    Card: { headerFontSize: 16 },
    Modal: { titleFontSize: 18 },
    Tag: { defaultBg: '#F0F1F8', defaultColor: '#3F4866' },
  },
};
