'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  useCreateField,
  useDeleteField,
  useFields,
  useUpdateField,
} from '@/features/fields/hooks/use-fields';
import { fieldSchema } from '@/features/fields/validations/field-schemas';
import type { Field } from '@/features/fields/types/field.types';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Camera,
  Loader2,
  MapPinned,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';

type FieldFormInput = z.input<typeof fieldSchema>;
type FieldFormOutput = z.output<typeof fieldSchema>;

const EMPTY_DEFAULTS: FieldFormInput = {
  name: '',
  address: '',
  google_maps_url: '',
  contact_name: '',
  contact_phone: '',
  contact_name_2: '',
  contact_phone_2: '',
  pitch_count: 1,
  has_camera: false,
  notes: '',
};

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
        <Button
          onClick={() => setCreating(true)}
          className="w-full gap-1.5 sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Thêm sân
        </Button>
      </div>

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

function ContactChip({
  name,
  phone,
}: {
  name: string | null;
  phone: string;
}) {
  return (
    <a
      href={`tel:${phone}`}
      className="bg-muted/50 hover:bg-muted/80 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs transition-colors"
    >
      <Phone className="h-3 w-3" />
      <span className="font-mono font-semibold">{phone}</span>
      {name && (
        <span className="text-muted-foreground border-border border-l pl-1.5">
          {name}
        </span>
      )}
    </a>
  );
}

function AmenityIcon({
  icon,
  title,
  tone = 'amber',
}: {
  icon: React.ReactNode;
  title: string;
  tone?: 'amber' | 'sky';
}) {
  const toneClass = {
    amber: 'bg-amber-500/15 text-amber-600',
    sky: 'bg-sky-500/15 text-sky-600',
  }[tone];
  return (
    <span
      className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${toneClass}`}
      title={title}
      aria-label={title}
    >
      {icon}
    </span>
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
  const hasContact = field.contact_phone || field.contact_phone_2;
  const hasAmenity = field.has_camera;

  return (
    <article className="bg-card rounded-2xl p-3 shadow-sm transition-shadow hover:shadow-md sm:p-4">
      {/* Row 1: tên + (n sân) — actions phải */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="min-w-0 flex-1 truncate text-base font-bold sm:text-lg">
          {field.name}
          <span className="text-muted-foreground ml-1.5 text-sm font-medium">
            ({field.pitch_count} sân)
          </span>
        </h3>
        <div className="-mr-1.5 -mt-1 flex shrink-0 items-center">
          {field.google_maps_url && (
            <a
              href={field.google_maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors"
              aria-label="Mở Google Maps"
              title="Bản đồ"
            >
              <MapPinned className="h-4 w-4" />
            </a>
          )}
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

      {/* Row 2: địa chỉ */}
      {field.address && (
        <p className="text-muted-foreground mt-0.5 truncate text-xs sm:text-sm">
          {field.address}
        </p>
      )}

      {/* Row 3: contacts trái — amenities phải */}
      {(hasContact || hasAmenity) && (
        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-wrap gap-1.5">
            {field.contact_phone && (
              <ContactChip
                name={field.contact_name}
                phone={field.contact_phone}
              />
            )}
            {field.contact_phone_2 && (
              <ContactChip
                name={field.contact_name_2}
                phone={field.contact_phone_2}
              />
            )}
          </div>
          {hasAmenity && (
            <div className="flex shrink-0 items-center gap-1">
              {field.has_camera && (
                <AmenityIcon
                  icon={<Camera className="h-3.5 w-3.5" />}
                  title="Có camera"
                />
              )}
              {/* Tương lai: icon WC, parking, … */}
            </div>
          )}
        </div>
      )}

      {/* Ghi chú phụ — ẩn mobile */}
      {field.notes && (
        <p className="text-muted-foreground/80 mt-2 hidden text-xs italic sm:block">
          {field.notes}
        </p>
      )}
    </article>
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

  const form = useForm<FieldFormInput>({
    resolver: zodResolver(fieldSchema),
    defaultValues: EMPTY_DEFAULTS,
    mode: 'onSubmit',
  });

  // Hydrate khi mở dialog
  useEffect(() => {
    if (!open) return;
    if (mode === 'edit' && field) {
      form.reset({
        name: field.name,
        address: field.address ?? '',
        google_maps_url: field.google_maps_url ?? '',
        contact_phone: field.contact_phone ?? '',
        pitch_count: field.pitch_count,
        has_camera: field.has_camera,
        notes: field.notes ?? '',
      });
    } else if (mode === 'create') {
      form.reset(EMPTY_DEFAULTS);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode, field?.id]);

  const handleClose = () => {
    form.reset(EMPTY_DEFAULTS);
    onClose();
  };

  const onValid = (values: FieldFormInput) => {
    // values đã pass schema (post-transform): empty strings → null,
    // pitch_count đã là số nguyên hợp lệ.
    const out = values as unknown as FieldFormOutput;
    if (mode === 'create') {
      create.mutate(out, { onSuccess: handleClose });
    } else if (field) {
      update.mutate({ id: field.id, patch: out }, { onSuccess: handleClose });
    }
  };

  const busy = create.isPending || update.isPending;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Thêm sân mới' : `Sửa: ${field?.name ?? ''}`}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onValid)}
            className="grid gap-3 py-1"
            noValidate
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Tên sân *</FormLabel>
                  <FormControl>
                    <Input placeholder="Sân Cần Khê" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Địa chỉ</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Số 1, đường ABC, Quận X"
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="google_maps_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Link Google Maps</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://maps.google.com/…"
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <ContactRow
              form={form}
              index={1}
              nameField="contact_name"
              phoneField="contact_phone"
              required
            />
            <ContactRow
              form={form}
              index={2}
              nameField="contact_name_2"
              phoneField="contact_phone_2"
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="pitch_count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Số sân con</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={50}
                        step={1}
                        value={
                          Number.isFinite(field.value as number)
                            ? (field.value as number)
                            : ''
                        }
                        onChange={(e) => {
                          const v = e.target.value;
                          field.onChange(v === '' ? Number.NaN : Number(v));
                        }}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="has_camera"
                render={({ field }) => (
                  <FormItem className="flex items-end pb-2">
                    <label className="flex cursor-pointer items-center gap-2 text-sm">
                      <FormControl>
                        <Switch
                          checked={field.value as boolean}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      Có camera
                    </label>
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Ghi chú</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Giá, kích thước, ghi chú khác…"
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={busy}
                className="sm:w-auto"
              >
                Huỷ
              </Button>
              <Button type="submit" disabled={busy} className="sm:w-auto">
                {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === 'create' ? 'Thêm sân' : 'Lưu thay đổi'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function ContactRow({
  form,
  index,
  nameField,
  phoneField,
  required,
}: {
  form: ReturnType<typeof useForm<FieldFormInput>>;
  index: number;
  nameField: 'contact_name' | 'contact_name_2';
  phoneField: 'contact_phone' | 'contact_phone_2';
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <FormLabel className="text-xs">
        Liên hệ {index}
        {required ? '' : ' (tuỳ chọn)'}
      </FormLabel>
      <div className="grid grid-cols-2 gap-2">
        <FormField
          control={form.control}
          name={nameField}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  placeholder="Tên người liên hệ"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={phoneField}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  type="tel"
                  inputMode="tel"
                  placeholder="0901234567"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
