---
description: Creates a new React component following project patterns
---

Steps:

1. Read context files:
   - .context/04-component-patterns.md
   - .context/07-styling-guide.md
   - .context/02-folder-structure.md

2. Determine component location:
   - Feature-specific: components/[feature]/ComponentName.tsx
   - Shared: components/shared/ComponentName.tsx
   - Layout: components/layout/ComponentName.tsx

3. Create component file with:
   - "use client" directive (only if needed)
   - TypeScript Props interface
   - Named export
   - shadcn/ui components
   - Tailwind CSS styling

4. Update barrel export:
   - Add to components/[feature]/index.ts

5. Verify:
   - TypeScript types ✓
   - Mobile responsive ✓
   - Dark mode compatible ✓
   - No hard-coded values ✓

Example prompt: "Create a PlayerCard component with avatar, name, goals, assists"
