import { z } from 'zod';

export const createPlayerSchema = z.object({
  name: z
    .string()
    .min(2, 'Tên cầu thủ phải có ít nhất 2 ký tự')
    .max(50, 'Tên quá dài'),
  code: z.string().min(1, 'Số áo/Mã không được để trống').max(10, 'Mã quá dài'),
  position: z.enum(['GK', 'DEF', 'MID', 'FWD'], {
    message: 'Vui lòng chọn vị trí',
  }),
});

export type CreatePlayerSchema = z.infer<typeof createPlayerSchema>;
