// 侧边导航组件 — 根据 permissions 过滤菜单项

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
import { useAuthStore } from '../../../stores/useAuthStore';
import { SIDEBAR_WIDTH_EXPANDED, SIDEBAR_WIDTH_COLLAPSED } from '../../../utils/constants';

const { Sider } = Layout;

interface MenuItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  permission?: string; // resource:action 格式
}

const allMenuItems: MenuItem[] = [
  { key: '/chat', icon: <MessageOutlined />, label: '智能对话', permission: 'chat:read' },
  { key: '/skills', icon: <ThunderboltOutlined />, label: '技能管理', permission: 'skill:read' },
  { key: '/knowledge', icon: <BookOutlined />, label: '知识库', permission: 'knowledge:read' },
  { key: '/review', icon: <AuditOutlined />, label: '代码评审', permission: 'review:read' },
  { key: '/diagnosis', icon: <ToolOutlined />, label: '故障排障', permission: 'diagnosis:read' },
  { key: '/finetune', icon: <AimOutlined />, label: '模型微调', permission: 'finetune:read' },
  { key: '/metrics', icon: <DashboardOutlined />, label: '效能度量', permission: 'metrics:read' },
  { key: '/settings', icon: <SettingOutlined />, label: '系统设置', permission: 'settings:read' },
];

const SideNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const collapsed = useAppStore((s: { sidebarCollapsed: boolean }) => s.sidebarCollapsed);
  const permissions = useAuthStore((s) => s.permissions);

  // 根据 permissions 过滤菜单
  const hasPermission = (perm?: string): boolean => {
    if (!perm) return true;
    if (permissions.includes('*')) return true;
    return permissions.includes(perm);
  };

  const menuItems = allMenuItems
    .filter((item) => hasPermission(item.permission))
    .map(({ permission: _, ...item }) => item);

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
