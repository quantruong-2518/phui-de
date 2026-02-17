# AGENTIC CONTEXT MAP

Welcome, Agent. This project uses a **3-Layer Context Structure** to help you work efficiently and accurately.

## 🗺️ 1. Static Context (`.context/`)

**"Where am I?"** - Read these files FIRST to understand the project environment.

- `00-project-overview.md`: Project goals, tech stack overview.
- `01-tech-stack.md`: Detailed tech choices, extensive rules.
- `02-folder-structure.md`: Where things belong.
- `03-database-schema.md`: Supabase tables and relationships.
- `04-component-patterns.md`: How to write React components.
- `05-api-patterns.md`: How to write API routes.
- `06-hook-patterns.md`: How to write custom hooks.
- `07-styling-guide.md`: Tailwind & shadcn/ui rules.
- `08-common-tasks.md`: Standard procedures for common jobs.

### 📚 Detailed Specs (Modules)

- `12-user-journey.md`: User Journey Maps & Flows.
- `13-module-auth-teams.md`: Auth & Team Management (Mod 1-2).
- `14-module-players-matches.md`: Players & Matches (Mod 3-4).
- `15-module-analytics-fields.md`: Analytics & Field Booking (Mod 5-6).
- `16-module-services.md`: Food & Shop Services (Mod 7-8).
- `17-design-specs.md`: Design System & UI Patterns.

## 🛠️ 2. Functional Skills (`.ai/`)

**"How do I do X?"** - Use these skills/patterns when performing specific tasks.

- `supabase-query-builder/`: Patterns for efficient database querying.
- `form-builder/`: Patterns for React Hook Form + Zod validation.
- `error-handling/`: Standardized error handling strategies.

## 📄 3. Feature Specs (In-Place)

**"What exactly am I building?"** - The specific "brain" for each feature.

- Located at: `src/features/[name]/specs.md`
- Contains: AC, Plan, Logic, Edge Cases.
- **RULE**: Always create/update this file _before_ coding a feature.

## 🤖 4. Workflows (`.agent/`)

**" What are the steps?"** - Follow these recipes to complete complex features.

- `scaffold-feature.md`: **MASTER WORKFLOW** for building full-stack features.
- `create-api.md`: Steps to create a robust API endpoint.
- `create-components.md`: Steps to build UI components.
- `create-hook.md`: Steps to build data fetching/mutation hooks.
- `create-page.md`: Steps to build Next.js pages.

---

## 🚀 Quick Start

1. **New Feature?** Run `scaffold-feature` workflow.
2. **Fixing Bug?** Read `08-common-tasks.md` -> Check related `.ai` skill.
3. **Refactoring?** Check `01-tech-stack.md` for conventions first.
