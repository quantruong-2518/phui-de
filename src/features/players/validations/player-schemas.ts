import { z } from 'zod';

export const playerPositionSchema = z.enum(['GK', 'DF', 'MF', 'FW']);

export const createPlayerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Tên cầu thủ phải có ít nhất 2 ký tự')
    .max(80, 'Tên quá dài'),
  code: z
    .string()
    .trim()
    .max(10, 'Mã quá dài')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  position: playerPositionSchema.optional(),
});

export type CreatePlayerSchema = z.infer<typeof createPlayerSchema>;
