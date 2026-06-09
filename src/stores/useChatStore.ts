// 对话状态管理

import { create } from 'zustand';
import type { Session, ChatMessage, SkillType } from '../types';

interface ChatState {
  sessions: Session[];
  currentSessionId: string | null;
  messages: ChatMessage[];
  selectedSkill: SkillType;
  isStreaming: boolean;
  inputValue: string;

  setSessions: (sessions: Session[]) => void;
  addSession: (session: Session) => void;
  removeSession: (sessionId: string) => void;
  updateSession: (sessionId: string, updates: Partial<Session>) => void;
  setCurrentSessionId: (sessionId: string | null) => void;
  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  updateMessage: (messageId: string, updates: Partial<ChatMessage>) => void;
  removeMessage: (messageId: string) => void;
  setSelectedSkill: (skill: SkillType) => void;
  setIsStreaming: (streaming: boolean) => void;
  setInputValue: (value: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  sessions: [],
  currentSessionId: null,
  messages: [],
  selectedSkill: 'auto',
  isStreaming: false,
  inputValue: '',

  setSessions: (sessions) => set({ sessions }),

  addSession: (session) =>
    set((state) => ({ sessions: [session, ...state.sessions] })),

  removeSession: (sessionId) =>
    set((state) => ({
      sessions: state.sessions.filter((s) => s.sessionId !== sessionId),
      currentSessionId:
        state.currentSessionId === sessionId ? null : state.currentSessionId,
    })),

  updateSession: (sessionId, updates) =>
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.sessionId === sessionId ? { ...s, ...updates } : s
      ),
    })),

  setCurrentSessionId: (sessionId) => set({ currentSessionId: sessionId }),

  setMessages: (messages) => set({ messages }),

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  updateMessage: (messageId, updates) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === messageId ? { ...m, ...updates } : m
      ),
    })),

  removeMessage: (messageId) =>
    set((state) => ({
      messages: state.messages.filter((m) => m.id !== messageId),
    })),

  setSelectedSkill: (skill) => set({ selectedSkill: skill }),

  setIsStreaming: (streaming) => set({ isStreaming: streaming }),

  setInputValue: (value) => set({ inputValue: value }),
}));
