# Module 1 & 2: Auth and Team Management

## 📦 Module 1: Authentication

### 1.1 User Registration

- **URL**: `/register`
- **AC**: Email/Password or Google OAuth. Email verification required. Real-time validation.
- **Endpoint**: `POST /api/auth/register`

### 1.2 User Login

- **URL**: `/login`
- **AC**: "Remember me", Forgot Password flow. Redirect to `/teams`.
- **Endpoint**: `POST /api/auth/login`

### 1.3 Email Verification

- **URL**: `/verify-email`, `/verify-email/success`
- **AC**: Link expiry 24h. Resend w/ 60s cooldown.

### 1.4 Password Reset

- **URL**: `/forgot-password`, `/reset-password/[token]`

### 1.5 User Profile

- **URL**: `/profile`
- **AC**: Edit Name, Avatar. Change Password. Delete Account.

---

## 📦 Module 2: Team Management

### 2.1 Team List

- **URL**: `/teams`
- **AC**: Grid of team cards (Logo, Name, Stats). "Create Team" button. Filter/Sort.
- **Endpoint**: `GET /api/teams`
- **Database**: `teams` (id, name, slug, logo_url, colors, owner_id).

### 2.2 Create Team

- **URL**: `/teams/new`
- **AC**: Name (required), Logo, Colors. Auto-generate slug.
- **Endpoint**: `POST /api/teams`
- **Validation**: Name min 3 chars. Logo max 2MB.

### 2.3 Team Dashboard

- **URL**: `/teams/[slug]/dashboard`
- **AC**:
  - **Header**: Logo, Name.
  - **Stats**: Total Players, Matches, Goals, Win Rate.
  - **Sections**: Recent Matches (5), Top Scorers (5), Upcoming Match.
  - **Actions**: Add Player, Record Match, Book Field.
- **Endpoint**: `GET /api/teams/[slug]/dashboard`
