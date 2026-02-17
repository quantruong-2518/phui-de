# Team Management Module Specifications

**Status**: Planning
**Owner**: Antigravity Agent

## 1. Overview

**Goal**: Allow users to create and manage football teams.
**User Story**: As a team manager, I want to create a team profile and manage members so that I can organize matches and track stats.

## 2. Acceptance Criteria (AC)

- [ ] **Team List**: View all teams user belongs to. Grid view.
- [ ] **Create Team**: Form with Name, Logo, Colors. Auto-slug generation.
- [ ] **Team Dashboard**: Overview stats (Players, Matches, Win Rate).
- [ ] **Navigation**: Sidebar/Tabs for team features.
- [ ] **Loading States**: Skeletons while fetching data.

## 3. Data Flow & Logic

- **Database**:
  - `teams` table (name, slug, logo, colors, owner_id).
  - `team_members` table (user_id, team_id, role).
- **API**:
  - `GET /api/teams`: List user's teams.
  - `POST /api/teams`: Create new team.
  - `GET /api/teams/[slug]/dashboard`: Dashboard stats.
- **UI**:
  - `/teams`: List page.
  - `/teams/new`: Create page.
  - `/teams/[slug]/dashboard`: Dashboard page.

## 4. Implementation Plan

- [ ] **Setup**:
  - [ ] `features/teams/types/team.types.ts`.
  - [ ] `features/teams/validations/team-schemas.ts`.
- [ ] **API Layer**:
  - [ ] `app/api/teams/route.ts` (GET, POST).
  - [ ] `app/api/teams/[slug]/dashboard/route.ts` (GET).
- [ ] **Hooks**:
  - [ ] `features/teams/hooks/use-teams.ts`.
  - [ ] `features/teams/hooks/use-create-team.ts`.
  - [ ] `features/teams/hooks/use-team-dashboard.ts`.
- [ ] **Components**:
  - [ ] `TeamCard.tsx`.
  - [ ] `CreateTeamForm.tsx`.
  - [ ] `TeamLayout.tsx` (Sidebar navigation).
  - [ ] `DashboardStats.tsx`.
- [ ] **Pages**:
  - [ ] `app/(protected)/teams/page.tsx`.
  - [ ] `app/(protected)/teams/new/page.tsx`.
  - [ ] `app/(protected)/teams/[slug]/dashboard/page.tsx`.

## 5. Edge Cases & Error Handling

- [ ] **Empty State**: Show "Create your first team" if no teams found.
- [ ] **Slug Conflict**: Handle duplicate team names (append random suffix?).
- [ ] **Permission**: Only owner/admin can update team settings.

## 6. Context Updates Checklist

- [ ] `.context/13-module-auth-teams.md` updated if API changes.
