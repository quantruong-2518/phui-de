'use client';

import { useOnboarding } from '@/hooks/use-onboarding';
import { OnboardingModal } from '@/components/onboarding/OnboardingModal';
import { BottomNav } from '@/components/navigation/BottomNav';
import { Sidebar } from '@/components/navigation/Sidebar';
import { TeamDetailTab } from '@/components/home/TeamDetailTab';

export default function Home() {
  const { isOnboarded, data } = useOnboarding();

  if (!isOnboarded) {
    return <OnboardingModal />;
  }

  return (
    <div className="bg-background flex min-h-screen">
      <Sidebar />

      <main className="flex-1 pb-16 md:pb-0">
        <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
          <TeamDetailTab memberName={data?.name} role={data?.role} />
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
