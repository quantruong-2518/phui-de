'use client';

import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function AdminLogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const handleLogout = async () => {
    setBusy(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      disabled={busy}
      className="text-muted-foreground hover:text-foreground gap-1.5"
    >
      <LogOut className="h-4 w-4" />
      Đăng xuất
    </Button>
  );
}
