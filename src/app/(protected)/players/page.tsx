import { ShieldHalf } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PlayersPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="bg-card flex flex-col items-center rounded-2xl p-12 text-center shadow-sm">
        <div className="bg-muted/40 mb-4 flex h-14 w-14 items-center justify-center rounded-full">
          <ShieldHalf className="text-muted-foreground h-7 w-7" />
        </div>
        <h1 className="text-2xl font-bold">Cầu thủ</h1>
        <p className="text-muted-foreground mt-2 max-w-sm text-sm">
          Quản lý cầu thủ trong phạm vi từng đội. Vào trang đội của bạn để
          xem danh sách squad chi tiết.
        </p>
        <Link href="/teams">
          <Button className="mt-6">Tới đội của tôi</Button>
        </Link>
      </div>
    </div>
  );
}
