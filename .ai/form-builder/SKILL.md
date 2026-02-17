---
name: Form with React Hook Form + Zod
description: Guide for creating forms using React Hook Form and Zod validation.
---

# Form Patterns (React Hook Form + Zod)

## 1. Define Zod Schema

Location: `features/[feature]/validations/[entity]-schema.ts`

```typescript
import { z } from 'zod';

export const playerSchema = z.object({
  name: z.string().min(1, 'Name required'),
  code: z.number().int().positive(),
  position: z.string().optional(),
});

export type PlayerFormData = z.infer<typeof playerSchema>;
```

## 2. Create Form Component

Location: `components/[feature]/[Entity]Form.tsx`

```typescript
"use client"

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { playerSchema, type PlayerFormData } from '@/features/players/validations/player-schema'

interface PlayerFormProps {
  onSubmit: (data: PlayerFormData) => Promise<void>
  defaultValues?: Partial<PlayerFormData>
  isLoading?: boolean
}

export function PlayerForm({ onSubmit, defaultValues, isLoading }: PlayerFormProps) {
  const form = useForm<PlayerFormData>({
    resolver: zodResolver(playerSchema),
    defaultValues: {
      name: '',
      code: 0,
      ...defaultValues
    }
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Other fields */}

        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Submit'}
        </Button>
      </form>
    </Form>
  )
}
```

## 3. Usage with Mutation Hook

Location: `app/(dashboard)/[feature]/new/page.tsx` or similar

```typescript
const { createPlayer, isLoading } = useCreatePlayer()

const handleSubmit = async (data: PlayerFormData) => {
  try {
    await createPlayer(data)
    // Redirect or toast handled in hook or here
  } catch (error) {
    // Error handled in hook or here
  }
}

return <PlayerForm onSubmit={handleSubmit} isLoading={isLoading} />
```

## Checklist

- [ ] Zod schema with messages
- [ ] Type inference (z.infer)
- [ ] Form component with types
- [ ] Loading state handling
- [ ] Integration with mutation hook

## When to use

- Create new form
- Validate data
