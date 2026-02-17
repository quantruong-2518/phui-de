import { AuthLayout } from '@/features/auth';
import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quên mật khẩu',
  description: 'Khôi phục mật khẩu tài khoản Phủi Đê',
};

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Quên mật khẩu"
      subtitle="Chúng tôi sẽ giúp bạn khôi phục lại quyền truy cập"
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
