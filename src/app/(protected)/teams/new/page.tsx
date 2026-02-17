import { CreateTeamForm } from '@/features/teams/components/CreateTeamForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateTeamPage() {
  return (
    <div className="container mx-auto max-w-lg py-10">
      <Link
        href="/teams"
        className="text-muted-foreground hover:text-foreground mb-8 inline-flex items-center text-sm font-medium"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Quay lại danh sách
      </Link>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Tạo đội bóng mới
          </h1>
          <p className="text-muted-foreground">
            Thiết lập thông tin cơ bản cho đội bóng của bạn.
          </p>
        </div>

        <div className="bg-card text-card-foreground rounded-xl border p-6 shadow">
          <CreateTeamForm />
        </div>
      </div>
    </div>
  );
}
