# Player Management Module Specifications

**Status**: Planning
**Owner**: Antigravity Agent

## 1. Overview

**Goal**: Manage team roster and player statistics.
**User Story**: As a team manager, I want to add/edit players and view their performance stats so that I can manage my squad effectively.

## 2. Acceptance Criteria (AC)

- [ ] **Player List**: Table view (Avatar, Name, #, Position, Goals, Assists). Search & Filter.
- [ ] **Add Player**: Form with Name*, Code*, Position (GK/DEF/MID/FWD). unique code check.
- [ ] **Player Detail**: Stats overview (Goals, Assists, Matches). Performance chart.
- [ ] **Validation**: Name required, Code unique per team.

## 3. Data Flow & Logic

- **Database**:
  - `players` table (team_id, name, code, position, avatar_url, stats...).
- **API**:
  - `GET /api/teams/[slug]/players`: List players.
  - `POST /api/teams/[slug]/players`: Add player.
  - `GET /api/teams/[slug]/players/[id]`: Detail & Stats.
- **UI**:
  - `/teams/[slug]/players`: List Page.
  - `/teams/[slug]/players/new`: Add Page.
  - `/teams/[slug]/players/[id]`: Detail Page.

## 4. Implementation Plan

- [ ] **Setup**:
  - [ ] `features/players/types/player.types.ts`.
  - [ ] `features/players/validations/player-schemas.ts`.
- [ ] **API Layer**:
  - [ ] `app/api/teams/[slug]/players/route.ts` (GET, POST).
  - [ ] `app/api/teams/[slug]/players/[id]/route.ts` (GET, PUT, DELETE).
- [ ] **Hooks**:
  - [ ] `features/players/hooks/use-players.ts`.
  - [ ] `features/players/hooks/use-player.ts`.
- [ ] **Components**:
  - [ ] `PlayerListTable.tsx` (using shadcn Table).
  - [ ] `PlayerForm.tsx`.
  - [ ] `PlayerStatsCards.tsx`.
- [ ] **Pages**:
  - [ ] `app/(protected)/teams/[slug]/players/page.tsx`.
  - [ ] `app/(protected)/teams/[slug]/players/new/page.tsx`.
  - [ ] `app/(protected)/teams/[slug]/players/[id]/page.tsx`.

## 5. Edge Cases & Error Handling

- [ ] **Duplicate Code**: Check code constraint on DB insert.
- [ ] **Max Players**: Validations if needed (e.g. limit 50).
- [ ] **Delete**: Cascading delete (or soft delete) for history safety.

## 6. Context Updates Checklist

- [ ] `.context/14-module-players-matches.md` updated if needed.
