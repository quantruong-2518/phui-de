# Styling Guide

## Tailwind Classes

### Layout

```typescript
// Container
className = 'container mx-auto px-4';

// Grid
className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';

// Flex
className = 'flex items-center justify-between';
```

### Spacing

```typescript
// Padding
(p - 4, px - 6, py - 8);

// Margin
(m - 4, mx - auto, mt - 8);

// Gap
(gap - 4, gap - x - 6, gap - y - 8);
```

### Typography

```typescript
// Text size
text-sm, text-base, text-lg, text-xl, text-2xl

// Font weight
font-normal, font-medium, font-semibold, font-bold

// Color
text-foreground, text-muted-foreground, text-destructive
```

### Colors (dùng CSS variables)

```typescript
// Background
(bg - background, bg - card, bg - primary, bg - secondary);

// Text
(text - foreground, text - primary, text - muted - foreground);

// Border
(border - border, border - input);
```

### Responsive

```typescript
// Mobile first
className = 'text-sm md:text-base lg:text-lg';
className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
```

## shadcn Components

### Luôn dùng shadcn trước

```typescript
// ✅ ĐÚNG
import { Button } from '@/components/ui/button'
<Button>Click me</Button>

// ❌ SAI - Tự tạo button
<button className="...">Click me</button>
```

### Variants

```typescript
<Button variant="default">Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Cancel</Button>
<Button variant="ghost">Ghost</Button>

<Button size="default">Default</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
```

## cn() Utility

```typescript
import { cn } from '@/lib/utils'

<Card className={cn(
  "p-4",                    // Base classes
  isActive && "ring-2",     // Conditional
  className                 // Props override
)} />
```

## Dark Mode

Tất cả components phải support dark mode:

```typescript
// ✅ ĐÚNG - Dùng semantic colors
className = 'bg-background text-foreground';

// ❌ SAI - Hard-code colors
className = 'bg-white text-black';
```

## Mobile-First

```typescript
// ✅ ĐÚNG
className = 'flex flex-col md:flex-row';

// ❌ SAI
className = 'flex flex-row md:flex-col';
```

## File này dùng khi nào

- Styling components
- Không chắc class nào dùng
- Review styling code
