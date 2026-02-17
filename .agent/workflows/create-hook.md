---
description: Creates a data fetching or mutation hook
---

Steps:

1. Read context files:
   - .context/06-hook-patterns.md
   - .context/02-folder-structure.md

2. Determine hook type:
   - Fetch list: use[Entity]s (usePlayers)
   - Fetch single: use[Entity] (usePlayer)
   - Mutation: use[Action][Entity] (useCreatePlayer)

3. Create hook file:
   - Location: features/[feature]/hooks/use-[name].ts

4. Implement pattern:
   - For fetch: Use SWR or TanStack Query
   - Return object with { data, isLoading, isError }
   - Include TypeScript types

5. Export from barrel:
   - Add to features/[feature]/index.ts

6. Verify:
   - Returns object (not array) ✓
   - Loading/error states ✓
   - TypeScript types ✓

Example prompt: "Create usePlayers hook to fetch all players with pagination"
