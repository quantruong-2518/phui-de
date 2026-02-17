# Design System Prompt

**Source**: User Request
**Status**: ACTIVE (Strict Adherence Required)

## CORE STACK

- Tailwind CSS v3+ (utility-first, no custom CSS unless absolutely necessary)
- Font: Inter (primary), JetBrains Mono (code). Load via Google Fonts or @fontsource.
- Icons: Lucide React (preferred) or Heroicons. Never mix icon libraries in one project.
- Motion: Framer Motion for animations. Prefer subtle, purposeful transitions (150-300ms).

## COLOR SYSTEM (CSS Variables + Tailwind)

Use semantic color tokens mapped to CSS variables for easy dark/light theming:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --card: 0 0% 100%;
  --card-foreground: 240 10% 3.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 240 10% 3.9%;
  --primary: 240 5.9% 10%;
  --primary-foreground: 0 0% 98%;
  --secondary: 240 4.8% 95.9%;
  --secondary-foreground: 240 5.9% 10%;
  --muted: 240 4.8% 95.9%;
  --muted-foreground: 240 3.8% 46.1%;
  --accent: 240 4.8% 95.9%;
  --accent-foreground: 240 5.9% 10%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 98%;
  --border: 240 5.9% 90%;
  --input: 240 5.9% 90%;
  --ring: 240 5.9% 10%;
  --radius: 0.625rem;
}

.dark {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  --card: 240 10% 3.9%;
  --card-foreground: 0 0% 98%;
  --popover: 240 10% 3.9%;
  --popover-foreground: 0 0% 98%;
  --primary: 0 0% 98%;
  --primary-foreground: 240 5.9% 10%;
  --secondary: 240 3.7% 15.9%;
  --secondary-foreground: 0 0% 98%;
  --muted: 240 3.7% 15.9%;
  --muted-foreground: 240 5% 64.9%;
  --accent: 240 3.7% 15.9%;
  --accent-foreground: 0 0% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 0 0% 98%;
  --border: 240 3.7% 15.9%;
  --input: 240 3.7% 15.9%;
  --ring: 240 4.9% 83.9%;
}
```

## TYPOGRAPHY SCALE (strict)

| Role       | Class                                                                   | Use for                  |
| ---------- | ----------------------------------------------------------------------- | ------------------------ |
| Display    | `text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight`             | Hero headlines           |
| H1         | `text-3xl sm:text-4xl font-bold tracking-tight`                         | Page titles              |
| H2         | `text-2xl sm:text-3xl font-semibold tracking-tight`                     | Section titles           |
| H3         | `text-xl sm:text-2xl font-semibold`                                     | Card titles, subsections |
| H4         | `text-lg font-semibold`                                                 | Sub-headings             |
| Body Large | `text-base sm:text-lg text-muted-foreground`                            | Lead paragraphs          |
| Body       | `text-sm sm:text-base text-foreground`                                  | Default text             |
| Body Small | `text-xs sm:text-sm text-muted-foreground`                              | Captions, metadata       |
| Code       | `font-mono text-sm`                                                     | Inline code, terminals   |
| Label      | `text-sm font-medium`                                                   | Form labels, nav items   |
| Overline   | `text-xs font-semibold uppercase tracking-widest text-muted-foreground` | Category tags            |

## SPACING SYSTEM (8px grid)

- **Micro spacing**: `gap-1` (4px), `gap-2` (8px), `gap-3` (12px)
- **Component internal padding**: `p-3` to `p-6` (12–24px)
- **Between components**: `gap-4` (16px), `gap-6` (24px), `gap-8` (32px)
- **Between sections**: `py-12` (48px), `py-16` (64px), `py-20` (80px), `py-24` (96px)
- **Page padding**: `px-4 sm:px-6 lg:px-8`

## LAYOUT PATTERNS

- Page shell: `min-h-screen bg-background text-foreground antialiased`
- Content container: `mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8`

## COMPONENT PATTERNS

- **Buttons**: `h-10 px-4 rounded-md text-sm font-medium`
- **Cards**: `rounded-xl border bg-card text-card-foreground shadow-sm`
- **Inputs**: `h-10 rounded-md border border-input`

## ACCESSIBILITY

- Touch targets minimum 44x44px on mobile
- `focus-visible:ring-2`
