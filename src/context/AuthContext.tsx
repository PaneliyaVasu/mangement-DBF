import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../../shared/types/index.ts';
import { api } from '../api/client.ts';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem('surat_token');
      const storedUser = localStorage.getItem('surat_user');

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          // Verify with backend
          const res = await api.auth.me();
          if (res.data) {
            setUser(res.data);
            localStorage.setItem('surat_user', JSON.stringify(res.data));
          }
        } catch (e) {
          console.warn('Session verification failed, logging in with demo admin credentials');
          await autoLoginDemo();
        }
      } else {
        // Auto-login with default Super Admin so the application is instantly ready and demonstrable!
        await autoLoginDemo();
      }
      setIsLoading(false);
    }

    loadUser();
  }, []);

  async function autoLoginDemo() {
    try {
      const res = await api.auth.login({
        email: 'admin@suratcenter.org',
        password: 'Admin@123',
      });
      if (res.data) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('surat_token', res.data.token);
        localStorage.setItem('surat_user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.warn('Auto-login fallback error:', err);
    }
  }

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.auth.login({ email, password });
      if (res.data) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('surat_token', res.data.token);
        localStorage.setItem('surat_user', JSON.stringify(res.data.user));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any) => {
    setIsLoading(true);
    try {
      const res = await api.auth.register(userData);
      if (res.data) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('surat_token', res.data.token);
        localStorage.setItem('surat_user', JSON.stringify(res.data.user));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('surat_token');
    localStorage.removeItem('surat_user');
  };

  // Quick Switcher to test various roles seamlessly
  const switchRole = async (role: UserRole) => {
    const roleEmails: Record<UserRole, { email: string; pass: string }> = {
      SUPER_ADMIN: { email: 'admin@suratcenter.org', pass: 'Admin@123' },
      CENTER_ADMIN: { email: 'center.admin@suratcenter.org', pass: 'Admin@123' },
      FINANCE_ADMIN: { email: 'finance@suratcenter.org', pass: 'Finance@123' },
      EVENT_COORDINATOR: { email: 'coordinator@suratcenter.org', pass: 'Coord@123' },
      TEAM_COORDINATOR: { email: 'coordinator@suratcenter.org', pass: 'Coord@123' },
      VOLUNTEER: { email: 'volunteer@suratcenter.org', pass: 'Volunteer@123' },
    };

    const target = roleEmails[role];
    if (target) {
      await login(target.email, target.pass);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
