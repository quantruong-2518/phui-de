const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

async function seedTopTeams() {
  console.log('Seeding top 5 teams...');

  const { data: activeSeason, error: sErr } = await supabase
    .from('seasons')
    .select('id')
    .eq('is_active', true)
    .single();

  if (sErr || !activeSeason) {
    console.error('Không tìm thấy Active Season:', sErr);
    return;
  }

  const { data: users } = await supabase.from('users').select('id').limit(1);
  const userId = users && users.length > 0 ? users[0].id : null;

  // Xoá các data cũ để màn hình đẹp theo đúng list
  await supabase
    .from('teams')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  const nowMs = Date.now();

  const rawTeams = [
    {
      name: 'Trẻ NK',
      slug: 'tre-nk',
      code: 'TRENK',
      primary_color: '#1A1A1A',
      owner_id: userId,
      created_at: new Date(nowMs - 5 * 60000).toISOString(),
    },
    {
      name: 'Love',
      slug: 'love',
      code: 'LOVE',
      primary_color: '#FF69B4',
      owner_id: userId,
      created_at: new Date(nowMs - 4 * 60000).toISOString(),
    },
    {
      name: 'Lego',
      slug: 'lego',
      code: 'LEGO',
      primary_color: '#FFFF00',
      owner_id: userId,
      created_at: new Date(nowMs - 3 * 60000).toISOString(),
    },
    {
      name: '3233',
      slug: '3233',
      code: 'T3233',
      primary_color: '#0000FF',
      owner_id: userId,
      created_at: new Date(nowMs - 2 * 60000).toISOString(),
    },
    {
      name: 'Passion FC',
      slug: 'passion-fc',
      code: 'PAS01',
      primary_color: '#BFFF00',
      owner_id: userId,
      created_at: new Date(nowMs - 1 * 60000).toISOString(),
    },
  ];

  for (const t of rawTeams) {
    const { data: existing } = await supabase
      .from('teams')
      .select('id')
      .eq('slug', t.slug)
      .single();
    if (existing) {
      console.log(`Team ${t.name} đã tồn tại, update created_at lên top!`);
      await supabase
        .from('teams')
        .update({ created_at: t.created_at })
        .eq('id', existing.id);
      continue;
    }

    const { data: newTeam, error: tErr } = await supabase
      .from('teams')
      .insert(t)
      .select('id')
      .single();

    if (tErr) {
      console.error('Lỗi tạo đội:', tErr);
      continue;
    }

    await supabase.from('team_seasons').insert({
      team_id: newTeam.id,
      season_id: activeSeason.id,
      matches_played: Math.floor(Math.random() * 10),
      wins: Math.floor(Math.random() * 5),
    });

    console.log(`Tạo thành công đội top: ${t.name}`);
  }

  console.log('Xong top 5 teams!');
}

seedTopTeams();
