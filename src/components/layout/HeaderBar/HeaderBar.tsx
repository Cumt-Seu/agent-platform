// 顶部栏组件 — 全局搜索 + 通知轮询

import { Layout, Input, Badge, Avatar, Dropdown, Space, Popover, List, Button, Typography } from 'antd';
import {
  SearchOutlined,
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  SwapOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '../../../stores/useAppStore';
import { useAuthStore } from '../../../stores/useAuthStore';
import { formatRelativeTime } from '../../../utils/format';
import { usePolling } from '../../../hooks/usePolling';
import { notificationService } from '../../../services/notificationService';
import GlobalSearchModal from '../../common/GlobalSearchModal/GlobalSearchModal';
import type { Notification, UserRole } from '../../../types';

const { Header } = Layout;
const { Text } = Typography;

const HeaderBar: React.FC = () => {
  const navigate = useNavigate();
  const {
    sidebarCollapsed, toggleSidebar, notifications, unreadCount,
    markNotificationRead, markAllNotificationsRead,
  } = useAppStore();
  const { realName, role, roles, switchRole, logout } = useAuthStore();
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  // 30s 轮询通知未读数
  const fetchNotifications = useCallback(async () => {
    try {
      const result = await notificationService.list({ pageSize: 20 });
      useAppStore.getState().setNotifications(result);
    } catch {
      // ignore
    }
  }, []);

  usePolling(fetchNotifications, { interval: 30000, enabled: true, immediate: true });

  // Ctrl+K 全局搜索快捷键
  useEffect(() => {
    const handler = () => setSearchModalOpen(true);
    window.addEventListener('open-global-search', handler);
    return () => window.removeEventListener('open-global-search', handler);
  }, []);

  const handleNotificationClick = (notification: Notification) => {
    markNotificationRead(notification.id);
    notificationService.markRead(notification.id);
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const handleMarkAllRead = () => {
    markAllNotificationsRead();
    notificationService.markAllRead();
  };

  const userMenuItems = [
    { key: 'settings', icon: <SettingOutlined />, label: '个人设置' },
    {
      key: 'switchRole',
      icon: <SwapOutlined />,
      label: '角色切换',
      children: roles.map((r: string) => ({
        key: r,
        label: r,
        onClick: () => switchRole(r as UserRole),
      })),
    },
    { type: 'divider' as const },
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', danger: true },
  ];

  const notificationContent = (
    <div style={{ width: 360 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Text strong>通知</Text>
        <Button type="link" size="small" onClick={handleMarkAllRead}>全部已读</Button>
      </div>
      <List
        dataSource={notifications.slice(0, 20)}
        renderItem={(item: Notification) => (
          <List.Item
            style={{ cursor: 'pointer', padding: '8px 0' }}
            onClick={() => handleNotificationClick(item)}
          >
            <List.Item.Meta
              title={<Text style={{ fontWeight: item.read ? 400 : 600 }}>{item.title}</Text>}
              description={<Text type="secondary" style={{ fontSize: 12 }}>{formatRelativeTime(item.time)}</Text>}
            />
          </List.Item>
        )}
        style={{ maxHeight: 400, overflow: 'auto' }}
      />
    </div>
  );

  return (
    <>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          background: '#fff',
          borderBottom: '1px solid #F0F0F0',
          height: 56,
        }}
      >
        {/* 左侧：折叠按钮 + Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Button
            type="text"
            icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={toggleSidebar}
          />
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
            onClick={() => navigate('/chat')}
          >
            <div
              style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'linear-gradient(135deg, #1677FF 0%, #69B1FF 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 600,
              }}
            >
              AI
            </div>
            <Text strong style={{ fontSize: 16 }}>研发智能体平台</Text>
          </div>
        </div>

        {/* 中部：全局搜索 */}
        <Input
          placeholder="搜索技能、知识库、历史会话... (Ctrl+K)"
          prefix={<SearchOutlined style={{ color: '#8C8C8C' }} />}
          style={{ width: 400, borderRadius: 6 }}
          onClick={() => setSearchModalOpen(true)}
          readOnly
        />

        {/* 右侧：通知 + 用户菜单 */}
        <Space size={16}>
          <Popover
            content={notificationContent}
            trigger="click"
            placement="bottomRight"
            arrow={false}
          >
            <Badge count={unreadCount} size="small" offset={[-2, 2]}>
              <Button type="text" icon={<BellOutlined style={{ fontSize: 18 }} />} />
            </Badge>
          </Popover>

          <Dropdown
            menu={{
              items: userMenuItems,
              onClick: ({ key }) => {
                if (key === 'settings') {
                  navigate('/settings');
                } else if (key === 'logout') {
                  logout();
                  navigate('/login');
                }
              },
            }}
            placement="bottomRight"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1677FF' }} />
              <div style={{ lineHeight: 1.2 }}>
                <Text style={{ display: 'block', fontSize: 14 }}>{realName || '用户'}</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>{role || '未设置角色'}</Text>
              </div>
            </div>
          </Dropdown>
        </Space>
      </Header>

      {/* 全局搜索 Modal */}
      <GlobalSearchModal
        open={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
    </>
  );
};

export default HeaderBar;
