import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/services/api';
import type { AuthRequest, RegisterRequest, AuthResponse } from '@/types/api';

interface AuthState {
  user: AuthResponse['user'] | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export function useAuth() {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      try {
        setState({
          user: JSON.parse(user),
          isAuthenticated: true,
          loading: false,
        });
      } catch {
        setState({ user: null, isAuthenticated: false, loading: false });
      }
    } else {
      setState({ user: null, isAuthenticated: false, loading: false });
    }
  }, []);

  const login = useCallback(async (data: AuthRequest) => {
    try {
      const response = await apiService.login(data);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setState({
        user: response.user,
        isAuthenticated: true,
        loading: false,
      });
      router.push('/dashboard');
    } catch (error) {
      throw error;
    }
  }, [router]);

  const register = useCallback(async (data: RegisterRequest) => {
    try {
      const response = await apiService.register(data);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setState({
        user: response.user,
        isAuthenticated: true,
        loading: false,
      });
      router.push('/dashboard');
    } catch (error) {
      throw error;
    }
  }, [router]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setState({
      user: null,
      isAuthenticated: false,
      loading: false,
    });
    router.push('/login');
  }, [router]);

  return {
    ...state,
    login,
    register,
    logout,
  };
} 