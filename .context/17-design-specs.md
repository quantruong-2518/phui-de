# Design System & UI/UX Specs

## 🎨 Color Palette

### Primary (Football Green)

- `50`: `#f0fdf4`
- `500`: `#22c55e` (Base)
- `600`: `#16a34a` (Hover)
- `700`: `#15803d` (Active)

### Result Colors

- **Win**: `#22c55e` (Green)
- **Loss**: `#ef4444` (Red)
- **Draw**: `#eab308` (Yellow)

## 🔠 Typography

- **Heading**: `font-bold text-2xl md:text-3xl`
- **Subheading**: `font-semibold text-xl`
- **Body**: `text-base`
- **Small**: `text-sm text-muted-foreground`

## 📏 Spacing

- **Page Container**: `container mx-auto px-4 py-8`
- **Section**: `mb-8`
- **Card Padding**: `p-6`

## 🧩 Component Patterns

### Stats Card

```tsx
<Card>
  <CardHeader>
    <CardTitle className="text-muted-foreground text-sm">Label</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="text-3xl font-bold">{value}</div>
    <p className="text-xs text-green-600">+10% ↑</p>
  </CardContent>
</Card>
```

### Match Card

```tsx
<Card>
  <CardContent className="p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-muted-foreground text-sm">{date}</p>
        <p className="font-semibold">{opponent}</p>
      </div>
      <div className="text-2xl font-bold">
        {goalsScored} - {goalsConceded}
      </div>
      <Badge variant={result === 'W' ? 'success' : 'destructive'}>
        {result}
      </Badge>
    </div>
  </CardContent>
</Card>
```

### Player Card

```tsx
<Card>
  <CardContent className="p-4">
    <div className="flex items-center gap-4">
      <Avatar>
        <AvatarImage src={avatar} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div>
        <p className="font-semibold">{name}</p>
        <p className="text-muted-foreground text-sm">#{code}</p>
      </div>
      <div className="ml-auto text-right">
        <p className="font-bold">{goals} goals</p>
        <p className="text-sm">{assists} assists</p>
      </div>
    </div>
  </CardContent>
</Card>
```
