# Authentication Module Specifications

**Status**: Planning
**Owner**: Antigravity Agent

## 1. Overview

**Goal**: Manage user authentication (Register, Login, Password Reset) and Profile management.
**User Story**: As a user, I want to securely log in and manage my account so that I can access my team's data.

## 2. Acceptance Criteria (AC)

- [ ] **Register**: Email/Password or Google OAuth. Verification email sent.
- [ ] **Login**: Secure login. "Remember Me" functionality. Redirect to `/teams`.
- [ ] **Forgot Password**: Password reset flow via email link.
- [ ] **Profile**: Update Name, Avatar. Change Password. Delete Account.
- [ ] **Security**: Password min 8 chars. Real-time validation.

## 3. Data Flow & Logic

- **Auth Provider**: Supabase Auth (handles users table).
- **Public Routes**: `/login`, `/register`, `/verify-email`, `/forgot-password`.
- **Protected Routes**: `/profile`, `/teams` (and all sub-routes).
- **Middleware**: Intercepts requests to protected routes and checks Supabase session.

## 4. Implementation Plan

- [ ] **Setup**:
  - [ ] Create `middleware.ts` for Supabase Session protection.
  - [ ] Create `features/auth/types/auth.types.ts`.
- [ ] **Validation**:
  - [ ] `features/auth/validations/auth-schemas.ts` (Login, Register, Reset).
- [ ] **Hooks**:
  - [ ] `features/auth/hooks/use-auth.ts` (Wrapper around Supabase Auth).
- [ ] **UI Components**:
  - [ ] `LoginForm.tsx`, `RegisterForm.tsx`.
  - [ ] `AuthLayout.tsx` (Single column, centered).
- [ ] **Pages**:
  - [ ] `/login/page.tsx`, `/register/page.tsx`.
  - [ ] `/forgot-password/page.tsx`.
  - [ ] `/profile/page.tsx`.

## 5. Edge Cases & Error Handling

- [ ] **Network Error**: Show toast "Connection failed".
- [ ] **Auth Error**: Show toast from Supabase error message (e.g. "Invalid credentials").
- [ ] **Session Expired**: Redirect to `/login` with `?next=...` query param.

## 6. Context Updates Checklist

- [ ] Updated `.context/13-module-auth-teams.md` if flow changes.
