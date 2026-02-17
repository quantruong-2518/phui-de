# [Feature Name] Specifications

**Status**: [Planning] | In Progress | Completed
**Owner**: [Agent Name/User]

## 1. Overview

**Goal**: [Briefly describe what this feature does]
**User Story**: As a [User], I want to [Action], so that [Benefit].

## 2. Acceptance Criteria (AC)

- [ ] AC1: [Condition for success]
- [ ] AC2: ...
- [ ] AC3: ...

## 3. Data Flow & Logic

_(Describe how data moves. Use Mermaid diagram if complex)_

- **Input**: [e.g. Form data]
- **Process**: [e.g. Validate -> API Call -> DB Insert]
- **Output**: [e.g. New record in DB, Toast success]

## 4. Implementation Plan

_(Checklist of modules/functions to build)_

- [ ] **Database**:
  - [ ] [Table/Column changes]
- [ ] **API Layer**:
  - [ ] `GET /api/...`: [Description]
  - [ ] `POST /api/...`: [Description]
- [ ] **UI Layer**:
  - [ ] `ComponentA`: [Props & Logic]
  - [ ] `ComponentB`: ...
- [ ] **Validation**:
  - [ ] Zod schema: ...

## 5. Edge Cases & Error Handling

- [ ] Case: [e.g. Network offline] -> Action: [e.g. Show error toast]
- [ ] Case: [e.g. Invalid input] -> Action: [e.g. Show form error]

## 6. Context Updates Checklist

_(Files that need updating after completion)_

- [ ] `.context/03-database-schema.md` (if DB changed)
- [ ] `.context/05-api-patterns.md` (if new pattern used)
