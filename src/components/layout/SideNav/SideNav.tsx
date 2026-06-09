// 侧边导航组件

import { Layout, Menu } from 'antd';
import {
  MessageOutlined,
  ThunderboltOutlined,
  BookOutlined,
  AuditOutlined,
  ToolOutlined,
  AimOutlined,
  DashboardOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../../../stores/useAppStore';
import { SIDEBAR_WIDTH_EXPANDED, SIDEBAR_WIDTH_COLLAPSED } from '../../../utils/constants';

const { Sider } = Layout;

const menuItems = [
  { key: '/chat', icon: <MessageOutlined />, label: '智能对话' },
  { key: '/skills', icon: <ThunderboltOutlined />, label: '技能管理' },
  { key: '/knowledge', icon: <BookOutlined />, label: '知识库' },
  { key: '/review', icon: <AuditOutlined />, label: '代码评审' },
  { key: '/diagnosis', icon: <ToolOutlined />, label: '故障排障' },
  { key: '/finetune', icon: <AimOutlined />, label: '模型微调' },
  { key: '/metrics', icon: <DashboardOutlined />, label: '效能度量' },
  { key: '/settings', icon: <SettingOutlined />, label: '系统设置' },
];

const SideNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const collapsed = useAppStore((s: { sidebarCollapsed: boolean }) => s.sidebarCollapsed);

  // 匹配当前路由到菜单项
  const selectedKey = menuItems.find((item) =>
    location.pathname.startsWith(item.key)
  )?.key || '/chat';

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      trigger={null}
      width={SIDEBAR_WIDTH_EXPANDED}
      collapsedWidth={SIDEBAR_WIDTH_COLLAPSED}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'sticky',
        top: 0,
        left: 0,
        background: '#fff',
        borderRight: '1px solid #F0F0F0',
      }}
    >
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
        style={{
          borderRight: 0,
          marginTop: 8,
        }}
      />
    </Sider>
  );
};

export default SideNav;
