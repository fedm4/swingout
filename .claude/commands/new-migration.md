# New Migration

Create a new Supabase migration file with an auto-incremented number.

## Steps

1. List all files in `supabase/migrations/` and find the highest migration number (format: `NNNN_name.sql`).
2. Calculate the next number (pad to 4 digits, e.g., `0002`, `0003`).
3. Ask the user: "What should this migration be named? (e.g., add_user_roles, create_notifications_table)"
4. Create the file `supabase/migrations/<NNNN>_<name>.sql` with this template:

```sql
-- Migration: <NNNN>_<name>
-- Created: <today's date>

-- ============================================================
-- <Short description of what this migration does>
-- ============================================================

-- Write your SQL here
```

5. Remind the user:
   - Run locally: `supabase db reset` (if using Supabase CLI)
   - Apply to prod: paste in Supabase Dashboard → SQL Editor
   - After changes to tables, regenerate types: `npx supabase gen types typescript --project-id <id> > src/types/database.types.ts`
