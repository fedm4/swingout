-- Migration: 0001_initial_schema
-- Created: 2026-03-06
-- Initial schema for Grupos Swing app

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  username    text unique,
  full_name   text,
  avatar_url  text,
  bio         text,
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "profiles_select_public"
  on public.profiles for select using (true);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- EVENTS
-- ============================================================
create table public.events (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  description   text,
  venue         text,
  city          text,
  country       text,
  start_date    date,
  end_date      date,
  website       text,
  cover_url     text,
  prices        jsonb default '[]'::jsonb,
  classes_info  text,
  is_published  boolean default false not null,
  created_by    uuid references public.profiles(id) on delete set null,
  created_at    timestamptz default now() not null,
  updated_at    timestamptz default now() not null
);

alter table public.events enable row level security;

create policy "events_select_published"
  on public.events for select
  using (is_published = true or auth.uid() = created_by);

create policy "events_insert_authenticated"
  on public.events for insert
  with check (auth.uid() is not null);

create policy "events_update_creator"
  on public.events for update
  using (auth.uid() = created_by);

create policy "events_delete_creator"
  on public.events for delete
  using (auth.uid() = created_by);

-- ============================================================
-- EVENT ATTENDEES
-- ============================================================
create type public.attendee_status as enum ('going', 'interested');

create table public.event_attendees (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid not null references public.events(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  status      public.attendee_status not null default 'interested',
  has_ticket  boolean default false,
  notes       text,
  created_at  timestamptz default now() not null,
  unique (event_id, user_id)
);

alter table public.event_attendees enable row level security;

create policy "event_attendees_select_all"
  on public.event_attendees for select using (true);

create policy "event_attendees_insert_authenticated"
  on public.event_attendees for insert
  with check (auth.uid() = user_id);

create policy "event_attendees_update_own"
  on public.event_attendees for update
  using (auth.uid() = user_id);

create policy "event_attendees_delete_own"
  on public.event_attendees for delete
  using (auth.uid() = user_id);

-- ============================================================
-- GROUPS
-- ============================================================
create type public.group_type as enum ('transport', 'accommodation', 'general');
create type public.member_role as enum ('admin', 'member');

create table public.groups (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  type        public.group_type not null default 'general',
  event_id    uuid references public.events(id) on delete set null,
  created_by  uuid references public.profiles(id) on delete set null,
  max_members int,
  is_open     boolean default true not null,
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

alter table public.groups enable row level security;

-- Simple policies that don't reference group_members (created after)
create policy "groups_insert_authenticated"
  on public.groups for insert
  with check (auth.uid() is not null);

create policy "groups_delete_creator"
  on public.groups for delete
  using (auth.uid() = created_by);

-- ============================================================
-- GROUP MEMBERS
-- ============================================================
create table public.group_members (
  id        uuid primary key default gen_random_uuid(),
  group_id  uuid not null references public.groups(id) on delete cascade,
  user_id   uuid not null references public.profiles(id) on delete cascade,
  role      public.member_role not null default 'member',
  joined_at timestamptz default now() not null,
  unique (group_id, user_id)
);

alter table public.group_members enable row level security;

create policy "group_members_select_members"
  on public.group_members for select
  using (
    exists (
      select 1 from public.group_members gm
      where gm.group_id = group_members.group_id
        and gm.user_id = auth.uid()
    )
    or exists (
      select 1 from public.groups g
      where g.id = group_members.group_id and g.is_open = true
    )
  );

create policy "group_members_insert_authenticated"
  on public.group_members for insert
  with check (auth.uid() = user_id);

create policy "group_members_delete_self_or_admin"
  on public.group_members for delete
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.group_members gm
      where gm.group_id = group_members.group_id
        and gm.user_id = auth.uid()
        and gm.role = 'admin'
    )
  );

-- groups policies that reference group_members (deferred until after that table exists)
create policy "groups_select_members_or_open"
  on public.groups for select
  using (
    is_open = true
    or auth.uid() = created_by
    or exists (
      select 1 from public.group_members
      where group_id = groups.id and user_id = auth.uid()
    )
  );

create policy "groups_update_admin"
  on public.groups for update
  using (
    auth.uid() = created_by
    or exists (
      select 1 from public.group_members
      where group_id = groups.id and user_id = auth.uid() and role = 'admin'
    )
  );

-- ============================================================
-- MESSAGES
-- ============================================================
create type public.channel_type as enum ('event', 'group');

create table public.messages (
  id           uuid primary key default gen_random_uuid(),
  content      text not null,
  user_id      uuid not null references public.profiles(id) on delete cascade,
  channel_type public.channel_type not null,
  channel_id   uuid not null,
  created_at   timestamptz default now() not null
);

alter table public.messages enable row level security;

-- For simplicity: authenticated users can read/write messages
-- Tightened in 0002_messages_rls.sql
create policy "messages_select_authenticated"
  on public.messages for select
  using (auth.uid() is not null);

create policy "messages_insert_authenticated"
  on public.messages for insert
  with check (auth.uid() = user_id);

-- ============================================================
-- TRANSPORT OFFERS
-- ============================================================
create table public.transport_offers (
  id               uuid primary key default gen_random_uuid(),
  group_id         uuid not null references public.groups(id) on delete cascade,
  user_id          uuid not null references public.profiles(id) on delete cascade,
  origin           text not null,
  seats_available  int not null default 1,
  departure_time   timestamptz,
  notes            text,
  created_at       timestamptz default now() not null,
  updated_at       timestamptz default now() not null
);

alter table public.transport_offers enable row level security;

create policy "transport_offers_select_group_members"
  on public.transport_offers for select
  using (
    exists (
      select 1 from public.group_members
      where group_id = transport_offers.group_id and user_id = auth.uid()
    )
  );

create policy "transport_offers_insert_group_members"
  on public.transport_offers for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.group_members
      where group_id = transport_offers.group_id and user_id = auth.uid()
    )
  );

create policy "transport_offers_update_own"
  on public.transport_offers for update
  using (auth.uid() = user_id);

create policy "transport_offers_delete_own"
  on public.transport_offers for delete
  using (auth.uid() = user_id);

-- ============================================================
-- ACCOMMODATION OFFERS
-- ============================================================
create table public.accommodation_offers (
  id               uuid primary key default gen_random_uuid(),
  group_id         uuid not null references public.groups(id) on delete cascade,
  user_id          uuid not null references public.profiles(id) on delete cascade,
  address          text not null,
  beds_available   int not null default 1,
  price_per_night  numeric(10,2),
  notes            text,
  created_at       timestamptz default now() not null,
  updated_at       timestamptz default now() not null
);

alter table public.accommodation_offers enable row level security;

create policy "accommodation_offers_select_group_members"
  on public.accommodation_offers for select
  using (
    exists (
      select 1 from public.group_members
      where group_id = accommodation_offers.group_id and user_id = auth.uid()
    )
  );

create policy "accommodation_offers_insert_group_members"
  on public.accommodation_offers for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.group_members
      where group_id = accommodation_offers.group_id and user_id = auth.uid()
    )
  );

create policy "accommodation_offers_update_own"
  on public.accommodation_offers for update
  using (auth.uid() = user_id);

create policy "accommodation_offers_delete_own"
  on public.accommodation_offers for delete
  using (auth.uid() = user_id);

-- ============================================================
-- INDEXES for performance
-- ============================================================
create index events_start_date_idx on public.events(start_date);
create index events_is_published_idx on public.events(is_published);
create index event_attendees_event_id_idx on public.event_attendees(event_id);
create index event_attendees_user_id_idx on public.event_attendees(user_id);
create index groups_event_id_idx on public.groups(event_id);
create index group_members_group_id_idx on public.group_members(group_id);
create index group_members_user_id_idx on public.group_members(user_id);
create index messages_channel_idx on public.messages(channel_type, channel_id, created_at);
create index transport_offers_group_id_idx on public.transport_offers(group_id);
create index accommodation_offers_group_id_idx on public.accommodation_offers(group_id);

-- ============================================================
-- REALTIME (enable for messages)
-- ============================================================
-- Run in Supabase Dashboard → Realtime → Tables
-- Or via CLI: supabase realtime enable public.messages
