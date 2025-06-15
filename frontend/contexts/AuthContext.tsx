'use client';
import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { AuthRequest, RegisterRequest, AuthResponse } from '@/types/api';

interface AuthContextType {
  user: AuthResponse['user'] | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (data: AuthRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
} 