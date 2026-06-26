// 技能管理服务 — 支持 Mock 模式

import request from '../utils/request';
import type { SkillDefinition, SkillStats, SkillCallLog, SkillCategory, ExecutionMode, AuthType, SkillStatus } from '../types';
import { mockSkills, mockSkillStats, mockSkillLogs } from '../mock/data';

export interface SkillCreateParams {
  name: string;
  skillId: string;
  category: string;
  version: string;
  description: string;
  endpoint: string;
  executionMode: string;
  authType: string;
  inputSchema?: Record<string, unknown>;
  outputSchema?: Record<string, unknown>;
}

export interface SkillInvokeParams {
  params: Record<string, unknown>;
  async?: boolean;
}

let useMock = false;

export const _setMockMode = (v: boolean) => { useMock = v; };

export const skillService = {
  getSkills: async (): Promise<SkillDefinition[]> => {
    if (useMock) return mockSkills;
    try {
      const result = await request.get<never, SkillDefinition[]>('/skills');
      useMock = false;
      return result;
    } catch {
      useMock = true;
      return mockSkills;
    }
  },

  getSkillDetail: async (skillId: string): Promise<SkillDefinition> => {
    if (useMock) return mockSkills.find((s) => s.skillId === skillId) || mockSkills[0];
    try {
      const result = await request.get<never, SkillDefinition>(`/skills/${skillId}`);
      useMock = false;
      return result;
    } catch {
      useMock = true;
      return mockSkills.find((s) => s.skillId === skillId) || mockSkills[0];
    }
  },

  createSkill: async (params: SkillCreateParams): Promise<SkillDefinition> => {
    if (useMock) {
      return {
        name: params.name,
        skillId: params.skillId,
        version: params.version,
        description: params.description,
        endpoint: params.endpoint,
        inputSchema: params.inputSchema || {},
        outputSchema: params.outputSchema || {},
        status: 'ACTIVE' as SkillStatus,
        category: params.category as SkillCategory,
        executionMode: params.executionMode as ExecutionMode,
        authType: params.authType as AuthType,
        createdAt: Date.now(),
        createdBy: 'admin',
      };
    }
    try {
      const result = await request.post<never, SkillDefinition>('/skills', params);
      useMock = false;
      return result;
    } catch {
      useMock = true;
      return { ...params, status: 'ACTIVE', createdAt: Date.now(), createdBy: 'admin', inputSchema: params.inputSchema || {}, outputSchema: params.outputSchema || {} } as SkillDefinition;
    }
  },

  updateSkill: async (skillId: string, params: Partial<SkillCreateParams>): Promise<SkillDefinition> => {
    if (useMock) {
      const skill = mockSkills.find((s) => s.skillId === skillId);
      return skill ? { ...skill, ...params } as SkillDefinition : mockSkills[0];
    }
    try {
      const result = await request.put<never, SkillDefinition>(`/skills/${skillId}`, params);
      useMock = false;
      return result;
    } catch {
      useMock = true;
      const skill = mockSkills.find((s) => s.skillId === skillId);
      return skill ? { ...skill, ...params } as SkillDefinition : mockSkills[0];
    }
  },

  deleteSkill: async (skillId: string): Promise<void> => {
    if (useMock) return;
    try {
      await request.delete<never, void>(`/skills/${skillId}`);
      useMock = false;
    } catch {
      useMock = true;
    }
  },

  invoke: async (skillId: string, params: SkillInvokeParams): Promise<unknown> => {
    if (useMock) return { result: 'Mock 调用成功', skillId };
    try {
      const result = await request.post<never, unknown>(`/skills/${skillId}/invoke`, params);
      useMock = false;
      return result;
    } catch {
      useMock = true;
      return { result: 'Mock 调用成功', skillId };
    }
  },

  getStats: async (skillId: string): Promise<SkillStats> => {
    if (useMock) return mockSkillStats[skillId] || { todayCalls: 0, avgDuration: 0, successRate: 0 };
    try {
      const result = await request.get<never, SkillStats>(`/skills/${skillId}/stats`);
      useMock = false;
      return result;
    } catch {
      useMock = true;
      return mockSkillStats[skillId] || { todayCalls: 0, avgDuration: 0, successRate: 0 };
    }
  },

  getLogs: async (skillId: string, _params?: { page?: number; pageSize?: number }): Promise<SkillCallLog[]> => {
    if (useMock) return mockSkillLogs.filter((l) => l.skillId === skillId);
    try {
      const result = await request.get<never, SkillCallLog[]>(`/skills/${skillId}/logs`, { params: _params });
      useMock = false;
      return result;
    } catch {
      useMock = true;
      return mockSkillLogs.filter((l) => l.skillId === skillId);
    }
  },

  isMockMode: () => useMock,
};
