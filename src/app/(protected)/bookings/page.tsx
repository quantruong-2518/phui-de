'use client';

import { Button } from '@/components/ui/button';
import { MOCK_BOOKINGS } from '@/lib/mock-data';
import { BookingCard } from '@/features/bookings/components/BookingCard';

export default function BookingsPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      {/* Header */}
      <div className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">ĐẶT SÂN</h1>
          <p className="text-muted-foreground text-sm">
            Tìm kiếm và đặt sân bóng trực tuyến.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="h-10 rounded-md px-4 text-sm font-medium"
          >
            Lịch sử đặt sân
          </Button>
          <Button className="h-10 rounded-md px-4 text-sm font-medium">
            Tìm sân nhanh
          </Button>
        </div>
      </div>

      {/* Bookings List */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {MOCK_BOOKINGS.map((booking) => (
          <BookingCard key={booking.id} booking={booking} />
        ))}
      </div>
    </div>
  );
}
