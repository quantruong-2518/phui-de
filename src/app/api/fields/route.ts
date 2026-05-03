import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin-access';
import { fieldSchema } from '@/features/fields/validations/field-schemas';

// GET /api/fields — public list (catalog).
export async function GET(req: Request) {
  const supabase = await createClient();
  const url = new URL(req.url);
  const search = url.searchParams.get('search')?.trim();

  let query = supabase
    .from('fields')
    .select('*')
    .order('name', { ascending: true });

  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: 'Failed to fetch fields' }, { status: 500 });
  }

  return NextResponse.json({ data });
}

// POST /api/fields — admin only.
export async function POST(req: Request) {
  const ctx = await requireAdmin();
  if (ctx instanceof NextResponse) return ctx;

  const body = await req.json().catch(() => null);
  const parsed = fieldSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { data, error } = await ctx.supabase
    .from('fields')
    .insert({ ...parsed.data, created_by: ctx.userId })
    .select('*')
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message || 'Insert failed' },
      { status: 500 },
    );
  }

  return NextResponse.json({ data }, { status: 201 });
}
