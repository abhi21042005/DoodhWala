'use client';

// auth context providing user state, role check, and logout to all client components
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { logoutAction } from './actions';

const AuthContext = createContext(null);

export function AuthProvider({ initialUser, children }) {
  const [user, setUser] = useState(initialUser || null);
  const [loading, setLoading] = useState(!initialUser);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialUser) {
      refreshUser();
    }
  }, [initialUser, refreshUser]);

  const logout = async () => {
    setUser(null);
    await logoutAction();
  };

  const value = {
    user,
    loading,
    refreshUser,
    logout,
    isAdmin: user?.role === 'ADMIN',
    isCustomer: user?.role === 'CUSTOMER',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
