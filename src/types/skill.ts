// 技能管理相关类型定义

export type SkillCategory = 'CODE_GEN' | 'CODE_REVIEW' | 'FAULT_DIAG' | 'KNOWLEDGE_QA';
export type SkillStatus = 'ACTIVE' | 'DISABLED' | 'ERROR';
export type ExecutionMode = 'SYNC' | 'ASYNC';
export type AuthType = 'none' | 'api_key' | 'oauth2' | 'custom';

export interface SkillDefinition {
  skillId: string;
  name: string;
  version: string;
  category: SkillCategory;
  status: SkillStatus;
  description: string;
  endpoint: string;
  executionMode: ExecutionMode;
  authType: AuthType;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  createdAt: number;
  createdBy: string;
}

export interface SkillStats {
  todayCalls: number;
  avgDuration: number;
  successRate: number;
}

export interface SkillCallLog {
  logId: string;
  skillId: string;
  caller: string;
  paramsSummary: string;
  status: 'SUCCESS' | 'FAILED' | 'TIMEOUT';
  durationMs: number;
  calledAt: number;
}

export interface SkillVersion {
  version: string;
  changeDescription: string;
  releasedAt: number;
}
