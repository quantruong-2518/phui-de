'use client';

import { Settings, Shield, Bell, Users, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

export default function TeamSettingsPage() {
  return (
    <div className="animate-in fade-in-50 space-y-6 duration-500">
      <div className="space-y-1">
        <h2 className="text-lg font-bold tracking-tight">Cài đặt đội bóng</h2>
        <p className="text-muted-foreground text-sm">
          Quản lý thông tin và thiết lập quyền riêng tư.
        </p>
      </div>

      <div className="bg-card space-y-6 rounded-xl border p-6 shadow-sm">
        {/* General Info */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-muted flex h-16 w-16 items-center justify-center rounded-xl">
              <Shield className="text-muted-foreground h-8 w-8" />
            </div>
            <div>
              <h3 className="font-semibold">PassionFC</h3>
              <p className="text-muted-foreground text-sm">
                Đội trưởng: Steve Trương
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm">
            Chỉnh sửa
          </Button>
        </div>

        <Separator />

        {/* Preferences */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span className="text-sm font-medium">Thông báo trận đấu</span>
              </div>
              <p className="text-muted-foreground text-xs">
                Nhận thông báo khi có lịch đấu mới.
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Cho phép xin gia nhập
                </span>
              </div>
              <p className="text-muted-foreground text-xs">
                Người lạ có thể gửi yêu cầu tham gia.
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>

        <Separator />

        {/* Danger Zone */}
        <div>
          <h3 className="text-destructive mb-4 text-sm font-bold tracking-wider uppercase">
            Danger Zone
          </h3>
          <Button variant="destructive" className="w-full gap-2 sm:w-auto">
            <Trash2 className="h-4 w-4" />
            Giải tán đội bóng
          </Button>
        </div>
      </div>
    </div>
  );
}
