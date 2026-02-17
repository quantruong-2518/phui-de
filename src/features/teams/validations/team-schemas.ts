import { z } from 'zod';

export const createTeamSchema = z.object({
  name: z
    .string()
    .min(3, 'Tên đội phải có ít nhất 3 ký tự')
    .max(50, 'Tên đội quá dài'),
  primary_color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Mã màu không hợp lệ')
    .optional(),
  secondary_color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Mã màu không hợp lệ')
    .optional(),
});

export type CreateTeamSchema = z.infer<typeof createTeamSchema>;
