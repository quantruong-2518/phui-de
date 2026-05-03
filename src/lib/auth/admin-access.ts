import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type SupabaseServer = Awaited<ReturnType<typeof createClient>>;

interface AdminContext {
  userId: string;
  supabase: SupabaseServer;
}

/**
 * Boundary helper cho /api/* endpoints chỉ-admin. Trả NextResponse error nếu
 * không pass. Pattern dùng giống `requireTeamAccess`.
 *
 * ```ts
 * const ctx = await requireAdmin();
 * if (ctx instanceof NextResponse) return ctx;
 * // ctx.userId, ctx.supabase
 * ```
 */
export async function requireAdmin(): Promise<AdminContext | NextResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Không có quyền' }, { status: 403 });
  }

  return { userId: user.id, supabase };
}
