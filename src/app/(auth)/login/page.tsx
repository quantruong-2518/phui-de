import { AuthLayout, LoginForm } from '@/features/auth';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Đăng nhập',
  description: 'Đăng nhập vào Phủi Đê',
};

export default function LoginPage() {
  return (
    <AuthLayout
      title="Chào mừng trở lại"
      subtitle="Đăng nhập vào tài khoản của bạn"
    >
      <LoginForm />
    </AuthLayout>
  );
}
