import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const PAGE_SIZE = 5;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const supabase = await createClient();

    let countQuery = supabase
      .from('teams')
      .select('id', { count: 'exact', head: true });

    let dataQuery = supabase
      .from('teams')
      .select(`
        id,
        name,
        code,
        logo_url,
        owner:users!teams_owner_id_fkey(name)
      `)
      .order('created_at', { ascending: false })
      .range(from, to);

    // Apply search filter if provided
    if (q && q.length >= 2) {
      const filter = `name.ilike.%${q}%,code.ilike.%${q}%`;
      countQuery = countQuery.or(filter);
      dataQuery = dataQuery.or(filter);
    }

    const [{ count }, { data: teams, error }] = await Promise.all([
      countQuery,
      dataQuery,
    ]);

    if (error) throw error;

    const formattedTeams = teams?.map((t: any) => ({
      id: t.id,
      name: t.name,
      code: t.code,
      logo_url: t.logo_url,
      owner_name: t.owner?.name || 'Đang cập nhật',
    })) || [];

    const totalPages = Math.ceil((count || 0) / PAGE_SIZE);

    return NextResponse.json({
      data: formattedTeams,
      pagination: {
        page,
        pageSize: PAGE_SIZE,
        total: count || 0,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error: any) {
    console.error('Search Teams Error:', error);
    return NextResponse.json({ error: 'Failed to search teams' }, { status: 500 });
  }
}
