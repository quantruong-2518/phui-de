# Database Migration Instructions

## How to Run Migration

### Option 1: Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard:**
   - Go to https://supabase.com/dashboard
   - Select your project: `tixsoyvulyhrofidziug`

2. **Navigate to SQL Editor:**
   - Click "SQL Editor" in left sidebar
   - Click "New Query"

3. **Copy & Execute Migration:**
   - Open `supabase/migrations/001_initial_schema.sql`
   - Copy entire contents
   - Paste into SQL Editor
   - Click "Run" button

4. **Verify Tables Created:**
   - Go to "Table Editor" in left sidebar
   - You should see 4 new tables:
     - `users`
     - `teams`
     - `team_members`
     - `onboarding_data`

5. **Verify RLS Policies:**
   - Click on each table
   - Go to "Policies" tab
   - Should see multiple policies for each table

### Option 2: Supabase CLI (Advanced)

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref tixsoyvulyhrofidziug

# Run migration
supabase db push
```

## Post-Migration Steps

### 1. Create Test Data

After migration, create some test teams for development:

```sql
-- Insert test teams (run in SQL Editor)
-- Note: Replace 'YOUR_USER_ID' with actual user ID from auth.users table

INSERT INTO public.teams (name, slug, code, primary_color, secondary_color, owner_id)
VALUES
  ('FC Toji', 'fc-toji', 'TOJI001', '#BFFF00', '#1A1A1A', 'YOUR_USER_ID'),
  ('Binh Thanh United', 'binh-thanh-utd', 'BTU002', '#FF0000', '#FFFFFF', 'YOUR_USER_ID'),
  ('Code Lovers FC', 'code-lovers-fc', 'CLF003', '#0000FF', '#FFFFFF', 'YOUR_USER_ID');
```

### 2. Verify RLS Policies

Test that policies work correctly:

```sql
-- Test as authenticated user (should work)
SELECT * FROM public.teams;

-- Test insert (should work if you're the owner)
INSERT INTO public.users (id, name, phone)
VALUES (auth.uid(), 'Test User', '0912345678');
```

## Troubleshooting

### Error: "relation already exists"

If tables already exist, you can either:

1. Drop existing tables first (⚠️ will delete data)
2. Modify migration to use `CREATE TABLE IF NOT EXISTS`

### Error: "permission denied"

Make sure you're running the migration as the Supabase admin user in the SQL Editor.

### Error: "function auth.uid() does not exist"

This means RLS context is not available. Make sure you're testing policies through the Supabase client, not directly in SQL Editor.

## Next Steps

After successful migration:

1. ✅ Verify tables in Table Editor
2. ✅ Create test data
3. ✅ Test API endpoints
4. ✅ Test onboarding flow
