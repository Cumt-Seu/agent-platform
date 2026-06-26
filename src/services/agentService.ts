// 智能体服务 — 支持 Mock 模式

import request from '../utils/request';
import type { Session, ChatMessage, DagPlan } from '../types';
import { mockSessions, mockMessages, mockDagPlan } from '../mock/data';

export interface ChatParams {
  sessionId?: string;
  message: string;
  skillType?: string;
  attachments?: Array<{ name: string; url: string }>;
}

// Mock 模式标记（与 authService 共享状态）
let useMock = false;

export const _setMockMode = (v: boolean) => { useMock = v; };

export const agentService = {
  // SSE 对话（返回 SSE URL，由 useSSE 管理）
  chat: (params: ChatParams) => ({
    url: '/api/v1/agent/chat',
    body: params,
  }),

  // 会话 CRUD
  getSessions: async (): Promise<Session[]> => {
    if (useMock) return mockSessions;
    try {
      const result = await request.get<never, Session[]>('/agent/sessions');
      useMock = false;
      return result;
    } catch {
      useMock = true;
      return mockSessions;
    }
  },

  createSession: async (title?: string): Promise<Session> => {
    if (useMock) {
      return { sessionId: `s-${Date.now()}`, title: title || '新会话', createdAt: Date.now(), lastActiveAt: Date.now(), lastMessageSummary: '', pinned: false };
    }
    try {
      const result = await request.post<never, Session>('/agent/sessions', { title });
      useMock = false;
      return result;
    } catch {
      useMock = true;
      return { sessionId: `s-${Date.now()}`, title: title || '新会话', createdAt: Date.now(), lastActiveAt: Date.now(), lastMessageSummary: '', pinned: false };
    }
  },

  getSession: async (sessionId: string): Promise<Session> => {
    if (useMock) return mockSessions.find((s) => s.sessionId === sessionId) || mockSessions[0];
    try {
      const result = await request.get<never, Session>(`/agent/sessions/${sessionId}`);
      useMock = false;
      return result;
    } catch {
      useMock = true;
      return mockSessions.find((s) => s.sessionId === sessionId) || mockSessions[0];
    }
  },

  updateSession: async (sessionId: string, updates: Partial<Session>): Promise<Session> => {
    if (useMock) {
      const session = mockSessions.find((s) => s.sessionId === sessionId);
      return session ? { ...session, ...updates } : mockSessions[0];
    }
    try {
      const result = await request.put<never, Session>(`/agent/sessions/${sessionId}`, updates);
      useMock = false;
      return result;
    } catch {
      useMock = true;
      const session = mockSessions.find((s) => s.sessionId === sessionId);
      return session ? { ...session, ...updates } : mockSessions[0];
    }
  },

  deleteSession: async (sessionId: string): Promise<void> => {
    if (useMock) return;
    try {
      await request.delete<never, void>(`/agent/sessions/${sessionId}`);
      useMock = false;
    } catch {
      useMock = true;
    }
  },

  pinSession: async (sessionId: string, pinned: boolean): Promise<void> => {
    if (useMock) {
      const session = mockSessions.find((s) => s.sessionId === sessionId);
      if (session) session.pinned = pinned;
      return;
    }
    try {
      await request.put<never, void>(`/agent/sessions/${sessionId}/pin`, { pinned });
      useMock = false;
    } catch {
      useMock = true;
    }
  },

  // 消息
  getMessages: async (sessionId: string): Promise<ChatMessage[]> => {
    if (useMock) return mockMessages[sessionId] || [];
    try {
      const result = await request.get<never, ChatMessage[]>(`/agent/sessions/${sessionId}/messages`);
      useMock = false;
      return result;
    } catch {
      useMock = true;
      return mockMessages[sessionId] || [];
    }
  },

  // DAG 状态
  getDagState: async (sessionId: string): Promise<DagPlan> => {
    if (useMock) return mockDagPlan;
    try {
      const result = await request.get<never, DagPlan>(`/agent/sessions/${sessionId}/dag`);
      useMock = false;
      return result;
    } catch {
      useMock = true;
      return mockDagPlan;
    }
  },

  isMockMode: () => useMock,
};
