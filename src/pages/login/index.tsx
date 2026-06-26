// 登录页面

import { Form, Input, Button, Checkbox, Card, message, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import { authService } from '../../services/authService';
import type { LoginParams } from '../../services/authService';
import type { UserRole } from '../../types';

const { Text } = Typography;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const login = useAuthStore((s) => s.login);
  const redirect = searchParams.get('redirect') || '/chat';

  const onFinish = async (values: LoginParams) => {
    try {
      const result = await authService.login(values);
      // 获取当前用户信息
      const user = await authService.getCurrentUser();
      login(
        result.token,
        user.username,
        user.realName,
        user.roles as UserRole[],
        user.permissions
      );
      message.success('登录成功');
      navigate(redirect, { replace: true });
    } catch {
      message.error('登录失败，请检查用户名和密码');
    }
  };

  const handleSSO = () => {
    window.location.href = '/api/v1/auth/sso/redirect';
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Card
        style={{
          width: 400,
          borderRadius: 12,
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        }}
        styles={{ body: { padding: '40px 32px' } }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #1677FF 0%, #69B1FF 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 24,
              fontWeight: 600,
              marginBottom: 16,
            }}
          >
            AI
          </div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>
            企业研发智能体平台
          </h2>
          <p style={{ margin: '8px 0 0', color: '#8C8C8C', fontSize: 14 }}>
            登录以继续使用
          </p>
        </div>

        <Form<LoginParams>
          onFinish={onFinish}
          initialValues={{ username: 'admin', password: 'admin123', rememberMe: true }}
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#BFBFBF' }} />}
              placeholder="用户名"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#BFBFBF' }} />}
              placeholder="密码"
            />
          </Form.Item>

          <Form.Item name="rememberMe" valuePropName="checked">
            <Checkbox>记住我</Checkbox>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              style={{ height: 44, fontSize: 16 }}
            >
              登录
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <Button type="link" onClick={handleSSO}>
              SSO 单点登录
            </Button>
          </div>

          {/* Mock 账号提示 */}
          <div
            style={{
              background: '#F6F6F6',
              borderRadius: 8,
              padding: '12px 16px',
              fontSize: 12,
              lineHeight: '20px',
            }}
          >
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
              演示账号（后端未就绪时自动启用）:
            </Text>
            <Text code style={{ fontSize: 11 }}>admin / admin123</Text>
            <Text type="secondary" style={{ fontSize: 11, margin: '0 8px' }}>管理员</Text>
            <br />
            <Text code style={{ fontSize: 11 }}>zhangsan / 123456</Text>
            <Text type="secondary" style={{ fontSize: 11, margin: '0 8px' }}>开发</Text>
            <br />
            <Text code style={{ fontSize: 11 }}>lisi / 123456</Text>
            <Text type="secondary" style={{ fontSize: 11, margin: '0 8px' }}>架构师</Text>
            <br />
            <Text code style={{ fontSize: 11 }}>wangwu / 123456</Text>
            <Text type="secondary" style={{ fontSize: 11, margin: '0 8px' }}>运维</Text>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;
