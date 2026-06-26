// 应用主布局组件 — 包含 AuthGuard

import { Layout } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import SideNav from '../SideNav';
import HeaderBar from '../HeaderBar';
import StatusBar from '../StatusBar';
import { CONTENT_PADDING } from '../../../utils/constants';
import { useAuthStore } from '../../../stores/useAuthStore';

const { Content } = Layout;

const AppLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // AuthGuard: 未登录重定向
  useEffect(() => {
    if (!isAuthenticated) {
      const redirect = encodeURIComponent(location.pathname + location.search);
      navigate(`/login?redirect=${redirect}`, { replace: true });
    }
  }, [isAuthenticated, location.pathname, location.search, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout style={{ height: '100vh', overflow: 'hidden' }}>
      <HeaderBar />
      <Layout style={{ overflow: 'hidden' }}>
        <SideNav />
        <Layout style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Content
            style={{
              padding: CONTENT_PADDING,
              overflow: 'auto',
              flex: 1,
              background: '#F5F5F5',
            }}
          >
            <Outlet />
          </Content>
          <StatusBar />
        </Layout>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
