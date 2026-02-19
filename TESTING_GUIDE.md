# Backend Integration - Testing Guide

## 🎯 Overview

This guide walks you through testing the backend integration step-by-step.

## Phase 1: Database Setup

### Step 1: Run Migration

1. Open Supabase Dashboard: https://supabase.com/dashboard
2. Select project: `tixsoyvulyhrofidziug`
3. Go to **SQL Editor** → **New Query**
4. Copy contents from `supabase/migrations/001_initial_schema.sql`
5. Paste and click **Run**

**Expected Result:**

```
Success. No rows returned
```

### Step 2: Verify Tables

1. Go to **Table Editor**
2. Check that these tables exist:
   - ✅ `users`
   - ✅ `teams`
   - ✅ `team_members`
   - ✅ `onboarding_data`

### Step 3: Create Test Data

Run this SQL to create test teams:

```sql
-- First, get your user ID from auth.users
SELECT id, email FROM auth.users LIMIT 1;

-- Replace 'YOUR_USER_ID' with the actual ID from above
INSERT INTO public.teams (name, slug, code, primary_color, secondary_color, owner_id)
VALUES
  ('FC Toji', 'fc-toji', 'TOJI001', '#BFFF00', '#1A1A1A', 'YOUR_USER_ID'),
  ('Binh Thanh United', 'binh-thanh-utd', 'BTU002', '#FF0000', '#FFFFFF', 'YOUR_USER_ID'),
  ('Code Lovers FC', 'code-lovers-fc', 'CLF003', '#0000FF', '#FFFFFF', 'YOUR_USER_ID');
```

**Expected Result:**

- 3 teams created successfully
- Check in Table Editor → `teams` table

---

## Phase 2: API Testing

### Test 1: GET /api/teams

```bash
# Open terminal in project directory
cd /home/stevetruong/work/toji-projects

# Test basic GET
curl http://localhost:3000/api/teams

# Test with search
curl "http://localhost:3000/api/teams?search=toji"
```

**Expected Response:**

```json
{
  "data": [
    {
      "id": "...",
      "name": "FC Toji",
      "code": "TOJI001",
      "slug": "fc-toji",
      "member_count": 0,
      ...
    }
  ]
}
```

### Test 2: Onboarding API (Browser Required)

The onboarding API requires authentication, so we'll test it through the browser after completing the onboarding flow.

---

## Phase 3: Browser Testing

### Step 1: Clear Existing Data

1. Open http://localhost:3000
2. Open DevTools (F12) → Console
3. Run: `localStorage.clear()`
4. Refresh page

**Expected:** OnboardingModal should appear

### Step 2: Test Team Selection

1. Click "Bắt Đầu Ngay"
2. Click "Tham Gia Đội"
3. Type "toji" in search box

**Expected:**

- ✅ Loading state appears briefly
- ✅ "FC Toji" team appears in results
- ✅ Shows "TOJI001" code
- ✅ Shows "0 thành viên"

### Step 3: Complete Onboarding

1. Select "FC Toji"
2. Choose role (e.g., "Đội viên")
3. Enter name: "Test User"
4. Enter phone: "0912345678"
5. Click "Hoàn tất"

**Expected:**

- ✅ Redirects to homepage
- ✅ No errors in console
- ✅ Homepage shows team info

### Step 4: Verify Database

Go to Supabase Dashboard → Table Editor:

**Check `users` table:**

- Should have 1 row with your name and phone

**Check `onboarding_data` table:**

- Should have 1 row
- `status` = 'team_member'
- `team_id` = FC Toji's ID
- `role_id` = 'member'

**Check `team_members` table:**

- Should have 1 row
- Links your user to FC Toji
- `approval_status` = 'approved' (since member role doesn't require approval)

### Step 5: Test Persistence

1. Refresh the page
2. **Expected:** Homepage loads (no onboarding modal)
3. Check that team info is displayed

---

## Phase 4: Error Handling Tests

### Test 1: Network Error

1. Open DevTools → Network tab
2. Enable "Offline" mode
3. Clear localStorage and refresh
4. Try to search for teams

**Expected:**

- ✅ Error message appears
- ✅ "Thử lại" button works

### Test 2: Empty Search

1. Go online again
2. Search for "nonexistent"

**Expected:**

- ✅ "Không tìm thấy đội nào" message

---

## Phase 5: Loading States

### Test Loading Indicators

1. Clear localStorage
2. Go through onboarding
3. In team search, type slowly

**Expected:**

- ✅ Loading spinner appears
- ✅ "Đang tìm kiếm..." text shows
- ✅ Smooth transition to results

---

## 🐛 Troubleshooting

### Issue: "Unauthorized" error

**Cause:** Not authenticated with Supabase
**Fix:**

1. Check `.env` file has correct Supabase credentials
2. Restart dev server: `npm run dev`

### Issue: Teams not appearing

**Cause:** No test data in database
**Fix:** Run the INSERT SQL from Phase 1, Step 3

### Issue: TypeScript errors

**Cause:** Missing types or imports
**Fix:**

1. Check all imports are correct
2. Run: `npm run lint`

### Issue: "Failed to fetch teams"

**Cause:** API route error
**Fix:**

1. Check terminal for error logs
2. Verify Supabase connection
3. Check RLS policies are enabled

---

## ✅ Success Criteria

All tests pass if:

- [x] Database tables created
- [x] Test teams inserted
- [x] API returns teams correctly
- [x] Search functionality works
- [x] Onboarding flow completes
- [x] Data persists in database
- [x] Loading states appear
- [x] Error handling works
- [x] Page refresh maintains state

---

## 📝 Next Steps

After successful testing:

1. ✅ Commit changes
2. ✅ Deploy to staging (if applicable)
3. ✅ Test on staging environment
4. ✅ Migrate other features (matches, players, etc.)
