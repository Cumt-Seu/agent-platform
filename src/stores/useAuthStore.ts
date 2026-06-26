// 认证状态管理 — Token 仅存内存，不持久化 localStorage

import { create } from 'zustand';
import type { UserRole } from '../types';

interface AuthState {
  token: string | null;
  username: string | null;
  realName: string | null;
  role: UserRole | null;
  roles: UserRole[];
  permissions: string[];
  isAuthenticated: boolean;

  login: (token: string, username: string, realName: string, roles: UserRole[], permissions: string[]) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  setPermissions: (permissions: string[]) => void;
  setToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  username: null,
  realName: null,
  role: null,
  roles: [],
  permissions: [],
  isAuthenticated: false,

  login: (token, username, realName, roles, permissions) => {
    const defaultRole = roles[0] || null;
    set({
      token,
      username,
      realName,
      role: defaultRole,
      roles,
      permissions,
      isAuthenticated: true,
    });
  },

  logout: () => {
    set({
      token: null,
      username: null,
      realName: null,
      role: null,
      roles: [],
      permissions: [],
      isAuthenticated: false,
    });
  },

  switchRole: (role) => {
    set({ role });
  },

  setPermissions: (permissions) => {
    set({ permissions });
  },

  setToken: (token) => {
    set({ token });
  },
}));
