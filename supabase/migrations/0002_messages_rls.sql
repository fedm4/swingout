-- Migration: 0002_messages_rls
-- Created: 2026-03-06
-- Tighten RLS on messages: only channel members can read/write

-- Drop the permissive policies from 0001
drop policy if exists "messages_select_authenticated" on public.messages;
drop policy if exists "messages_insert_authenticated" on public.messages;

-- Select: only if you're an attendee (event) or member (group)
create policy "messages_select_channel_members"
  on public.messages for select
  using (
    auth.uid() is not null
    and (
      (channel_type = 'event' and exists (
        select 1 from public.event_attendees
        where event_attendees.event_id = messages.channel_id
          and event_attendees.user_id = auth.uid()
      ))
      or (channel_type = 'group' and exists (
        select 1 from public.group_members
        where group_members.group_id = messages.channel_id
          and group_members.user_id = auth.uid()
      ))
    )
  );

-- Insert: same check + must be your own message
create policy "messages_insert_channel_members"
  on public.messages for insert
  with check (
    auth.uid() = user_id
    and (
      (channel_type = 'event' and exists (
        select 1 from public.event_attendees
        where event_attendees.event_id = messages.channel_id
          and event_attendees.user_id = auth.uid()
      ))
      or (channel_type = 'group' and exists (
        select 1 from public.group_members
        where group_members.group_id = messages.channel_id
          and group_members.user_id = auth.uid()
      ))
    )
  );
