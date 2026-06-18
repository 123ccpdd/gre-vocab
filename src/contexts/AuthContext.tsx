import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import * as authApi from '../services/auth';
import { setAccessToken } from '../services/api';
import { hasLocalData, migrateLocalData, markMigrated } from '../services/migrationHelper';

interface AuthUser {
  id: string;
  email: string;
  nickname: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  showMigrationDialog: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, nickname?: string) => Promise<void>;
  logout: () => void;
  handleMigration: () => Promise<void>;
  skipMigration: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showMigrationDialog, setShowMigrationDialog] = useState(false);

  // 初始化：检查已有 token
  useEffect(() => {
    const refreshToken = localStorage.getItem('gre-vocab-refresh-token');
    if (!refreshToken) {
      setIsLoading(false);
      return;
    }

    authApi.getMe()
      .then((data) => {
        setUser(data.user);
      })
      .catch(() => {
        setAccessToken(null);
        localStorage.removeItem('gre-vocab-refresh-token');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await authApi.login(email, password);
    setUser(data.user);
    // 登录成功后检查是否有本地数据需要迁移
    if (hasLocalData()) {
      setShowMigrationDialog(true);
    }
  }, []);

  const register = useCallback(async (email: string, password: string, nickname?: string) => {
    const data = await authApi.register(email, password, nickname);
    setUser(data.user);
    // 注册成功后检查是否有本地数据需要迁移
    if (hasLocalData()) {
      setShowMigrationDialog(true);
    }
  }, []);

  const logout = useCallback(() => {
    authApi.logout();
    setUser(null);
  }, []);

  const handleMigration = useCallback(async () => {
    const result = await migrateLocalData();
    if (result.success) {
      setShowMigrationDialog(false);
    } else {
      alert('数据迁移失败: ' + result.message);
    }
  }, []);

  const skipMigration = useCallback(() => {
    markMigrated();
    setShowMigrationDialog(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        showMigrationDialog,
        login,
        register,
        logout,
        handleMigration,
        skipMigration,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}