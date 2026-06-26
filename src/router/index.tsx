// 路由配置

import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';

// 页面组件懒加载
import { lazy, Suspense } from 'react';
import { Spin } from 'antd';

const LoginPage = lazy(() => import('../pages/login'));
const LoginCallback = lazy(() => import('../pages/login/callback'));
const ChatPage = lazy(() => import('../pages/chat'));
const SkillPage = lazy(() => import('../pages/skill'));
const KnowledgePage = lazy(() => import('../pages/knowledge'));
const ReviewPage = lazy(() => import('../pages/review'));
const DiagnosisPage = lazy(() => import('../pages/diagnosis'));
const FinetunePage = lazy(() => import('../pages/finetune'));
const MetricsPage = lazy(() => import('../pages/metrics'));
const SettingsPage = lazy(() => import('../pages/settings'));

// 懒加载包装器
const LazyPage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense
    fallback={
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Spin size="large" />
      </div>
    }
  >
    {children}
  </Suspense>
);

const router = createBrowserRouter([
  // 登录路由 — AppLayout 之外
  {
    path: '/login',
    element: (
      <LazyPage>
        <LoginPage />
      </LazyPage>
    ),
  },
  {
    path: '/login/callback',
    element: (
      <LazyPage>
        <LoginCallback />
      </LazyPage>
    ),
  },
  // 主应用路由
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/chat" replace />,
      },
      {
        path: 'chat',
        element: (
          <LazyPage>
            <ChatPage />
          </LazyPage>
        ),
      },
      {
        path: 'chat/:sessionId',
        element: (
          <LazyPage>
            <ChatPage />
          </LazyPage>
        ),
      },
      {
        path: 'skills',
        element: (
          <LazyPage>
            <SkillPage />
          </LazyPage>
        ),
      },
      {
        path: 'skills/:skillId',
        element: (
          <LazyPage>
            <SkillPage />
          </LazyPage>
        ),
      },
      {
        path: 'knowledge',
        element: (
          <LazyPage>
            <KnowledgePage />
          </LazyPage>
        ),
      },
      {
        path: 'knowledge/:kbId',
        element: (
          <LazyPage>
            <KnowledgePage />
          </LazyPage>
        ),
      },
      {
        path: 'knowledge/:kbId/documents',
        element: (
          <LazyPage>
            <KnowledgePage />
          </LazyPage>
        ),
      },
      {
        path: 'review',
        element: (
          <LazyPage>
            <ReviewPage />
          </LazyPage>
        ),
      },
      {
        path: 'review/:reviewId',
        element: (
          <LazyPage>
            <ReviewPage />
          </LazyPage>
        ),
      },
      {
        path: 'diagnosis',
        element: (
          <LazyPage>
            <DiagnosisPage />
          </LazyPage>
        ),
      },
      {
        path: 'diagnosis/:diagnosisId',
        element: (
          <LazyPage>
            <DiagnosisPage />
          </LazyPage>
        ),
      },
      {
        path: 'finetune',
        element: (
          <LazyPage>
            <FinetunePage />
          </LazyPage>
        ),
      },
      {
        path: 'finetune/:taskId',
        element: (
          <LazyPage>
            <FinetunePage />
          </LazyPage>
        ),
      },
      {
        path: 'metrics',
        element: (
          <LazyPage>
            <MetricsPage />
          </LazyPage>
        ),
      },
      {
        path: 'settings',
        element: (
          <LazyPage>
            <SettingsPage />
          </LazyPage>
        ),
      },
      {
        path: 'settings/:tab',
        element: (
          <LazyPage>
            <SettingsPage />
          </LazyPage>
        ),
      },
    ],
  },
]);

export default router;
