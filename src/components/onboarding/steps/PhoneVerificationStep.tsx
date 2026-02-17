'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TEAM_ROLES, FREE_AGENT_ROLES } from '@/hooks/use-onboarding';
import {
  ArrowLeft,
  ArrowRight,
  Phone,
  User,
  MessageCircle,
} from 'lucide-react';

interface PhoneVerificationStepProps {
  status: 'team_member' | 'free_agent';
  team?: { id: string; name: string; code: string };
  roleId: string;
  customRole?: string;
  onNext: (phone: string, name: string) => void;
  onBack: () => void;
}

// Vietnamese name validation: allows Vietnamese characters, spaces, and common punctuation
const vietnameseNameRegex =
  /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵýỷỹ\s'-]+$/;

// Vietnamese phone number validation: supports all major carriers
// Format: 0 + (3|5|7|8|9) + 8 digits
const vietnamesePhoneRegex = /^0(3|5|7|8|9)\d{8}$/;

const verificationSchema = z.object({
  name: z
    .string()
    .min(2, 'Tên phải có ít nhất 2 ký tự')
    .max(50, 'Tên không được quá 50 ký tự')
    .regex(
      vietnameseNameRegex,
      'Tên chỉ được chứa chữ cái tiếng Việt, khoảng trắng và dấu gạch nối',
    ),
  phone: z
    .string()
    .regex(vietnamesePhoneRegex, 'Số điện thoại không hợp lệ (VD: 0912345678)'),
});

type VerificationForm = z.infer<typeof verificationSchema>;

export function PhoneVerificationStep({
  team,
  roleId,
  customRole,
  onNext,
  onBack,
}: PhoneVerificationStepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
  } = useForm<VerificationForm>({
    resolver: zodResolver(verificationSchema),
    mode: 'onChange',
  });

  const allRoles = [...TEAM_ROLES, ...FREE_AGENT_ROLES];
  const selectedRole =
    roleId === 'custom'
      ? {
          id: 'custom',
          label: customRole || 'Vai trò khác',
          icon: '⭐',
          requiresApproval: true,
        }
      : allRoles.find((r) => r.id === roleId);

  const needsApproval = selectedRole?.requiresApproval || false;

  const onSubmit = (data: VerificationForm) => {
    onNext(data.phone, data.name);
  };

  return (
    <div className="flex h-full w-full flex-col">
      {/* Content area - scrollable */}
      <div className="flex-1 overflow-y-auto pb-24">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mx-auto max-w-md space-y-6"
        >
          {/* Role Badge - Compact */}
          <div className="from-primary/5 to-accent/5 border-muted-foreground/10 flex items-center gap-3 rounded-2xl border bg-gradient-to-r p-3">
            <div className="bg-background flex h-12 w-12 items-center justify-center rounded-xl text-2xl shadow-sm">
              {selectedRole?.icon}
            </div>
            <div className="flex-1">
              <div className="text-base font-bold">{selectedRole?.label}</div>
              {team && (
                <div className="text-muted-foreground text-xs">{team.name}</div>
              )}
            </div>
          </div>

          {/* Form Inputs */}
          <div className="space-y-4">
            {/* Name Input */}
            <div className="space-y-2">
              <label className="text-muted-foreground text-sm font-medium">
                Họ và tên
              </label>
              <div className="relative">
                <User className="text-muted-foreground absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
                <Input
                  {...register('name')}
                  type="text"
                  placeholder="Nguyễn Văn A"
                  className={`h-12 rounded-xl border-2 pl-11 text-base transition-colors focus-visible:ring-0 ${
                    errors.name
                      ? 'border-destructive focus-visible:border-destructive'
                      : 'border-muted-foreground/20 focus-visible:border-primary'
                  }`}
                />
              </div>
              {errors.name && (
                <p className="text-destructive text-sm">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Phone Input */}
            <div className="space-y-2">
              <label className="text-muted-foreground text-sm font-medium">
                Số điện thoại
              </label>
              <div className="relative">
                <Phone className="text-muted-foreground absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
                <Input
                  {...register('phone')}
                  type="tel"
                  placeholder="0912 345 678"
                  maxLength={10}
                  className={`h-12 rounded-xl border-2 pl-11 text-base transition-colors focus-visible:ring-0 ${
                    errors.phone
                      ? 'border-destructive focus-visible:border-destructive'
                      : 'border-muted-foreground/20 focus-visible:border-primary'
                  }`}
                />
              </div>
              {errors.phone && (
                <p className="text-destructive text-sm">
                  {errors.phone.message}
                </p>
              )}
            </div>
          </div>

          {/* Zalo Verification - Only for roles requiring approval */}
          {needsApproval && (
            <div className="relative overflow-hidden rounded-2xl border border-green-200/50 bg-gradient-to-br from-green-50 to-emerald-50 p-5 dark:border-green-800/50 dark:from-green-950/20 dark:to-emerald-950/20">
              {/* Decorative element */}
              <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-green-400/10 blur-3xl" />

              <div className="relative space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10">
                    <MessageCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="font-bold text-green-900 dark:text-green-100">
                    Xác minh qua Zalo
                  </div>
                </div>

                <p className="text-sm leading-relaxed text-green-800/80 dark:text-green-200/80">
                  Vai trò{' '}
                  <span className="font-semibold text-green-900 dark:text-green-100">
                    {selectedRole?.label}
                  </span>{' '}
                  cần được xác nhận qua nhóm Zalo
                </p>

                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="h-11 w-full rounded-xl border border-green-600/30 bg-white/50 font-semibold text-green-700 hover:bg-green-50 dark:bg-green-950/30 dark:text-green-300 dark:hover:bg-green-900/40"
                  onClick={() =>
                    window.open('https://zalo.me/g/phuideverify', '_blank')
                  }
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Tham gia nhóm Zalo
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Floating Navigation */}
      <div className="bg-background/95 fixed right-0 bottom-0 left-0 px-4 py-6 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            size="lg"
            className="border-muted-foreground/20 h-12 flex-1 rounded-xl"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit(onSubmit)}
            disabled={!isValid || !isDirty}
            size="lg"
            className="h-12 flex-1 rounded-xl"
          >
            Hoàn tất
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
