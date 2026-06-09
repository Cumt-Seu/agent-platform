// 认证状态管理

import { create } from 'zustand';
import type { UserRole } from '../types';

interface AuthState {
  token: string | null;
  username: string | null;
  realName: string | null;
  role: UserRole | null;
  roles: UserRole[];
  isAuthenticated: boolean;

  login: (token: string, username: string, realName: string, roles: UserRole[]) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  username: localStorage.getItem('username'),
  realName: localStorage.getItem('realName'),
  role: (localStorage.getItem('currentRole') as UserRole) || null,
  roles: JSON.parse(localStorage.getItem('roles') || '[]'),
  isAuthenticated: !!localStorage.getItem('token'),

  login: (token, username, realName, roles) => {
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
    localStorage.setItem('realName', realName);
    localStorage.setItem('roles', JSON.stringify(roles));
    const defaultRole = roles[0] || null;
    if (defaultRole) {
      localStorage.setItem('currentRole', defaultRole);
    }
    set({
      token,
      username,
      realName,
      role: defaultRole,
      roles,
      isAuthenticated: true,
    });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('realName');
    localStorage.removeItem('roles');
    localStorage.removeItem('currentRole');
    set({
      token: null,
      username: null,
      realName: null,
      role: null,
      roles: [],
      isAuthenticated: false,
    });
  },

  switchRole: (role) => {
    localStorage.setItem('currentRole', role);
    set({ role });
  },
}));
