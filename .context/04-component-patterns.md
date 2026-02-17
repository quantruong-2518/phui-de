# Component Patterns

## Template

```typescript
"use client" // Nếu cần interactivity

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Player } from '@/types'

interface PlayerCardProps {
  player: Player
  onEdit?: (id: string) => void
  className?: string
}

export function PlayerCard({ player, onEdit, className }: PlayerCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{player.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Goals: {player.goals}</p>
        {onEdit && (
          <Button onClick={() => onEdit(player.id)}>
            Edit
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
```

## Rules

1. **Props Interface**
   - Luôn define TypeScript interface
   - Tên: `[ComponentName]Props`
   - Destructure props

2. **Server vs Client**
   - Default: Server Component
   - Chỉ thêm `"use client"` khi cần:
     - useState, useEffect, event handlers
     - Browser APIs
     - Third-party libraries dùng hooks

3. **Styling**
   - Dùng Tailwind classes
   - className prop cho customization
   - Dùng `cn()` utility merge classes

4. **Loading & Error**

```typescript
   if (isLoading) return <div>Loading...</div>
   if (error) return <div>Error</div>
```

5. **Không hard-code**
   - Strings → constants file
   - Colors → Tailwind config
   - Config → lib/constants/

## Checklist tạo component

- [ ] TypeScript interface cho props
- [ ] Destructure props
- [ ] "use client" nếu cần
- [ ] Import shadcn components từ @/components/ui
- [ ] Tailwind cho styling
- [ ] className prop
- [ ] Loading/Error states
- [ ] Export named (không default)
- [ ] Add to index.ts

## File này dùng khi nào

- Tạo component mới
- Review component code
