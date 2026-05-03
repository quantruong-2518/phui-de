import { MapPinned } from 'lucide-react';
import { FieldsClient } from './fields-client';

export default function AdminFieldsPage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Featured header — đồng bộ với team detail */}
      <header className="card-featured relative overflow-hidden rounded-2xl p-4 sm:p-5">
        <div className="absolute top-0 right-0 h-32 w-32 translate-x-1/3 -translate-y-1/3 rotate-45 transform bg-white/5 blur-3xl" />
        <div className="bg-amber-500/10 absolute bottom-0 left-0 h-32 w-32 -translate-x-1/3 translate-y-1/3 rotate-12 transform blur-3xl" />

        <div className="relative flex items-center gap-3 sm:gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 shadow-sm sm:h-14 sm:w-14">
            <MapPinned className="h-5 w-5 sm:h-7 sm:w-7" />
          </div>
          <div className="min-w-0 flex-1 space-y-0.5">
            <h1 className="text-lg font-bold tracking-tight sm:text-2xl">
              Quản lý sân bãi
            </h1>
            <p className="text-muted-foreground hidden text-sm sm:block">
              Catalog sân để các đội chọn khi tạo trận. Chỉ admin được sửa.
            </p>
          </div>
        </div>
      </header>

      <FieldsClient />
    </div>
  );
}
