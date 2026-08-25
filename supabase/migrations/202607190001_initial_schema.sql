-- Minima initial schema
-- Run with the Supabase CLI or paste into the Supabase SQL editor.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  created_at timestamptz not null default now(),
  streak_count integer not null default 0 check (streak_count >= 0),
  last_active_date date
);

create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 180),
  emoji text not null default '🌱',
  subtitle text not null default 'Kiçik addım',
  category text not null default 'Ümumi',
  target_minutes integer not null default 5 check (target_minutes between 1 and 60),
  is_ai_generated boolean not null default false,
  is_daily_task boolean not null default false,
  source_date date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint daily_task_requires_date check (
    (is_daily_task = false) or (source_date is not null)
  )
);

create table if not exists public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  habit_id uuid not null references public.habits(id) on delete cascade,
  completed_at date not null default ((timezone('Asia/Baku', now()))::date),
  created_at timestamptz not null default now(),
  unique (habit_id, completed_at)
);

create table if not exists public.mood_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  mood_emoji text not null,
  mood_level smallint not null default 2 check (mood_level between 0 and 4),
  logged_date date not null default ((timezone('Asia/Baku', now()))::date),
  created_at timestamptz not null default now(),
  unique (user_id, logged_date)
);

create index if not exists habits_user_id_idx on public.habits(user_id);
create index if not exists habit_logs_user_date_idx
  on public.habit_logs(user_id, completed_at desc);
create index if not exists mood_logs_user_date_idx
  on public.mood_logs(user_id, logged_date desc);
create unique index if not exists habits_one_daily_task_per_day_idx
  on public.habits(user_id, source_date)
  where is_daily_task = true;

alter table public.profiles enable row level security;
alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;
alter table public.mood_logs enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "habits_select_own" on public.habits;
create policy "habits_select_own"
  on public.habits for select
  using (auth.uid() = user_id);

drop policy if exists "habits_insert_own" on public.habits;
create policy "habits_insert_own"
  on public.habits for insert
  with check (auth.uid() = user_id);

drop policy if exists "habits_update_own" on public.habits;
create policy "habits_update_own"
  on public.habits for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "habits_delete_own" on public.habits;
create policy "habits_delete_own"
  on public.habits for delete
  using (auth.uid() = user_id);

drop policy if exists "habit_logs_select_own" on public.habit_logs;
create policy "habit_logs_select_own"
  on public.habit_logs for select
  using (auth.uid() = user_id);

drop policy if exists "habit_logs_insert_own" on public.habit_logs;
create policy "habit_logs_insert_own"
  on public.habit_logs for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.habits
      where habits.id = habit_id and habits.user_id = auth.uid()
    )
  );

drop policy if exists "habit_logs_delete_own" on public.habit_logs;
create policy "habit_logs_delete_own"
  on public.habit_logs for delete
  using (auth.uid() = user_id);

drop policy if exists "mood_logs_select_own" on public.mood_logs;
create policy "mood_logs_select_own"
  on public.mood_logs for select
  using (auth.uid() = user_id);

drop policy if exists "mood_logs_insert_own" on public.mood_logs;
create policy "mood_logs_insert_own"
  on public.mood_logs for insert
  with check (auth.uid() = user_id);

drop policy if exists "mood_logs_update_own" on public.mood_logs;
create policy "mood_logs_update_own"
  on public.mood_logs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(coalesce(new.email, 'Dost'), '@', 1))
  )
  on conflict (id) do nothing;

  insert into public.habits
    (user_id, title, emoji, subtitle, category, target_minutes)
  values
    (new.id, '10 dəq kitab oxu', '📖', 'Diqqət · Sakitlik', 'Diqqət', 10),
    (new.id, '10 dəq gəz', '🚶', 'Hərəkət', 'Hərəkət', 10),
    (new.id, '2 stəkan su iç', '💧', 'Enerji', 'Enerji', 2),
    (new.id, '5 dəq meditasiya', '🧘', 'Sakitlik', 'Sakitlik', 5);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.recompute_profile_streak(target_user uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  latest_date date;
  cursor_date date;
  expected_date date;
  current_streak integer := 0;
  baku_today date := (timezone('Asia/Baku', now()))::date;
begin
  select max(completed_at)
  into latest_date
  from public.habit_logs
  where user_id = target_user;

  if latest_date is null or latest_date < baku_today - 1 then
    update public.profiles
    set streak_count = 0, last_active_date = latest_date
    where id = target_user;
    return;
  end if;

  expected_date := latest_date;
  for cursor_date in
    select distinct completed_at
    from public.habit_logs
    where user_id = target_user
    order by completed_at desc
  loop
    if cursor_date = expected_date then
      current_streak := current_streak + 1;
      expected_date := expected_date - 1;
    else
      exit;
    end if;
  end loop;

  update public.profiles
  set streak_count = current_streak, last_active_date = latest_date
  where id = target_user;
end;
$$;

create or replace function public.sync_profile_streak()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  perform public.recompute_profile_streak(coalesce(new.user_id, old.user_id));
  return coalesce(new, old);
end;
$$;

drop trigger if exists habit_logs_sync_streak on public.habit_logs;
create trigger habit_logs_sync_streak
  after insert or delete on public.habit_logs
  for each row execute procedure public.sync_profile_streak();

grant execute on function public.recompute_profile_streak(uuid) to authenticated;
