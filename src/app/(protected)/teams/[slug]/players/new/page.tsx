'use client';

import { PlayerForm } from '@/features/players/components/PlayerForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function NewPlayerPage() {
  const params = useParams();
  const slug = params.slug as string;

  return (
    <div className="container mx-auto max-w-lg py-6">
      <Link
        href={`/teams/${slug}/players`}
        className="text-muted-foreground hover:text-foreground mb-8 inline-flex items-center text-sm font-medium"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Quay lại danh sách
      </Link>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Thêm cầu thủ</h1>
          <p className="text-muted-foreground">
            Nhập thông tin cầu thủ mới vào đội bóng.
          </p>
        </div>

        <div className="bg-card text-card-foreground rounded-xl border p-6 shadow">
          <PlayerForm />
        </div>
      </div>
    </div>
  );
}
