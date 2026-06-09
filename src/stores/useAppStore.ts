// 全局应用状态管理

import { create } from 'zustand';
import type { Notification } from '../types';

type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting';

interface AppState {
  sidebarCollapsed: boolean;
  currentModel: string;
  connectionStatus: ConnectionStatus;
  sessionTokenUsage: number;
  notifications: Notification[];
  unreadCount: number;
  globalSearchVisible: boolean;

  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setCurrentModel: (model: string) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  addTokenUsage: (tokens: number) => void;
  resetTokenUsage: () => void;
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  setGlobalSearchVisible: (visible: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarCollapsed: false,
  currentModel: 'Qwen2.5-72B',
  connectionStatus: 'connected',
  sessionTokenUsage: 0,
  notifications: [],
  unreadCount: 0,
  globalSearchVisible: false,

  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  setCurrentModel: (model) => set({ currentModel: model }),

  setConnectionStatus: (status) => set({ connectionStatus: status }),

  addTokenUsage: (tokens) =>
    set((state) => ({ sessionTokenUsage: state.sessionTokenUsage + tokens })),

  resetTokenUsage: () => set({ sessionTokenUsage: 0 }),

  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
    }),

  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + (notification.read ? 0 : 1),
    })),

  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),

  markAllNotificationsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),

  setGlobalSearchVisible: (visible) => set({ globalSearchVisible: visible }),
}));
