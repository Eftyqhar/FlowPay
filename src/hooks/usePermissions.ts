import { useCallback } from 'react';
import { UserRole } from '@/lib/types';
import { PERMISSIONS } from '@/lib/constants';
import { useAuthStore } from '@/stores/authStore';

export function usePermissions() {
  const { currentUser: user } = useAuthStore();
  const role: UserRole = (user?.role?.toLowerCase() as UserRole) || 'employee';

  const hasPermission = useCallback(
    (permission: string) => {
      if (!user) return false;
      if (role === 'owner') return true;
      const userPermissions = PERMISSIONS[role] || [];
      return userPermissions.includes('all') || userPermissions.includes(permission);
    },
    [user, role]
  );

  const canAccess = useCallback(
    (requiredPermissions: string[]) => {
      if (!user) return false;
      if (role === 'owner') return true;
      if (requiredPermissions.length === 0) return true;
      return requiredPermissions.some((perm) => hasPermission(perm));
    },
    [user, role, hasPermission]
  );

  return { hasPermission, role, canAccess };
}
