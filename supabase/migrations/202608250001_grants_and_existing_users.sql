grant usage on schema public to authenticated, service_role;

grant select, update on table public.profiles to authenticated;
grant select, insert, update, delete on table public.habits to authenticated;
grant select, insert, delete on table public.habit_logs to authenticated;
grant select, insert, update on table public.mood_logs to authenticated;

grant all privileges on table
  public.profiles,
  public.habits,
  public.habit_logs,
  public.mood_logs
to service_role;

with inserted_profiles as (
  insert into public.profiles (id, email, full_name)
  select
    users.id,
    coalesce(users.email, ''),
    coalesce(
      users.raw_user_meta_data ->> 'full_name',
      split_part(coalesce(users.email, 'Dost'), '@', 1)
    )
  from auth.users as users
  left join public.profiles as profiles on profiles.id = users.id
  where profiles.id is null
  on conflict (id) do nothing
  returning id
)
insert into public.habits
  (user_id, title, emoji, subtitle, category, target_minutes)
select
  inserted_profiles.id,
  starter.title,
  starter.emoji,
  starter.subtitle,
  starter.category,
  starter.target_minutes
from inserted_profiles
cross join (
  values
    ('10 dəq kitab oxu', '📖', 'Diqqət · Sakitlik', 'Diqqət', 10),
    ('10 dəq gəz', '🚶', 'Hərəkət', 'Hərəkət', 10),
    ('2 stəkan su iç', '💧', 'Enerji', 'Enerji', 2),
    ('5 dəq meditasiya', '🧘', 'Sakitlik', 'Sakitlik', 5)
) as starter(title, emoji, subtitle, category, target_minutes);
