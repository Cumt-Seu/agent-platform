// SSO OAuth2 回调页面

import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Spin, message } from 'antd';
import { useAuthStore } from '../../stores/useAuthStore';
import { authService } from '../../services/authService';
import type { UserRole } from '../../types';

const LoginCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const login = useAuthStore((s) => s.login);

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      message.error('SSO 登录失败: ' + error);
      navigate('/login', { replace: true });
      return;
    }

    if (!code) {
      message.error('缺少授权码');
      navigate('/login', { replace: true });
      return;
    }

    // 用授权码换取 Token
    (async () => {
      try {
        const result = await authService.login({
          username: '',
          password: '',
        }); // 实际项目中应调用 SSO callback 接口
        const user = await authService.getCurrentUser();
        login(
          result.token,
          user.username,
          user.realName,
          user.roles as UserRole[],
          user.permissions
        );
        message.success('登录成功');
        navigate('/chat', { replace: true });
      } catch {
        message.error('SSO 登录失败');
        navigate('/login', { replace: true });
      }
    })();
  }, [searchParams, login, navigate]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Spin size="large" tip="正在登录..." />
    </div>
  );
};

export default LoginCallback;
