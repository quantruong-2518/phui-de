import { Calendar, Clock, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Booking {
  id: string;
  field_name: string;
  address: string;
  date: string;
  time_slot: string;
  price: number;
  status: string;
  image: string | null;
}

interface BookingCardProps {
  booking: Booking;
}

export function BookingCard({ booking }: BookingCardProps) {
  return (
    <Card className="group relative overflow-hidden border-0 p-0 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="p-0">
        {/* Image Placeholder */}
        <div className="relative flex h-40 w-full items-center justify-center overflow-hidden rounded-t-xl bg-zinc-800">
          <MapPin className="h-10 w-10 text-zinc-600" />
          <Badge className="bg-background/80 text-foreground hover:bg-background/90 absolute top-3 right-3 backdrop-blur-sm">
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
            }).format(booking.price)}
            /h
          </Badge>
        </div>

        <div className="bg-card space-y-4 rounded-b-xl p-6 shadow-sm">
          <div>
            <h3 className="mb-1 text-lg leading-none font-bold">
              {booking.field_name}
            </h3>
            <p className="text-muted-foreground line-clamp-1 text-sm">
              {booking.address}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="text-primary h-4 w-4" />
              <span>{booking.date}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="text-primary h-4 w-4" />
              <span className="font-mono">{booking.time_slot}</span>
            </div>
          </div>

          <div className="pt-2">
            <Button
              className="w-full"
              variant={booking.status === 'confirmed' ? 'outline' : 'default'}
            >
              {booking.status === 'confirmed' ? 'Đã Đặt' : 'Đặt Ngay'}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
