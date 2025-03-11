import { useEffect, useState, useCallback } from 'react';
import { useAuth as useClerkAuth, useUser } from '@clerk/nextjs';
import { UserRole } from '@/types';

interface UseAuthResult {
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  userId: string | null;
  userName: string | null;
  checkPermission: (requiredRole?: UserRole) => boolean;
}

/**
 * 认证自定义Hook
 * @returns 认证状态和工具函数
 */
export default function useAuth(): UseAuthResult {
  const { isLoaded, isSignedIn, userId } = useClerkAuth();
  const { user } = useUser();
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  // 加载用户信息
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      // 从用户公开元数据中获取角色信息
      const userRole = user.publicMetadata.role as string;
      setIsAdmin(userRole === UserRole.ADMIN);

      // 设置用户名
      setUserName(user.firstName || user.username || null);
    } else {
      setIsAdmin(false);
      setUserName(null);
    }
  }, [isLoaded, isSignedIn, user]);

  /**
   * 检查用户是否具有所需权限
   * @param requiredRole 所需角色
   * @returns 是否有权限
   */
  const checkPermission = useCallback((requiredRole?: UserRole): boolean => {
    if (!isSignedIn) return false;
    if (!requiredRole) return true;
    
    if (requiredRole === UserRole.ADMIN) {
      return isAdmin;
    }
    
    return true;
  }, [isSignedIn, isAdmin]);

  return {
    isLoading: !isLoaded,
    isAuthenticated: isLoaded && !!isSignedIn,
    isAdmin,
    userId: userId || null,
    userName,
    checkPermission,
  };
} 