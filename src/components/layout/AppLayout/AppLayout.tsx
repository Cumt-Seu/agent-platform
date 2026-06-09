// 应用主布局组件

import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import SideNav from '../SideNav';
import HeaderBar from '../HeaderBar';
import StatusBar from '../StatusBar';
import { CONTENT_PADDING } from '../../../utils/constants';

const { Content } = Layout;

const AppLayout: React.FC = () => {
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
