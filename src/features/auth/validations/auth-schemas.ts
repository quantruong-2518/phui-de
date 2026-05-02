import { z } from 'zod';

// VN phone: 0xxxxxxxxx (10 digits) hoặc +84xxxxxxxxx
const phoneRegex = /^(\+?84|0)\d{9,10}$/;

/** Convert any accepted format → E.164 (+84xxxxxxxxx) for public.users.phone. */
export function normalizePhone(input: string): string {
  const s = input.trim().replace(/\s+/g, '');
  if (s.startsWith('+84')) return s;
  if (s.startsWith('84')) return '+' + s;
  if (s.startsWith('0')) return '+84' + s.slice(1);
  return s;
}

/**
 * Token kỹ thuật để Supabase chấp nhận đăng ký (Auth bắt buộc 1 identifier).
 * KHÔNG bao giờ hiển thị cho user — UI hoàn toàn phone-only.
 * Phone uniqueness vẫn là invariant chính (idx_users_phone_unique trong public.users).
 */
export function phoneToAuthToken(phone: string): string {
  const normalized = normalizePhone(phone);
  const digits = normalized.replace(/\D/g, '');
  return `${digits}@phude-auth.app`;
}

export const phoneField = z
  .string()
  .trim()
  .regex(phoneRegex, 'Số điện thoại không hợp lệ');

export const loginSchema = z.object({
  phone: phoneField,
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

export const registerSchema = z
  .object({
    phone: phoneField,
    password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu không khớp',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  phone: phoneField,
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu không khớp',
    path: ['confirmPassword'],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
