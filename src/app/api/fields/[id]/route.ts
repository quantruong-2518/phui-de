import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin-access';
import { fieldSchema } from '@/features/fields/validations/field-schemas';

type Params = { params: Promise<{ id: string }> };

// PATCH /api/fields/[id] — admin only.
export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params;
  const ctx = await requireAdmin();
  if (ctx instanceof NextResponse) return ctx;

  const body = await req.json().catch(() => null);
  const parsed = fieldSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { data, error } = await ctx.supabase
    .from('fields')
    .update(parsed.data)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message || 'Update failed' },
      { status: 500 },
    );
  }
  if (!data) {
    return NextResponse.json({ error: 'Sân không tồn tại' }, { status: 404 });
  }

  return NextResponse.json({ data });
}

// DELETE /api/fields/[id] — admin only.
export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  const ctx = await requireAdmin();
  if (ctx instanceof NextResponse) return ctx;

  const { error } = await ctx.supabase.from('fields').delete().eq('id', id);
  if (error) {
    return NextResponse.json(
      { error: error.message || 'Delete failed' },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
