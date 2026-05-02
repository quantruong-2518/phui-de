'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import {
  useRemoveMember,
  useTeamMembers,
  useUpdateMember,
  type TeamMember,
} from '@/features/teams/hooks/use-members';
import { can } from '@/lib/auth/permissions';
import type { TeamMemberRole } from '@/lib/auth/team-access';
import {
  Check,
  Clock,
  Crown,
  Loader2,
  Pause,
  Play,
  Shield,
  ShieldOff,
  UserMinus,
  X,
} from 'lucide-react';
import { useParams } from 'next/navigation';

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

  return (
    <div className="animate-in fade-in-50 space-y-8 duration-500">
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
          <div className="bg-muted/30 text-muted-foreground rounded-xl border border-dashed py-10 text-center text-sm">
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
  const name = member.user?.name || 'Ẩn danh';
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
      className={`bg-card flex items-center gap-3 rounded-xl border p-3 ${
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
  const name = member.user?.name || 'Ẩn danh';
  const initial = name.charAt(0).toUpperCase();
  const busy = update.isPending;

  return (
    <div className="bg-card flex items-center gap-3 rounded-xl border p-3">
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
