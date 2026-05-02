import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { TeamCreateForm } from './client';

export const metadata = {
  title: 'Tạo Đội Bóng Mới',
};

export default async function CreateTeamPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="container max-w-2xl py-12">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Tạo Đội Bóng Mới
          </h1>
          <p className="text-muted-foreground">
            Bắt đầu hành trình chinh phục các giải đấu sân 7 bằng cách khởi tạo
            thông tin đội bóng của bạn. Bạn sẽ tự động trở thành Quản lý (Owner)
            của đội này.
          </p>
        </div>

        <TeamCreateForm />
      </div>
    </div>
  );
}
