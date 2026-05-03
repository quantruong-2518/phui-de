'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useTeam, useUpdateTeam } from '@/features/teams/hooks/use-team';
import {
  useRemoveMember,
  useTeamMembers,
  useUpdateMember,
} from '@/features/teams/hooks/use-members';
import { Loader2, ShieldCheck, Trash2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function TeamSettingsPage() {
  const { id: slug } = useParams<{ id: string }>();
  const { data: team, isLoading } = useTeam(slug);
  const updateTeam = useUpdateTeam(slug);
  const { data: members } = useTeamMembers(slug);
  const updateMember = useUpdateMember(slug);
  const removeMember = useRemoveMember(slug);

  const [name, setName] = useState('');
  const [primary, setPrimary] = useState('#22c55e');
  const [secondary, setSecondary] = useState('#ffffff');

  useEffect(() => {
    if (team) {
      setName(team.name);
      setPrimary(team.primary_color || '#22c55e');
      setSecondary(team.secondary_color || '#ffffff');
    }
  }, [team]);

  if (isLoading || !team) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
      </div>
    );
  }

  const handleSave = () => {
    const patch: Record<string, string> = {};
    if (name !== team.name) patch.name = name;
    if (primary !== team.primary_color) patch.primary_color = primary;
    if (secondary !== team.secondary_color) patch.secondary_color = secondary;
    if (Object.keys(patch).length === 0) return;
    updateTeam.mutate(patch);
  };

  const pending = (members ?? []).filter((m) => m.approval_status === 'pending');
  const approved = (members ?? []).filter((m) => m.approval_status === 'approved');

  return (
    <div className="animate-in fade-in-50 space-y-6 duration-500">
      <div className="space-y-1">
        <h2 className="text-lg font-bold tracking-tight">Cài đặt đội bóng</h2>
        <p className="text-muted-foreground text-sm">
          Quản lý thông tin và thành viên.
        </p>
      </div>

      {/* General Info */}
      <div className="bg-card space-y-4 rounded-xl p-6 shadow-sm">
        <h3 className="font-bold">Thông tin đội</h3>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="name">Tên đội</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Màu chính</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={primary}
                  onChange={(e) => setPrimary(e.target.value)}
                  className="h-10 w-12 p-1"
                />
                <Input value={primary} onChange={(e) => setPrimary(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Màu phụ</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={secondary}
                  onChange={(e) => setSecondary(e.target.value)}
                  className="h-10 w-12 p-1"
                />
                <Input
                  value={secondary}
                  onChange={(e) => setSecondary(e.target.value)}
                />
              </div>
            </div>
          </div>
          <Button onClick={handleSave} disabled={updateTeam.isPending}>
            {updateTeam.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Lưu thay đổi
          </Button>
        </div>
      </div>

      {/* Pending requests */}
      {pending.length > 0 && (
        <div className="bg-card space-y-3 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-bold">Yêu cầu tham gia</h3>
            <Badge variant="secondary">{pending.length}</Badge>
          </div>
          {pending.map((m) => (
            <div
              key={m.id}
              className="hover:bg-muted/30 flex items-center gap-3 rounded-md py-2 px-3 transition-colors"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {(m.user?.name || '?').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  {m.user?.name || '(chưa rõ)'}
                </p>
                <p className="text-muted-foreground text-xs">
                  {m.team_role_label || m.team_role_id || 'Đội viên'}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  updateMember.mutate({
                    memberId: m.id,
                    patch: { approval_status: 'rejected' },
                  })
                }
                disabled={updateMember.isPending}
              >
                Từ chối
              </Button>
              <Button
                size="sm"
                onClick={() =>
                  updateMember.mutate({
                    memberId: m.id,
                    patch: { approval_status: 'approved' },
                  })
                }
                disabled={updateMember.isPending}
              >
                <ShieldCheck className="mr-1 h-4 w-4" />
                Duyệt
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Approved members */}
      <div className="bg-card space-y-3 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="font-bold">Thành viên ({approved.length})</h3>
        </div>
        {approved.length === 0 && (
          <p className="text-muted-foreground py-2 text-sm">Chưa có thành viên.</p>
        )}
        {approved.map((m) => (
          <div
            key={m.id}
            className="hover:bg-muted/30 flex items-center gap-3 rounded-md py-2 px-3 transition-colors"
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {(m.user?.name || '?').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-semibold">
                  {m.user?.name || '(chưa rõ)'}
                </p>
                {m.role === 'owner' && (
                  <Badge className="text-[10px]">Owner</Badge>
                )}
                {m.role === 'admin' && (
                  <Badge variant="secondary" className="text-[10px]">
                    Admin
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground text-xs">
                {m.team_role_label || m.team_role_id || 'Đội viên'}
              </p>
            </div>
            {m.role !== 'owner' && (
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive h-8 w-8"
                onClick={() => {
                  if (confirm('Xóa thành viên này?')) removeMember.mutate(m.id);
                }}
                disabled={removeMember.isPending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <Separator />
      <p className="text-muted-foreground text-xs">
        Chức năng giải tán đội sẽ thêm sau.
      </p>
    </div>
  );
}
