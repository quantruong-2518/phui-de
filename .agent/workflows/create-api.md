---
description: Creates a new API endpoint with proper error handling and query building
---

Steps:

1. Read context and skills:
   - .context/05-api-patterns.md
   - .context/03-database-schema.md
   - .ai/supabase-query-builder/SKILL.md
   - .ai/error-handling/SKILL.md

2. Create route file:
   - Location: app/api/[endpoint]/route.ts
   - For dynamic routes: app/api/[endpoint]/[id]/route.ts

3. Implement with patterns:
   - Use `Supabase Query Builder` skill for database logic
   - Use `Error Handling` skill for try-catch blocks

```typescript
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    // Implement query using .ai/supabase-query-builder/SKILL.md patterns
    const { data, error } = await supabase.from('table').select('*');

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    // Implement error response using .ai/error-handling/SKILL.md patterns
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 },
    );
  }
}
```

4. Verify:
   - try-catch error handling ✓
   - Proper HTTP status codes ✓
   - TypeScript types ✓
   - Supabase from @/lib/supabase/server ✓

Example prompt: "Create API GET /api/players/leaderboard to get top 10 players"
