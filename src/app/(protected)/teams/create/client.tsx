'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

const ONBOARDING_PROFILE_KEY = 'phude_onboarding_profile';
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export function TeamCreateForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    setSlug(slugify(newName));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data: Record<string, unknown> = {
      name: String(formData.get('name') ?? '').trim(),
      slug: String(formData.get('slug') ?? '').trim(),
      primaryColor: formData.get('primaryColor'),
      secondaryColor: formData.get('secondaryColor'),
    };

    // If user came from onboarding, attach profile so the API finalizes it.
    try {
      const stashed = sessionStorage.getItem(ONBOARDING_PROFILE_KEY);
      if (stashed) {
        const profile = JSON.parse(stashed);
        if (profile?.name && profile?.phone) {
          data.profile = profile;
        }
      }
    } catch {
      // ignore parse errors
    }

    if (!slugRegex.test(String(data.slug))) {
      toast.error('Slug chỉ được dùng chữ thường, số và dấu gạch ngang.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || 'Lỗi khi tạo đội bóng');
      }

      sessionStorage.removeItem(ONBOARDING_PROFILE_KEY);
      toast.success('Khởi tạo đội bóng thành công!');
      router.push(`/teams/${resData.slug}/dashboard`);
      router.refresh();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Có lỗi xảy ra, vui lòng thử lại.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card space-y-6 rounded-lg border p-6"
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Tên Đội Bóng *</Label>
          <Input
            id="name"
            name="name"
            required
            minLength={3}
            placeholder="Ví dụ: FC Phủi Nghệ An"
            value={name}
            onChange={handleNameChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Tên miền hiển thị (Slug) *</Label>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground bg-muted rounded-md border px-3 py-2 text-sm">
              phude.vn/teams/
            </span>
            <Input
              id="slug"
              name="slug"
              required
              pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
              placeholder="fc-phui-nghe-an"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="flex-1"
            />
          </div>
          <p className="text-muted-foreground text-xs">
            URL phải duy nhất, chỉ chữ thường, số và dấu gạch ngang.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="primaryColor">Màu Áo Chính</Label>
            <div className="flex gap-2">
              <Input
                id="primaryColor"
                name="primaryColor"
                type="color"
                className="h-10 w-12 cursor-pointer p-1"
                defaultValue="#22c55e"
              />
              <Input
                type="text"
                className="flex-1 uppercase"
                defaultValue="#22c55e"
                readOnly
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="secondaryColor">Màu Áo Phụ</Label>
            <div className="flex gap-2">
              <Input
                id="secondaryColor"
                name="secondaryColor"
                type="color"
                className="h-10 w-12 cursor-pointer p-1"
                defaultValue="#ffffff"
              />
              <Input
                type="text"
                className="flex-1 uppercase"
                defaultValue="#ffffff"
                readOnly
              />
            </div>
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Đang khởi tạo...' : 'Tạo Đội Bóng'}
        </Button>
      </div>
    </form>
  );
}
