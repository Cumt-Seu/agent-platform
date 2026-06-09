// Ant Design 主题 Token 配置

import type { ThemeConfig } from 'antd';

const theme: ThemeConfig = {
  token: {
    // 品牌主色
    colorPrimary: '#1677FF',
    colorInfo: '#1677FF',
    colorSuccess: '#52C41A',
    colorWarning: '#FAAD14',
    colorError: '#FF4D4F',

    // 字体
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC', 'Microsoft YaHei', sans-serif",
    fontSize: 14,

    // 圆角
    borderRadius: 6,
    borderRadiusLG: 8,

    // 间距
    padding: 16,
    paddingLG: 24,
    paddingXS: 8,
    paddingSM: 12,

    // 阴影
    boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
    boxShadowSecondary: '0 4px 12px rgba(0,0,0,0.08)',

    // 控件高度
    controlHeight: 32,
  },
  components: {
    Card: {
      borderRadiusLG: 8,
      boxShadowTertiary: '0 1px 2px rgba(0,0,0,0.06)',
    },
    Modal: {
      borderRadiusLG: 8,
    },
    Button: {
      borderRadius: 6,
    },
    Input: {
      borderRadius: 6,
    },
    Select: {
      borderRadius: 6,
    },
  },
};

export default theme;
