'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  useCreateField,
  useDeleteField,
  useFields,
  useUpdateField,
} from '@/features/fields/hooks/use-fields';
import {
  fieldSchema,
} from '@/features/fields/validations/field-schemas';
import type { Field } from '@/features/fields/types/field.types';
import {
  Camera,
  ExternalLink,
  Loader2,
  MapPinned,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export function FieldsClient() {
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [editing, setEditing] = useState<Field | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 250);
    return () => clearTimeout(t);
  }, [search]);

  const { data: fields, isLoading } = useFields(debounced || undefined);
  const remove = useDeleteField();

  const handleDelete = (f: Field) => {
    if (confirm(`Xoá sân "${f.name}"? Không hoàn tác được.`)) {
      remove.mutate(f.id);
    }
  };

  const count = fields?.length ?? 0;

  return (
    <div className="space-y-4">
      {/* Toolbar — mobile-first: stack, sm+ horizontal */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Tìm theo tên sân…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => setCreating(true)} className="w-full gap-1.5 sm:w-auto">
          <Plus className="h-4 w-4" />
          Thêm sân
        </Button>
      </div>

      {/* Section title + count */}
      <div className="flex items-center gap-2">
        <MapPinned className="text-muted-foreground h-4 w-4" />
        <h2 className="text-sm font-bold tracking-tight">
          Danh sách sân
          {!isLoading && (
            <span className="text-muted-foreground ml-2 font-normal">
              ({count})
            </span>
          )}
        </h2>
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
        </div>
      ) : count === 0 ? (
        <div className="bg-muted/30 text-muted-foreground rounded-xl py-12 text-center text-sm">
          {debounced
            ? 'Không tìm thấy sân nào.'
            : 'Chưa có sân nào. Bấm “Thêm sân” để bắt đầu.'}
        </div>
      ) : (
        <div className="space-y-2">
          {fields!.map((f) => (
            <FieldRow
              key={f.id}
              field={f}
              onEdit={() => setEditing(f)}
              onDelete={() => handleDelete(f)}
              busyDelete={remove.isPending}
            />
          ))}
        </div>
      )}

      <FieldDialog
        open={creating}
        onClose={() => setCreating(false)}
        mode="create"
      />
      <FieldDialog
        open={!!editing}
        field={editing}
        onClose={() => setEditing(null)}
        mode="edit"
      />
    </div>
  );
}

function FieldRow({
  field,
  onEdit,
  onDelete,
  busyDelete,
}: {
  field: Field;
  onEdit: () => void;
  onDelete: () => void;
  busyDelete: boolean;
}) {
  return (
    <div className="bg-card flex items-start gap-3 rounded-xl p-3 shadow-sm sm:p-4">
      <div className="min-w-0 flex-1 space-y-1">
        {/* Tên + badges (always) */}
        <div className="flex flex-wrap items-center gap-1.5">
          <h3 className="truncate text-sm font-semibold sm:text-base">
            {field.name}
          </h3>
          <Badge variant="secondary" className="text-[10px]">
            {field.pitch_count} sân
          </Badge>
          {field.has_camera && (
            <Badge variant="outline" className="gap-1 text-[10px]">
              <Camera className="h-3 w-3" />
              Có cam
            </Badge>
          )}
        </div>

        {/* Địa chỉ — quan trọng, hiện cả mobile */}
        {field.address && (
          <p className="text-muted-foreground truncate text-xs">
            {field.address}
          </p>
        )}

        {/* Liên hệ + maps — quan trọng action, hiện cả mobile */}
        <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          {field.contact_phone && (
            <a
              href={`tel:${field.contact_phone}`}
              className="hover:text-foreground inline-flex items-center gap-1"
            >
              <Phone className="h-3 w-3" />
              {field.contact_phone}
            </a>
          )}
          {field.google_maps_url && (
            <a
              href={field.google_maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground inline-flex items-center gap-1"
            >
              <MapPinned className="h-3 w-3" />
              Bản đồ
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>

        {/* Notes — phụ, ẩn mobile để giữ row gọn */}
        {field.notes && (
          <p className="text-muted-foreground/80 hidden text-xs italic sm:block">
            {field.notes}
          </p>
        )}
      </div>

      {/* Actions — icon-only chấp nhận được vì là utility action universal */}
      <div className="flex shrink-0 items-center">
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground h-8 w-8"
          onClick={onEdit}
          aria-label="Sửa"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-destructive h-8 w-8"
          onClick={onDelete}
          disabled={busyDelete}
          aria-label="Xoá"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function FieldDialog({
  open,
  field,
  mode,
  onClose,
}: {
  open: boolean;
  field?: Field | null;
  mode: 'create' | 'edit';
  onClose: () => void;
}) {
  const create = useCreateField();
  const update = useUpdateField();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [maps, setMaps] = useState('');
  const [phone, setPhone] = useState('');
  const [pitchCount, setPitchCount] = useState(1);
  const [hasCamera, setHasCamera] = useState(false);
  const [notes, setNotes] = useState('');
  const [hydrated, setHydrated] = useState<string | null>(null);

  if (open && mode === 'edit' && field && hydrated !== field.id) {
    setName(field.name);
    setAddress(field.address ?? '');
    setMaps(field.google_maps_url ?? '');
    setPhone(field.contact_phone ?? '');
    setPitchCount(field.pitch_count);
    setHasCamera(field.has_camera);
    setNotes(field.notes ?? '');
    setHydrated(field.id);
  }
  if (open && mode === 'create' && hydrated !== '__new__') {
    setName('');
    setAddress('');
    setMaps('');
    setPhone('');
    setPitchCount(1);
    setHasCamera(false);
    setNotes('');
    setHydrated('__new__');
  }

  const reset = () => {
    setHydrated(null);
    onClose();
  };

  const handleSubmit = () => {
    const parsed = fieldSchema.safeParse({
      name,
      address,
      google_maps_url: maps,
      contact_phone: phone,
      pitch_count: Number(pitchCount),
      has_camera: hasCamera,
      notes,
    });

    if (!parsed.success) {
      const first = parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ';
      toast.error(first);
      return;
    }

    if (mode === 'create') {
      create.mutate(parsed.data, { onSuccess: reset });
    } else if (field) {
      update.mutate({ id: field.id, patch: parsed.data }, { onSuccess: reset });
    }
  };

  const busy = create.isPending || update.isPending;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && reset()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Thêm sân mới' : `Sửa: ${field?.name ?? ''}`}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 py-1">
          <DialogField label="Tên sân *">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Sân Cần Khê"
            />
          </DialogField>
          <DialogField label="Địa chỉ">
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Số 1, đường ABC, Quận X"
            />
          </DialogField>
          <DialogField label="Link Google Maps">
            <Input
              value={maps}
              onChange={(e) => setMaps(e.target.value)}
              placeholder="https://maps.google.com/…"
              type="url"
            />
          </DialogField>
          <DialogField label="SĐT liên hệ (gọi/Zalo)">
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0901234567"
              type="tel"
              inputMode="tel"
            />
          </DialogField>
          <div className="grid grid-cols-2 gap-3">
            <DialogField label="Số sân con">
              <Input
                type="number"
                min={1}
                max={50}
                value={pitchCount}
                onChange={(e) => setPitchCount(Number(e.target.value) || 1)}
              />
            </DialogField>
            <div className="flex items-end pb-2">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <Switch checked={hasCamera} onCheckedChange={setHasCamera} />
                Có camera
              </label>
            </div>
          </div>
          <DialogField label="Ghi chú">
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Giá, kích thước, ghi chú khác…"
            />
          </DialogField>
        </div>
        <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
          <Button variant="outline" onClick={reset} disabled={busy} className="sm:w-auto">
            Huỷ
          </Button>
          <Button onClick={handleSubmit} disabled={busy} className="sm:w-auto">
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === 'create' ? 'Thêm sân' : 'Lưu thay đổi'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DialogField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}
