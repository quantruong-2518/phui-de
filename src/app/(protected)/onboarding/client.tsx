'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { FindTeamForm } from '@/components/shared/FindTeamForm';

const ONBOARDING_PROFILE_KEY = 'phude_onboarding_profile';

export function OnboardingForm({
  initialProfile,
}: {
  initialProfile: {
    name?: string;
    phone?: string;
  };
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [savedProfile, setSavedProfile] = useState({
    name: initialProfile?.name || '',
    phone: initialProfile?.phone || '',
  });

  const handleSubmitProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = (formData.get('name') as string).trim();

    try {
      const response = await fetch('/api/onboarding', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Lỗi khi lưu thông tin');
      }

      setSavedProfile((p) => ({ ...p, name }));
      setStep(2);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Có lỗi, thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTeamSelection = async (selection: {
    type: string;
    id?: string;
    name?: string;
  }) => {
    setIsLoading(true);

    try {
      // "Tạo đội mới" — defer to /teams/create which finalizes onboarding atomically.
      if (selection.type === 'create_new') {
        sessionStorage.setItem(
          ONBOARDING_PROFILE_KEY,
          JSON.stringify(savedProfile),
        );
        router.push('/teams/create');
        return;
      }

      const isJoining = selection.type === 'join_existing';
      const payload: Record<string, unknown> = {
        name: savedProfile.name,
        status: isJoining ? 'team_member' : 'free_agent',
        team: isJoining && selection.id ? { id: selection.id } : undefined,
        role: isJoining
          ? { id: 'member', label: 'Đội viên', requiresApproval: true }
          : { id: 'member', label: 'Cầu thủ tự do', requiresApproval: false },
      };

      if (isJoining && !selection.id) {
        throw new Error('Thiếu thông tin đội — vui lòng chọn lại.');
      }

      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Lỗi lưu thông tin đội');
      }

      toast.success('Hồ sơ đã hoàn thiện!');
      router.push('/teams');
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Lỗi lưu thông tin đội');
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 2) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-in-out">
        <FindTeamForm onTeamSelected={handleTeamSelection} />
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmitProfile}
      className="bg-card text-card-foreground space-y-4 rounded-lg border p-6 shadow-sm"
    >
      <div className="space-y-2">
        <Label htmlFor="name">Họ và Tên</Label>
        <Input
          id="name"
          name="name"
          required
          minLength={2}
          placeholder="Nhập tên của bạn"
          defaultValue={initialProfile?.name || ''}
        />
      </div>

      {initialProfile?.phone && (
        <div className="bg-muted/30 text-muted-foreground rounded-md border px-3 py-2 text-xs">
          Đăng nhập: <span className="text-foreground font-mono">{initialProfile.phone}</span>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Đang lưu...' : 'Tiếp tục'}
      </Button>
    </form>
  );
}
