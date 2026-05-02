import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { OnboardingForm } from './client';

export const metadata = {
  title: 'Hoàn thiện hồ sơ',
};

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('users')
    .select('name, phone, onboarding_completed')
    .eq('id', user.id)
    .single();

  if (profile?.onboarding_completed) {
    redirect('/teams');
  }

  return (
    <div className="container max-w-2xl py-12">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Hoàn thiện hồ sơ
          </h1>
          <p className="text-muted-foreground">
            Vui lòng cung cấp thông tin cá nhân để bắt đầu tham gia các đội bóng.
          </p>
        </div>
        <OnboardingForm
          initialProfile={{
            name: profile?.name || '',
            phone: profile?.phone || '',
          }}
        />
      </div>
    </div>
  );
}
