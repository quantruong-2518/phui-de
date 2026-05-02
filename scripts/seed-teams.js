const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Dùng Service Role Key để bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function seedTeams() {
  console.log('Seeding initial teams...');

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

  const rawTeams = [
    {
      name: 'Toji United',
      slug: 'toji-united',
      code: 'TOU001',
      primary_color: '#3b82f6',
      owner_id: userId,
    },
    {
      name: 'FC Phủi Trẻ Hà Nội',
      slug: 'fc-phui-tre-hn',
      code: 'FCPHN9',
      primary_color: '#ef4444',
      owner_id: userId,
    }
  ];

  for (const t of rawTeams) {
    const { data: existing } = await supabase.from('teams').select('id').eq('slug', t.slug).single();
    if (existing) {
       console.log(`Team ${t.name} đã tồn tại, bỏ qua.`);
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

    console.log(`Tạo thành công đội: ${t.name}`);
  }

  console.log('Xong!');
}

seedTeams();
