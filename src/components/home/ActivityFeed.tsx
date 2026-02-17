import { UserPlus, Trophy, Bell } from 'lucide-react';

export function ActivityFeed() {
  // Mock data - replace with real API
  const activities = [
    {
      id: '1',
      type: 'new_member',
      icon: UserPlus,
      title: 'Nguyễn Văn A đã tham gia đội',
      time: '2 giờ trước',
    },
    {
      id: '2',
      type: 'match_result',
      icon: Trophy,
      title: 'Thắng FC Đà Nẵng 3-2',
      time: '1 ngày trước',
    },
    {
      id: '3',
      type: 'notification',
      icon: Bell,
      title: 'Đội trưởng đã cập nhật lịch tập',
      time: '2 ngày trước',
    },
  ];

  if (activities.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center">
        <p className="text-muted-foreground text-xs">Chưa có hoạt động nào</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {activities.map((activity) => {
        const Icon = activity.icon;
        return (
          <div
            key={activity.id}
            className="hover:bg-muted/50 flex items-start gap-2.5 rounded-lg p-2.5 transition-colors"
          >
            <div className="bg-primary/10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full">
              <Icon className="text-primary h-3.5 w-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{activity.title}</p>
              <p className="text-muted-foreground mt-0.5 text-xs">
                {activity.time}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
