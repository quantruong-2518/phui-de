'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import type { LoginInput, RegisterInput } from '../validations/auth-schemas';

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const login = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword(data);
      if (error) throw error;

      toast.success('Đăng nhập thành công');
      router.push('/teams');
      router.refresh();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Đăng nhập thất bại';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterInput) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback`,
        },
      });
      if (error) throw error;

      toast.success('Đăng ký thành công! Vui lòng kiểm tra email.');
      router.push('/verify-email');
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Đăng ký thất bại';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Lỗi đăng nhập Google';
      toast.error(message);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return {
    login,
    register,
    loginWithGoogle,
    logout,
    isLoading,
  };
}
