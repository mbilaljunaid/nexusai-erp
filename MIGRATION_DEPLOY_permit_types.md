# Deploy permit_types Migration

## Quick Deploy (Supabase Dashboard)

1. **Go to Supabase Dashboard:** https://supabase.com/dashboard
2. **Select your project**
3. **Navigate to:** SQL Editor (left sidebar)
4. **Click:** "New query"
5. **Copy & Paste** the entire contents of:
   ```
   /Users/mbjunaid/My Projects/nexusai-erp-2/supabase/migrations/20260212_create_permit_types.sql
   ```
6. **Click:** "Run" (or press Cmd+Enter)
7. **Verify:** Check that 8 rows were inserted

## Alternative: Supabase CLI

If you have the Supabase CLI installed:

```bash
cd /Users/mbjunaid/My\ Projects/nexusai-erp-2
supabase db push
```

## Verify Deployment

After running the migration, verify the table exists:

```sql
-- Run this query in SQL Editor
SELECT name, category, requires_approval, validity_hours 
FROM permit_types 
WHERE is_active = true
ORDER BY name;
```

**Expected result:** 8 permit types listed

## Test the API

After deployment, test the backend endpoints:

```bash
# Start dev server
npm run dev

# In another terminal:
curl http://localhost:3000/api/maintenance/permit-types
```

**Expected:** JSON array of 8 permit types

## Troubleshoot

**Error: "relation permit_types does not exist"**
- The migration hasn't been run yet
- Re-run the SQL in Supabase dashboard

**Error: "permission denied"**
- Check RLS policies in Supabase dashboard
- Temporarily disable RLS for testing: `ALTER TABLE permit_types DISABLE ROW LEVEL SECURITY;`

## Rollback (if needed)

```sql
DROP TABLE IF EXISTS permit_types CASCADE;
```
