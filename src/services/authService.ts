// 认证服务 — 支持 Mock 模式（后端未就绪时使用）

import request from '../utils/request';

export interface LoginParams {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResult {
  token: string;
  refreshToken?: string;
}

export interface CurrentUser {
  username: string;
  realName: string;
  roles: string[];
  permissions: string[];
}

// Mock 数据 — 后端未就绪时使用
const MOCK_ACCOUNTS: Record<string, { password: string; user: CurrentUser }> = {
  admin: {
    password: 'admin123',
    user: {
      username: 'admin',
      realName: '管理员',
      roles: ['管理员'],
      permissions: ['*'], // 管理员拥有全部权限
    },
  },
  zhangsan: {
    password: '123456',
    user: {
      username: 'zhangsan',
      realName: '张三',
      roles: ['开发'],
      permissions: ['chat:read', 'chat:write', 'skill:read', 'knowledge:read', 'review:read', 'metrics:read'],
    },
  },
  lisi: {
    password: '123456',
    user: {
      username: 'lisi',
      realName: '李四',
      roles: ['架构师'],
      permissions: ['chat:read', 'chat:write', 'skill:read', 'skill:write', 'knowledge:read', 'knowledge:write', 'review:read', 'review:write', 'diagnosis:read', 'diagnosis:write', 'metrics:read', 'settings:read'],
    },
  },
  wangwu: {
    password: '123456',
    user: {
      username: 'wangwu',
      realName: '王五',
      roles: ['运维'],
      permissions: ['chat:read', 'diagnosis:read', 'diagnosis:write', 'metrics:read', 'settings:read'],
    },
  },
};

// 是否使用 Mock 模式（后端不可用时自动 fallback）
let useMock = false;

// Mock 模式同步：当 authService 进入 Mock 模式时，通知其他 service
import { _setMockMode as _setAgentMock } from './agentService';
import { _setMockMode as _setSkillMock } from './skillService';
import { _setMockMode as _setKnowledgeMock } from './knowledgeService';
import { _setMockMode as _setReviewMock } from './reviewService';
import { _setMockMode as _setDiagnosisMock } from './diagnosisService';
import { _setMockMode as _setFinetuneMock } from './finetuneService';
import { _setMockMode as _setMetricsMock } from './metricsService';
import { _setMockMode as _setSettingsMock } from './settingsService';
import { _setMockMode as _setNotificationMock } from './notificationService';

function syncMockMode(v: boolean) {
  useMock = v;
  _setAgentMock(v);
  _setSkillMock(v);
  _setKnowledgeMock(v);
  _setReviewMock(v);
  _setDiagnosisMock(v);
  _setFinetuneMock(v);
  _setMetricsMock(v);
  _setSettingsMock(v);
  _setNotificationMock(v);
}

function tryMockLogin(params: LoginParams): { result: LoginResult; user: CurrentUser } | null {
  const account = MOCK_ACCOUNTS[params.username];
  if (account && account.password === params.password) {
    return {
      result: {
        token: `mock-token-${params.username}-${Date.now()}`,
        refreshToken: `mock-refresh-${params.username}-${Date.now()}`,
      },
      user: account.user,
    };
  }
  return null;
}

export const authService = {
  login: async (params: LoginParams): Promise<LoginResult> => {
    // 先尝试真实 API
    try {
      const result = await request.post<never, LoginResult>('/auth/login', params);
      syncMockMode(false);
      return result;
    } catch {
      // 后端不可用，尝试 Mock
      const mockData = tryMockLogin(params);
      if (mockData) {
        syncMockMode(true);
        return mockData.result;
      }
      throw new Error('登录失败，请检查用户名和密码');
    }
  },

  refresh: async (): Promise<LoginResult> => {
    if (useMock) {
      return { token: `mock-token-refreshed-${Date.now()}` };
    }
    return request.post<never, LoginResult>('/auth/refresh');
  },

  logout: async (): Promise<void> => {
    if (useMock) return;
    try {
      await request.post<never, void>('/auth/logout');
    } catch {
      // ignore
    }
  },

  getCurrentUser: async (): Promise<CurrentUser> => {
    if (useMock) {
      // Mock 模式下，从 MOCK_ACCOUNTS 中取当前用户
      // 通过 token 中的 username 解析
      const token = useAuthStore.getState().token;
      const username = token?.match(/mock-token-(\w+)-/)?.[1] || 'admin';
      return MOCK_ACCOUNTS[username]?.user || MOCK_ACCOUNTS.admin.user;
    }
    return request.get<never, CurrentUser>('/auth/me');
  },

  isMockMode: () => useMock,
};

// 需要导入 useAuthStore 用于 Mock getCurrentUser
import { useAuthStore } from '../stores/useAuthStore';
