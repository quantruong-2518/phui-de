'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import {
  useCreateMember,
  useRemoveMember,
  useTeamMembers,
  useUpdateMember,
  type Position,
  type TeamMember,
} from '@/features/teams/hooks/use-members';
import { can } from '@/lib/auth/permissions';
import type { TeamMemberRole } from '@/lib/auth/team-access';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Check,
  Clock,
  Crown,
  Loader2,
  Pause,
  Play,
  Plus,
  Shield,
  ShieldOff,
  UserMinus,
  X,
} from 'lucide-react';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

export default function TeamMembersPage() {
  const { id: slug } = useParams<{ id: string }>();
  const approved = useTeamMembers(slug, 'approved');
  const pending = useTeamMembers(slug, 'pending');
  const me = useCurrentUser();

  const approvedActive = (approved.data ?? []).filter((m) => m.is_active);
  const approvedInactive = (approved.data ?? []).filter((m) => !m.is_active);

  // Vai trò của user hiện tại trong đội (để gating UI)
  const viewerRole: TeamMemberRole | null =
    (approved.data ?? []).find((m) => m.user_id === me.data?.id)?.role ?? null;

  const canAdd = viewerRole === 'owner' || viewerRole === 'admin';

  return (
    <div className="animate-in fade-in-50 space-y-8 duration-500">
      {canAdd && (
        <div className="flex justify-end">
          <AddMemberDialog slug={slug} />
        </div>
      )}
      {(pending.data?.length ?? 0) > 0 && (
        <section className="space-y-3">
          <SectionTitle
            icon={<Clock className="h-4 w-4" />}
            label="Yêu cầu tham gia"
            count={pending.data?.length}
          />
          <div className="space-y-2">
            {pending.data?.map((m) => (
              <PendingRow key={m.id} slug={slug} member={m} />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <SectionTitle
          icon={<Shield className="h-4 w-4" />}
          label="Thành viên đang hoạt động"
          count={approvedActive.length}
        />

        {approved.isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
          </div>
        ) : approvedActive.length === 0 ? (
          <div className="bg-muted/30 text-muted-foreground rounded-xl py-10 text-center text-sm">
            Chưa có thành viên đang hoạt động.
          </div>
        ) : (
          <div className="space-y-2">
            {approvedActive.map((m) => (
              <MemberRow
                key={m.id}
                slug={slug}
                member={m}
                viewerRole={viewerRole}
              />
            ))}
          </div>
        )}
      </section>

      {approvedInactive.length > 0 && (
        <section className="space-y-3">
          <SectionTitle
            icon={<Pause className="h-4 w-4" />}
            label="Đã dừng hoạt động"
            count={approvedInactive.length}
          />
          <div className="space-y-2">
            {approvedInactive.map((m) => (
              <MemberRow
                key={m.id}
                slug={slug}
                member={m}
                viewerRole={viewerRole}
                muted
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function SectionTitle({
  icon,
  label,
  count,
}: {
  icon: React.ReactNode;
  label: string;
  count?: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground">{icon}</span>
      <h2 className="text-sm font-bold tracking-tight">
        {label}
        {typeof count === 'number' && (
          <span className="text-muted-foreground ml-2 font-normal">({count})</span>
        )}
      </h2>
    </div>
  );
}

function MemberRow({
  slug,
  member,
  viewerRole,
  muted,
}: {
  slug: string;
  member: TeamMember;
  viewerRole: TeamMemberRole | null;
  muted?: boolean;
}) {
  const update = useUpdateMember(slug);
  const remove = useRemoveMember(slug);
  const name = member.user?.name || member.display_name || 'Ẩn danh';
  const initial = name.charAt(0).toUpperCase();
  const busy = update.isPending || remove.isPending;
  const isAdminRow = member.role === 'admin';

  // Gating button qua permission helper
  const canPromote =
    viewerRole !== null && can('changeRole', { viewer: viewerRole });
  const canKick =
    viewerRole !== null &&
    can('kick', { viewer: viewerRole, target: member.role });
  const canDeactivate =
    viewerRole !== null &&
    can('deactivate', { viewer: viewerRole, target: member.role });

  const onToggleActive = () => {
    update.mutate({
      memberId: member.id,
      patch: { is_active: !member.is_active },
    });
  };

  const onKick = () => {
    if (
      confirm(
        `Xoá ${name} khỏi đội?\nLưu ý: stats và toàn bộ sự kiện thi đấu của thành viên này sẽ bị xoá theo.`,
      )
    ) {
      remove.mutate(member.id);
    }
  };

  const onPromote = () => {
    update.mutate({
      memberId: member.id,
      patch: {
        role: 'admin',
        team_role_id: 'vice_captain',
        team_role_label: 'Đội phó',
      },
    });
  };

  const onDemote = () => {
    update.mutate({
      memberId: member.id,
      patch: {
        role: 'member',
        team_role_id: 'member',
        team_role_label: 'Thành viên',
      },
    });
  };

  return (
    <div
      className={`bg-muted/40 flex items-center gap-3 rounded-xl p-3 shadow-sm ${
        muted ? 'opacity-70' : ''
      }`}
    >
      <Avatar className="h-10 w-10">
        <AvatarFallback>{initial}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate font-semibold">{name}</p>
          <RoleBadge role={member.role} />
          {member.jersey_code && (
            <Badge variant="outline" className="font-mono text-[10px]">
              #{member.jersey_code}
            </Badge>
          )}
        </div>
        {member.team_role_label && (
          <p className="text-muted-foreground truncate text-xs">
            {member.team_role_label}
          </p>
        )}
      </div>
      {(canPromote || canDeactivate || canKick) && (
        <div className="flex items-center gap-1">
          {canPromote &&
            (isAdminRow ? (
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground h-8 w-8"
                disabled={busy}
                onClick={onDemote}
                aria-label="Thu hồi quyền đội phó"
                title="Thu hồi quyền đội phó"
              >
                <ShieldOff className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground h-8 w-8"
                disabled={busy}
                onClick={onPromote}
                aria-label="Cấp quyền đội phó"
                title="Cấp quyền đội phó"
              >
                <Shield className="h-4 w-4" />
              </Button>
            ))}
          {canDeactivate && (
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground h-8 w-8"
              disabled={busy}
              onClick={onToggleActive}
              aria-label={member.is_active ? 'Dừng hoạt động' : 'Mở lại hoạt động'}
              title={member.is_active ? 'Dừng hoạt động' : 'Mở lại hoạt động'}
            >
              {member.is_active ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
          )}
          {canKick && (
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive h-8 w-8"
              disabled={busy}
              onClick={onKick}
              aria-label="Xoá khỏi đội"
              title="Xoá khỏi đội"
            >
              <UserMinus className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function PendingRow({ slug, member }: { slug: string; member: TeamMember }) {
  const update = useUpdateMember(slug);
  const name = member.user?.name || member.display_name || 'Ẩn danh';
  const initial = name.charAt(0).toUpperCase();
  const busy = update.isPending;

  return (
    <div className="bg-muted/40 flex items-center gap-3 rounded-xl p-3 shadow-sm">
      <Avatar className="h-10 w-10">
        <AvatarFallback>{initial}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{name}</p>
        <p className="text-muted-foreground truncate text-xs">
          Gửi yêu cầu {formatDate(member.requested_at)}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          className="h-8 text-xs"
          disabled={busy}
          onClick={() =>
            update.mutate({
              memberId: member.id,
              patch: { approval_status: 'rejected' },
            })
          }
        >
          <X className="mr-1 h-3.5 w-3.5" />
          Từ chối
        </Button>
        <Button
          size="sm"
          className="h-8 text-xs"
          disabled={busy}
          onClick={() =>
            update.mutate({
              memberId: member.id,
              patch: { approval_status: 'approved' },
            })
          }
        >
          <Check className="mr-1 h-3.5 w-3.5" />
          Duyệt
        </Button>
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role: 'owner' | 'admin' | 'member' }) {
  if (role === 'owner') {
    return (
      <Badge variant="secondary" className="gap-1 text-[10px]">
        <Crown className="h-3 w-3" />
        Đội trưởng
      </Badge>
    );
  }
  if (role === 'admin') {
    return (
      <Badge variant="secondary" className="gap-1 text-[10px]">
        <Shield className="h-3 w-3" />
        Đội phó
      </Badge>
    );
  }
  return null;
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('vi-VN');
  } catch {
    return '';
  }
}

const NO_POS = '__none__';
const POSITIONS: Position[] = ['GK', 'DF', 'MF', 'FW'];
const POS_LABEL: Record<Position, string> = {
  GK: 'Thủ môn',
  DF: 'Hậu vệ',
  MF: 'Tiền vệ',
  FW: 'Tiền đạo',
};

const addSchema = z.object({
  display_name: z.string().trim().min(1, 'Bắt buộc').max(80),
  jersey_code: z.string().trim().max(10).optional(),
  position: z.string(),
});

type AddSchema = z.infer<typeof addSchema>;

function AddMemberDialog({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false);
  const create = useCreateMember(slug);

  const form = useForm<AddSchema>({
    resolver: zodResolver(addSchema),
    defaultValues: { display_name: '', jersey_code: '', position: NO_POS },
  });

  const onSubmit = (data: AddSchema) => {
    create.mutate(
      {
        display_name: data.display_name,
        jersey_code: data.jersey_code?.trim() || null,
        position:
          data.position === NO_POS ? null : (data.position as Position),
      },
      {
        onSuccess: () => {
          form.reset({ display_name: '', jersey_code: '', position: NO_POS });
          setOpen(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Thêm thành viên
      </Button>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Thêm thành viên</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground text-xs">
          Dùng cho cả người không có tài khoản. Có thể link tài khoản sau.
        </p>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-3 py-1"
            noValidate
          >
            <FormField
              control={form.control}
              name="display_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Tên hiển thị *</FormLabel>
                  <FormControl>
                    <Input placeholder="Vd. Tùng" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="jersey_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Số áo</FormLabel>
                    <FormControl>
                      <Input
                        inputMode="numeric"
                        placeholder="9"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Vị trí</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={NO_POS}>— Không —</SelectItem>
                        {POSITIONS.map((p) => (
                          <SelectItem key={p} value={p}>
                            {POS_LABEL[p]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={create.isPending}
              >
                Huỷ
              </Button>
              <Button type="submit" disabled={create.isPending}>
                {create.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Thêm
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
