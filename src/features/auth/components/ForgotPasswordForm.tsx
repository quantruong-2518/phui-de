'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function ForgotPasswordForm() {
  return (
    <div className="space-y-6">
      <div className="bg-muted/30 text-muted-foreground rounded-md border p-4 text-sm">
        Tài khoản dùng số điện thoại + mật khẩu. Tính năng đặt lại mật khẩu
        qua SMS chưa được bật. Vui lòng liên hệ quản trị viên để được hỗ trợ.
      </div>

      <Link href="/login" className="block">
        <Button variant="outline" className="w-full">
          Quay lại đăng nhập
        </Button>
      </Link>
    </div>
  );
}
