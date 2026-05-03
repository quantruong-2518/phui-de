import { Camera, MapPinned, Phone } from 'lucide-react';
import type { Field } from '../types/field.types';

export function FieldRow({
  field,
  actions,
}: {
  field: Field;
  /** Render slot bên phải tên (sau icon Bản đồ). Vd: nút Sửa/Xoá hoặc Đặt sân. */
  actions?: React.ReactNode;
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
          {actions}
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
