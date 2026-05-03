import { Shield } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { TeamNav } from './team-nav';

export default async function TeamLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id: slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: team } = await supabase
    .from('teams')
    .select('id, name, slug, code, primary_color, owner_id')
    .eq('slug', slug)
    .maybeSingle();

  if (!team) notFound();

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-4 pb-28 sm:p-6 sm:pb-6 lg:p-8 lg:pb-8">
      {/* ===== Team Header ===== */}
      <div className="card-featured relative overflow-hidden rounded-[20px] p-5 md:p-6">
        <div className="absolute top-0 right-0 h-32 w-32 translate-x-1/3 -translate-y-1/3 rotate-45 transform bg-white/5 blur-3xl" />
        <div className="bg-primary/20 absolute bottom-0 left-0 h-40 w-40 -translate-x-1/3 translate-y-1/3 rotate-12 transform blur-3xl" />

        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg"
              style={{
                backgroundImage: `linear-gradient(135deg, ${team.primary_color || '#22c55e'}, ${team.primary_color || '#22c55e'}cc)`,
              }}
            >
              <Shield className="h-8 w-8 text-white" />
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                {team.name}
              </h1>
              <p className="text-muted-foreground font-mono text-xs">
                {team.code}
              </p>
            </div>
          </div>
        </div>
      </div>

      <TeamNav slug={slug} />

      <div className="animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
        {children}
      </div>
    </div>
  );
}
