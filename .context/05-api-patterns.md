# API Route Patterns

## Template

```typescript
// app/api/players/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';
import type { Player } from '@/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const { data, error } = await supabase
      .from('players')
      .select('*')
      .order('total_points', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;

    return NextResponse.json({ data, page, limit });
  } catch (error) {
    console.error('GET /api/players error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch players' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate với Zod (nếu cần)
    // const validated = playerSchema.parse(body)

    const { data, error } = await supabase
      .from('players')
      .insert(body)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('POST /api/players error:', error);
    return NextResponse.json(
      { error: 'Failed to create player' },
      { status: 500 },
    );
  }
}
```

## Dynamic Routes

```typescript
// app/api/players/[id]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json({ data });
}
```

## Rules

1. **Error Handling**
   - Luôn try-catch
   - Log errors với console.error
   - Return proper HTTP status codes
   - Consistent error format: `{ error: string }`

2. **Response Format**

```typescript
   // Success
   { data: T }

   // Success with meta
   { data: T[], total: number, page: number }

   // Error
   { error: string }
```

3. **Supabase Client**
   - Import từ `@/lib/supabase/server` cho API routes
   - Import từ `@/lib/supabase/client` cho client components

4. **Validation**
   - Query params → validate type (parseInt, etc)
   - Body → validate với Zod schema

## Checklist tạo API route

- [ ] try-catch error handling
- [ ] Validate inputs
- [ ] Proper HTTP status codes
- [ ] Consistent response format
- [ ] console.error for logging
- [ ] TypeScript types
- [ ] Supabase client từ server

## File này dùng khi nào

- Tạo API route mới
- Debug API issues
