-- Migration: 0004_fix_messages_realtime
-- Created: 2026-03-06
-- Fix: Messages RLS policies query group_members (which has its own RLS),
-- causing Supabase Realtime postgres_changes to fail silently.
-- Solution: use SECURITY DEFINER functions (bypass RLS internally)
-- matching the pattern from 0003_fix_group_members_recursion.

-- Helper: check if current user is attending an event (bypasses RLS)
create or replace function public.is_event_attendee(eid uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.event_attendees
    where event_id = eid and user_id = auth.uid()
  );
$$;

-- Drop and recreate SELECT policy using SECURITY DEFINER functions
drop policy if exists "messages_select_channel_members" on public.messages;

create policy "messages_select_channel_members"
  on public.messages for select
  using (
    auth.uid() is not null
    and (
      (channel_type = 'event' and public.is_event_attendee(channel_id))
      or (channel_type = 'group' and public.is_group_member(channel_id))
    )
  );

-- Drop and recreate INSERT policy using SECURITY DEFINER functions
drop policy if exists "messages_insert_channel_members" on public.messages;

create policy "messages_insert_channel_members"
  on public.messages for insert
  with check (
    auth.uid() = user_id
    and (
      (channel_type = 'event' and public.is_event_attendee(channel_id))
      or (channel_type = 'group' and public.is_group_member(channel_id))
    )
  );
