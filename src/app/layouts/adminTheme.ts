// antd 5 테마 (DESIGN.md 8.1): 쿠핀+ console(app.tsx)과 같은 구조에 ON 색. 솔리드·폼 요소 = Mint 800, 그라데이션·다크 면은 admin.css
// 색 값은 app/styles/tokens.css와 같아야 한다 (adminTheme.test.ts가 확인)
import type { ThemeConfig } from 'antd';

export const adminTheme: ThemeConfig = {
  token: {
    fontFamily: '"Pretendard Variable", Pretendard, -apple-system, system-ui, Roboto, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif',
    colorPrimary: '#1E7B76', colorLink: '#1E7B76', colorLinkHover: '#0A4F4E',
    // 선택 배경 (표 체크된 행, Select 고른 항목). 자동 계산하면 짙은 primary에서 탁한 회색이 나와 Mint 100·200으로 정한다
    colorPrimaryBg: '#D1F9F2', colorPrimaryBgHover: '#B7F6EC',
    colorSuccess: '#3FA597', colorWarning: '#F5B544', colorError: '#E55F6B', colorInfo: '#7CCBFF',
    colorText: '#10162E', colorTextSecondary: '#3F4866', colorTextTertiary: '#8B92A8', colorTextQuaternary: '#B0B4C8',
    colorBorder: '#D0D2E0', colorBorderSecondary: '#E8E9F3', colorBgLayout: '#F8FAFC', colorFillAlter: '#F8FAFC',
    borderRadius: 6, borderRadiusLG: 12, fontSize: 14, controlHeight: 36,
  },
  components: {
    Layout: { siderBg: '#161F27', triggerBg: '#161F27', headerBg: '#FFFFFF', bodyBg: '#F8FAFC', headerHeight: 64, headerPadding: '0 72px' },
    Menu: {
      darkItemBg: '#161F27', darkSubMenuItemBg: '#161F27', darkPopupBg: '#161F27',
      darkItemColor: '#ACACAC', darkItemHoverColor: '#7FE7D8', darkItemHoverBg: 'rgba(255, 255, 255, 0.12)',
      darkItemSelectedBg: 'rgba(255, 255, 255, 0.06)', darkItemSelectedColor: '#FFFFFF',
      itemHeight: 48, itemBorderRadius: 6, subMenuItemBorderRadius: 6, iconSize: 24, collapsedIconSize: 24, iconMarginInlineEnd: 10, itemMarginInline: 0,
    },
    Button: { primaryShadow: 'none', defaultShadow: 'none', dangerShadow: 'none', fontWeight: 600 },
    Table: { headerBg: '#FBFBFB', headerColor: '#5E6280', headerSplitColor: 'transparent', headerBorderRadius: 0, rowHoverBg: '#E9FCF9', borderColor: '#E8E9F3', cellPaddingBlock: 12, cellPaddingInline: 12 },
    Tabs: { inkBarColor: '#1E7B76', itemSelectedColor: '#10162E', itemHoverColor: '#0A4F4E', itemColor: '#5E6280', titleFontSize: 15, horizontalItemPadding: '14px 0' },
    Radio: { buttonCheckedBg: '#E9FCF9', buttonSolidCheckedBg: '#1E7B76', buttonSolidCheckedHoverBg: '#0A4F4E' },
    Card: { headerFontSize: 16 },
    Modal: { titleFontSize: 18 },
    Tag: { defaultBg: '#F0F1F8', defaultColor: '#3F4866' },
  },
};
