import { Calendar, MapPin, Clock } from 'lucide-react';

export function UpcomingEvents() {
  // Mock data - replace with real API
  const events = [
    {
      id: '1',
      type: 'match',
      title: 'Giao hữu vs FC Sài Gòn',
      date: '2024-02-20',
      time: '18:00',
      location: 'Sân Mỹ Đình',
    },
    {
      id: '2',
      type: 'practice',
      title: 'Tập luyện',
      date: '2024-02-18',
      time: '17:00',
      location: 'Sân Hàng Đẫy',
    },
  ];

  if (events.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center">
        <p className="text-muted-foreground text-xs">Chưa có sự kiện nào</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {events.map((event) => (
        <div
          key={event.id}
          className="hover:border-primary hover:bg-primary/5 cursor-pointer rounded-lg border p-2.5 transition-all"
        >
          <div className="flex items-start gap-2">
            <div className="bg-primary/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
              <Calendar className="text-primary h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="truncate text-sm font-semibold">{event.title}</h4>
              <div className="text-muted-foreground mt-1 flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {event.time}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {event.location}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
