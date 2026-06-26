// 系统设置服务 — 支持 Mock 模式

import request from '../utils/request';
import type { ModelConfig, User, CodeTemplate, McpTool, NotifyConfig, ModelDeployType, ModelStatus, TemplateCategory, TemplateLanguage, UserRole } from '../types';
import { mockModels, mockUsers, mockTemplates, mockMcpTools, mockNotifyConfigs } from '../mock/data';

export interface ModelCreateParams {
  name: string;
  deployType: string;
  apiAddress: string;
  apiKey?: string;
  maxContextLength: number;
  defaultTemperature: number;
}

export interface UserCreateParams {
  username: string;
  realName: string;
  email?: string;
  role: string;
  department?: string;
  password: string;
}

export interface TemplateCreateParams {
  name: string;
  category: string;
  language: string;
  framework: string;
  content: string;
  variables: Array<{ name: string; type: string; defaultValue?: string; required: boolean }>;
}

let useMock = false;

export const _setMockMode = (v: boolean) => { useMock = v; };

export const settingsService = {
  // 模型配置
  getModels: async (): Promise<ModelConfig[]> => {
    if (useMock) return mockModels;
    try {
      const result = await request.get<never, ModelConfig[]>('/settings/models');
      useMock = false;
      return result;
    } catch {
      useMock = true;
      return mockModels;
    }
  },

  createModel: async (params: ModelCreateParams): Promise<ModelConfig> => {
    if (useMock) {
      return {
        modelId: `m-${Date.now()}`,
        name: params.name,
        deployType: params.deployType as ModelDeployType,
        apiAddress: params.apiAddress,
        apiKey: params.apiKey,
        maxContextLength: params.maxContextLength,
        defaultTemperature: params.defaultTemperature,
        status: '正常' as ModelStatus,
        isDefault: false,
      };
    }
    try {
      const result = await request.post<never, ModelConfig>('/settings/models', params);
      useMock = false;
      return result;
    } catch {
      useMock = true;
      return {
        modelId: `m-${Date.now()}`,
        name: params.name,
        deployType: params.deployType as ModelDeployType,
        apiAddress: params.apiAddress,
        apiKey: params.apiKey,
        maxContextLength: params.maxContextLength,
        defaultTemperature: params.defaultTemperature,
        status: '正常' as ModelStatus,
        isDefault: false,
      };
    }
  },

  updateModel: async (modelId: string, params: Partial<ModelCreateParams>): Promise<ModelConfig> => {
    if (useMock) {
      const model = mockModels.find((m) => m.modelId === modelId);
      const updated = model ? { ...model, ...params, deployType: (params.deployType ?? model.deployType) as ModelDeployType } : mockModels[0];
      return updated;
    }
    try {
      const result = await request.put<never, ModelConfig>(`/settings/models/${modelId}`, params);
      useMock = false;
      return result;
    } catch {
      useMock = true;
      const model = mockModels.find((m) => m.modelId === modelId);
      const updated = model ? { ...model, ...params, deployType: (params.deployType ?? model.deployType) as ModelDeployType } : mockModels[0];
      return updated;
    }
  },

  deleteModel: async (modelId: string): Promise<void> => {
    if (useMock) return;
    try {
      await request.delete<never, void>(`/settings/models/${modelId}`);
      useMock = false;
    } catch {
      useMock = true;
    }
  },

  testModelConnection: async (modelId: string): Promise<{ success: boolean; message: string }> => {
    if (useMock) {
      const model = mockModels.find((m) => m.modelId === modelId);
      return { success: model?.status === '正常', message: model?.status === '正常' ? '连接成功' : '连接失败' };
    }
    try {
      const result = await request.post<never, { success: boolean; message: string }>(`/settings/models/${modelId}/test`);
      useMock = false;
      return result;
    } catch {
      useMock = true;
      return { success: false, message: '连接失败' };
    }
  },

  // 代码模板
  getTemplates: async (): Promise<CodeTemplate[]> => {
    if (useMock) return mockTemplates;
    try {
      const result = await request.get<never, CodeTemplate[]>('/settings/templates');
      useMock = false;
      return result;
    } catch {
      useMock = true;
      return mockTemplates;
    }
  },

  createTemplate: async (params: TemplateCreateParams): Promise<CodeTemplate> => {
    if (useMock) {
      return {
        templateId: `t-${Date.now()}`,
        name: params.name,
        category: params.category as TemplateCategory,
        language: params.language as TemplateLanguage,
        framework: params.framework,
        content: params.content,
        variables: params.variables.map((v) => ({ ...v, type: v.type as 'string' | 'number' | 'boolean' })),
        createdAt: Date.now(),
      } as CodeTemplate;
    }
    try {
      const result = await request.post<never, CodeTemplate>('/settings/templates', params);
      useMock = false;
      return result;
    } catch {
      useMock = true;
      return {
        templateId: `t-${Date.now()}`,
        name: params.name,
        category: params.category as TemplateCategory,
        language: params.language as TemplateLanguage,
        framework: params.framework,
        content: params.content,
        variables: params.variables.map((v) => ({ ...v, type: v.type as 'string' | 'number' | 'boolean' })),
        createdAt: Date.now(),
      } as CodeTemplate;
    }
  },

  updateTemplate: async (templateId: string, params: Partial<TemplateCreateParams>): Promise<CodeTemplate> => {
    if (useMock) {
      const tpl = mockTemplates.find((t) => t.templateId === templateId);
      const updated = tpl ? { ...tpl, ...params, category: (params.category ?? tpl.category) as TemplateCategory, language: (params.language ?? tpl.language) as TemplateLanguage } as CodeTemplate : mockTemplates[0];
      return updated;
    }
    try {
      const result = await request.put<never, CodeTemplate>(`/settings/templates/${templateId}`, params);
      useMock = false;
      return result;
    } catch {
      useMock = true;
      const tpl = mockTemplates.find((t) => t.templateId === templateId);
      const updated = tpl ? { ...tpl, ...params, category: (params.category ?? tpl.category) as TemplateCategory, language: (params.language ?? tpl.language) as TemplateLanguage } as CodeTemplate : mockTemplates[0];
      return updated;
    }
  },

  deleteTemplate: async (templateId: string): Promise<void> => {
    if (useMock) return;
    try {
      await request.delete<never, void>(`/settings/templates/${templateId}`);
      useMock = false;
    } catch {
      useMock = true;
    }
  },

  // MCP 工具
  getMcpTools: async (): Promise<McpTool[]> => {
    if (useMock) return mockMcpTools;
    try {
      const result = await request.get<never, McpTool[]>('/settings/mcp-tools');
      useMock = false;
      return result;
    } catch {
      useMock = true;
      return mockMcpTools;
    }
  },

  testMcpTool: async (toolName: string, _params?: Record<string, unknown>): Promise<unknown> => {
    if (useMock) {
      const tool = mockMcpTools.find((t) => t.toolName === toolName);
      return { success: tool?.status === '在线', result: `Mock 测试 ${toolName}` };
    }
    try {
      const result = await request.post<never, unknown>(`/settings/mcp-tools/${toolName}/test`, _params);
      useMock = false;
      return result;
    } catch {
      useMock = true;
      return { success: false, result: '测试失败' };
    }
  },

  // 通知渠道
  getNotificationChannels: async (): Promise<Array<{ channel: string; configured: boolean }>> => {
    if (useMock) return [{ channel: '企业微信', configured: true }, { channel: '钉钉', configured: true }, { channel: '邮件', configured: true }, { channel: '飞书', configured: false }];
    try {
      const result = await request.get<never, Array<{ channel: string; configured: boolean }>>('/settings/notification-channels');
      useMock = false;
      return result;
    } catch {
      useMock = true;
      return [{ channel: '企业微信', configured: true }, { channel: '钉钉', configured: true }, { channel: '邮件', configured: true }, { channel: '飞书', configured: false }];
    }
  },

  configureNotificationChannel: async (channel: string, _config: Record<string, unknown>): Promise<void> => {
    if (useMock) return;
    try {
      await request.post<never, void>(`/settings/notification-channels/${channel}`, _config);
      useMock = false;
    } catch {
      useMock = true;
    }
  },

  // 通知规则
  getNotificationRules: async (): Promise<NotifyConfig[]> => {
    if (useMock) return mockNotifyConfigs;
    try {
      const result = await request.get<never, NotifyConfig[]>('/settings/notification-rules');
      useMock = false;
      return result;
    } catch {
      useMock = true;
      return mockNotifyConfigs;
    }
  },

  createNotificationRule: async (params: Omit<NotifyConfig, 'id'>): Promise<NotifyConfig> => {
    if (useMock) {
      return { id: `nc-${Date.now()}`, ...params };
    }
    try {
      const result = await request.post<never, NotifyConfig>('/settings/notification-rules', params);
      useMock = false;
      return result;
    } catch {
      useMock = true;
      return { id: `nc-${Date.now()}`, ...params };
    }
  },

  updateNotificationRule: async (ruleId: string, params: Partial<NotifyConfig>): Promise<NotifyConfig> => {
    if (useMock) {
      const rule = mockNotifyConfigs.find((r) => r.id === ruleId);
      return rule ? { ...rule, ...params } : mockNotifyConfigs[0];
    }
    try {
      const result = await request.put<never, NotifyConfig>(`/settings/notification-rules/${ruleId}`, params);
      useMock = false;
      return result;
    } catch {
      useMock = true;
      const rule = mockNotifyConfigs.find((r) => r.id === ruleId);
      return rule ? { ...rule, ...params } : mockNotifyConfigs[0];
    }
  },

  deleteNotificationRule: async (ruleId: string): Promise<void> => {
    if (useMock) return;
    try {
      await request.delete<never, void>(`/settings/notification-rules/${ruleId}`);
      useMock = false;
    } catch {
      useMock = true;
    }
  },

  // 用户管理
  getUsers: async (): Promise<User[]> => {
    if (useMock) return mockUsers;
    try {
      const result = await request.get<never, User[]>('/settings/users');
      useMock = false;
      return result;
    } catch {
      useMock = true;
      return mockUsers;
    }
  },

  createUser: async (params: UserCreateParams): Promise<User> => {
    if (useMock) {
      return { userId: `u-${Date.now()}`, username: params.username, realName: params.realName, email: params.email || '', role: params.role as UserRole, department: params.department || '', status: '启用' as const, lastLoginAt: undefined };
    }
    try {
      const result = await request.post<never, User>('/settings/users', params);
      useMock = false;
      return result;
    } catch {
      useMock = true;
      return { userId: `u-${Date.now()}`, username: params.username, realName: params.realName, email: params.email || '', role: params.role as UserRole, department: params.department || '', status: '启用' as const, lastLoginAt: undefined };
    }
  },

  updateUser: async (userId: string, params: Partial<UserCreateParams>): Promise<User> => {
    if (useMock) {
      const user = mockUsers.find((u) => u.userId === userId);
      const updated = user ? { ...user, ...params, role: (params.role ?? user.role) as UserRole } : mockUsers[0];
      return updated;
    }
    try {
      const result = await request.put<never, User>(`/settings/users/${userId}`, params);
      useMock = false;
      return result;
    } catch {
      useMock = true;
      const user = mockUsers.find((u) => u.userId === userId);
      const updated = user ? { ...user, ...params, role: (params.role ?? user.role) as UserRole } : mockUsers[0];
      return updated;
    }
  },

  deleteUser: async (userId: string): Promise<void> => {
    if (useMock) return;
    try {
      await request.delete<never, void>(`/settings/users/${userId}`);
      useMock = false;
    } catch {
      useMock = true;
    }
  },

  resetPassword: async (userId: string): Promise<void> => {
    if (useMock) return;
    try {
      await request.post<never, void>(`/settings/users/${userId}/reset-password`);
      useMock = false;
    } catch {
      useMock = true;
    }
  },

  isMockMode: () => useMock,
};
