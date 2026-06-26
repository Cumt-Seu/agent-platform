// 权限 Hook

import { useAuthStore } from '../stores/useAuthStore';

export function usePermission() {
  const permissions = useAuthStore((s) => s.permissions);

  const hasPermission = (resource: string, action: string): boolean => {
    // 管理员拥有全部权限
    if (permissions.includes('*')) return true;
    return permissions.includes(`${resource}:${action}`);
  };

  const hasAnyPermission = (checks: Array<[string, string]>): boolean => {
    return checks.some(([resource, action]) => hasPermission(resource, action));
  };

  return { hasPermission, hasAnyPermission, permissions };
}
