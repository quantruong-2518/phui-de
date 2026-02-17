---
description: Scaffolds a complete feature (API -> Hook -> Component -> Page)
---

Steps:

1. Analyze Requirements:
   - Identify entity name (e.g., Player)
   - **Step 1.1**: Create `features/[entity]/specs.md` using `.agent/templates/feature-spec.md`.
   - **Step 1.2**: Fill out AC, Data Flow, and Implementation Plan in `specs.md`.
   - **Step 1.3**: Request User Review of `specs.md`.

2. Create API Endpoints (Workflow: create-api):
   - GET /api/[entity]
   - POST /api/[entity]
   - GET /api/[entity]/[id]

3. Create Hooks (Workflow: create-hook):
   - use[Entity]s (Fetch list)
   - use[Entity] (Fetch single)
   - useCreate[Entity] (Mutation)

4. Create Types & Zod Schema:
   - features/[entity]/types/[entity].types.ts
   - features/[entity]/validations/[entity]-schema.ts

5. Create UI Components (Workflow: create-components):
   - [Entity]Table (List view)
   - [Entity]Form (Create/Edit view)
   - [Entity]Card (Detail view)

6. Create Pages (Workflow: create-page):
   - / [entity] (List page)
   - / [entity] / new (Create page)
   - / [entity] / [id] (Detail page)

7. Verify Integration:
   - Pagination works?
   - Form validation works?
   - Error handling works?

Example prompt: "Scaffold a 'Matches' feature with CRUD, list view, and detail view."
