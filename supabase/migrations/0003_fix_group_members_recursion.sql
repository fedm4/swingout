-- Migration: 0003_fix_group_members_recursion
-- Created: 2026-03-06
-- Fix infinite recursion in group_members RLS policies
--
-- The problem: policies on group_members that query group_members
-- themselves cause infinite recursion.
-- The fix: use SECURITY DEFINER functions that bypass RLS internally.

-- Helper: check if current user is member of a group (bypasses RLS)
create or replace function public.is_group_member(gid uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.group_members
    where group_id = gid and user_id = auth.uid()
  );
$$;

-- Helper: check if current user is admin of a group (bypasses RLS)
create or replace function public.is_group_admin(gid uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.group_members
    where group_id = gid and user_id = auth.uid() and role = 'admin'
  );
$$;

-- Drop the recursive policies
drop policy if exists "group_members_select_members" on public.group_members;
drop policy if exists "group_members_delete_self_or_admin" on public.group_members;

-- Recreate without recursion
create policy "group_members_select_members"
  on public.group_members for select
  using (
    public.is_group_member(group_id)
    or exists (
      select 1 from public.groups g
      where g.id = group_id and g.is_open = true
    )
  );

create policy "group_members_delete_self_or_admin"
  on public.group_members for delete
  using (
    auth.uid() = user_id
    or public.is_group_admin(group_id)
  );

-- Also fix groups policies that were using inline subqueries
drop policy if exists "groups_select_members_or_open" on public.groups;
drop policy if exists "groups_update_admin" on public.groups;

create policy "groups_select_members_or_open"
  on public.groups for select
  using (
    is_open = true
    or auth.uid() = created_by
    or public.is_group_member(id)
  );

create policy "groups_update_admin"
  on public.groups for update
  using (
    auth.uid() = created_by
    or public.is_group_admin(id)
  );
