'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  normalizePhone,
  phoneToAuthToken,
  type LoginInput,
  type RegisterInput,
} from '../validations/auth-schemas';

function friendlyAuthError(message: string): string {
  if (/already registered|already exists|duplicate|unique/i.test(message)) {
    return 'Số điện thoại này đã được đăng ký.';
  }
  if (/invalid login credentials|invalid credentials/i.test(message)) {
    return 'Số điện thoại hoặc mật khẩu không đúng.';
  }
  if (/email.*invalid|invalid.*email/i.test(message)) {
    return 'Lỗi định danh — kiểm tra Supabase Dashboard đã tắt "Confirm email" chưa.';
  }
  return message;
}

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const login = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: phoneToAuthToken(data.phone),
        password: data.password,
      });
      if (error) throw error;

      toast.success('Đăng nhập thành công');
      router.push('/teams');
      router.refresh();
    } catch (error: unknown) {
      const raw = error instanceof Error ? error.message : 'Đăng nhập thất bại';
      toast.error(friendlyAuthError(raw));
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterInput) => {
    setIsLoading(true);
    try {
      const phone = normalizePhone(data.phone);
      const { error } = await supabase.auth.signUp({
        email: phoneToAuthToken(data.phone),
        password: data.password,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback`,
          data: { phone },
        },
      });
      if (error) throw error;

      toast.success('Đăng ký thành công! Đăng nhập để tiếp tục.');
      router.push('/login?registered=1');
    } catch (error: unknown) {
      const raw = error instanceof Error ? error.message : 'Đăng ký thất bại';
      toast.error(friendlyAuthError(raw));
    } finally {
      setIsLoading(false);
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
    logout,
    isLoading,
  };
}
