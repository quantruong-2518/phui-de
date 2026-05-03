import { z } from 'zod';

const phoneRegex = /^(\+?84|0)\d{9,10}$/;

const optionalString = z
  .string()
  .trim()
  .max(500, 'Quá dài')
  .optional()
  .nullable()
  .transform((v) => (v && v.length > 0 ? v : null));

export const fieldSchema = z.object({
  name: z.string().trim().min(2, 'Tên sân tối thiểu 2 ký tự').max(120),
  address: optionalString,
  google_maps_url: z
    .string()
    .trim()
    .max(2000)
    .url('Link Google Maps không hợp lệ')
    .optional()
    .nullable()
    .or(z.literal(''))
    .transform((v) => (v && v.length > 0 ? v : null)),
  contact_phone: z
    .string()
    .trim()
    .max(20)
    .regex(phoneRegex, 'Số điện thoại không hợp lệ')
    .optional()
    .nullable()
    .or(z.literal(''))
    .transform((v) => (v && v.length > 0 ? v : null)),
  pitch_count: z
    .number()
    .int('Phải là số nguyên')
    .min(1, 'Tối thiểu 1')
    .max(50, 'Tối đa 50'),
  has_camera: z.boolean(),
  notes: optionalString,
});

export type FieldSchema = z.infer<typeof fieldSchema>;
