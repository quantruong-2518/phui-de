import { AuthLayout, RegisterForm } from '@/features/auth';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Đăng ký',
  description: 'Tạo tài khoản mới trên Phủi Đê',
};

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Tạo tài khoản"
      subtitle="Bắt đầu hành trình quản lý đội bóng của bạn"
    >
      <RegisterForm />
    </AuthLayout>
  );
}
