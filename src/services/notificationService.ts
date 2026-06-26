// 通知服务 — 支持 Mock 模式

import request from '../utils/request';
import type { Notification } from '../types';
import { mockNotifications } from '../mock/data';

let useMock = false;

export const _setMockMode = (v: boolean) => { useMock = v; };

export const notificationService = {
  list: async (params?: { pageSize?: number }): Promise<Notification[]> => {
    if (useMock) return mockNotifications.slice(0, params?.pageSize || 20);
    try {
      const result = await request.get<never, Notification[]>('/notifications', { params });
      useMock = false;
      return result;
    } catch {
      useMock = true;
      return mockNotifications.slice(0, params?.pageSize || 20);
    }
  },

  markRead: async (notificationId: string): Promise<void> => {
    if (useMock) {
      const n = mockNotifications.find((item) => item.id === notificationId);
      if (n) n.read = true;
      return;
    }
    try {
      await request.put<never, void>(`/notifications/${notificationId}/read`);
      useMock = false;
    } catch {
      useMock = true;
    }
  },

  markAllRead: async (): Promise<void> => {
    if (useMock) {
      mockNotifications.forEach((n) => { n.read = true; });
      return;
    }
    try {
      await request.put<never, void>('/notifications/read-all');
      useMock = false;
    } catch {
      useMock = true;
    }
  },

  getUnreadCount: async (): Promise<{ count: number }> => {
    if (useMock) return { count: mockNotifications.filter((n) => !n.read).length };
    try {
      const result = await request.get<never, { count: number }>('/notifications/unread-count');
      useMock = false;
      return result;
    } catch {
      useMock = true;
      return { count: mockNotifications.filter((n) => !n.read).length };
    }
  },

  isMockMode: () => useMock,
};
