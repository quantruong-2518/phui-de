---
description: A strict workflow for implementing tasks with planning and reflection
---

Steps:

1. **Analyze Request**:
   - Read Acceptance Criteria (user prompt).
   - Read related `.context` files.
   - Read related `.ai` skills.

2. **Plan & Spec**:
   - IF new feature: Create `features/[name]/specs.md` from `.agent/templates/feature-spec.md`.
   - IF existing feature: Read/Update `features/[name]/specs.md`.
   - **CRITICAL**: Fill out the "Implementation Plan" section in `specs.md`.
   - **STOP**: Ask User to review the plan in `specs.md` before coding.

3. **Execute**:
   - Follow the detailed plan in `specs.md`.
   - Code methodically (DB -> API -> Hook -> UI).
   - Verify each step against AC.

4. **Reflect & Update Context**:
   - Did the implementation deviate from the plan? -> Update `specs.md`.
   - Did we change DB schema? -> Update `.context/03-database-schema.md`.
   - Did we add a reusable pattern? -> Update `.context/` or create new `.ai` skill.

Example prompt: "Implement the penalty card logic for players, following the specs."
