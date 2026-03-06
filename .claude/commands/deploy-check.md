# Deploy Check

Verify the project is ready to deploy before pushing to Vercel.

## Checklist

Run through each item and report status (✅ / ❌):

### 1. Environment Variables
- Check that `.env.local` exists (for local dev)
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set and non-empty
- Remind user to set these same variables in Vercel dashboard

### 2. TypeScript Build
```bash
npm run build
```
- Must complete with **0 TypeScript errors**
- Must complete with **0 build errors**
- Check that `dist/` folder is created

### 3. Supabase Migrations
- List files in `supabase/migrations/`
- Ask user: "Have all migrations been applied to the production Supabase project?"
- Remind: apply via Supabase Dashboard → SQL Editor, or `supabase db push`

### 4. RLS Policies
- Remind user to verify that Row Level Security is **enabled** on all tables in Supabase Dashboard
- Tables to check: `profiles`, `events`, `event_attendees`, `groups`, `group_members`, `messages`, `transport_offers`, `accommodation_offers`

### 5. Auth Configuration
- Verify Supabase Auth → Site URL is set to the Vercel production URL
- Verify redirect URLs include the production domain

### 6. Git Status
```bash
git status
git log --oneline -5
```
- No uncommitted changes that should be deployed
- Latest commit includes all intended changes

### 7. Summary
Report overall status and list any items that need attention before deploying.
