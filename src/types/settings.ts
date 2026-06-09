// 系统设置相关类型定义

export type ModelDeployType = 'private' | 'api';
export type ModelStatus = '正常' | '异常';

export interface ModelConfig {
  modelId: string;
  name: string;
  deployType: ModelDeployType;
  apiAddress: string;
  apiKey?: string;
  maxContextLength: number;
  defaultTemperature: number;
  status: ModelStatus;
  isDefault: boolean;
}

export type UserRole = '开发' | '测试' | '架构师' | '运维' | '管理者' | '管理员';
export type UserStatus = '启用' | '禁用';

export interface User {
  userId: string;
  username: string;
  realName: string;
  email: string;
  role: UserRole;
  department: string;
  status: UserStatus;
  lastLoginAt?: number;
}

export type TemplateCategory = 'CONTROLLER' | 'SERVICE' | 'DAO' | 'MAPPER' | 'DTO';
export type TemplateLanguage = 'Java' | 'Python' | 'XML' | 'SQL';

export interface CodeTemplate {
  templateId: string;
  name: string;
  category: TemplateCategory;
  language: TemplateLanguage;
  framework: string;
  content: string;
  variables: TemplateVariable[];
  createdAt: number;
}

export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'boolean';
  defaultValue?: string;
  required: boolean;
}

export interface McpTool {
  toolName: string;
  description: string;
  serverName: string;
  status: '在线' | '离线';
  schema?: Record<string, unknown>;
}

export type NotifyChannel = '邮件' | '企业微信' | '钉钉' | '飞书';
export type NotifyEventType = '评审完成' | '排障完成' | '训练完成' | '系统告警';

export interface NotifyConfig {
  id: string;
  eventType: NotifyEventType;
  channels: NotifyChannel[];
  receivers: string[];
  enabled: boolean;
}

export interface Notification {
  id: string;
  type: NotifyEventType;
  title: string;
  time: number;
  read: boolean;
  link?: string;
}
