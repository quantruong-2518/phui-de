import { FieldsClient } from './fields-client';

export default function AdminFieldsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold tracking-tight">Quản lý sân bãi</h1>
        <p className="text-muted-foreground text-sm">
          Catalog sân để các đội chọn khi tạo trận. Chỉ admin được sửa.
        </p>
      </div>
      <FieldsClient />
    </div>
  );
}
