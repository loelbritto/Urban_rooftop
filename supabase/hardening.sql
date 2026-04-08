-- Supabase hardening migration for Urban Rooftop
-- Run this AFTER your existing table creation script.
-- It keeps your schema but improves data quality and security.

-- 1) Helpful indexes
create index if not exists idx_spaces_owner_id on public.spaces(owner_id);
create index if not exists idx_spaces_created_at on public.spaces(created_at desc);

create index if not exists idx_compost_pickups_user_id on public.compost_pickups(user_id);
create index if not exists idx_compost_pickups_pickup_date on public.compost_pickups(pickup_date);

create index if not exists idx_marketplace_seller_id on public.marketplace(seller_id);
create index if not exists idx_marketplace_created_at on public.marketplace(created_at desc);

create unique index if not exists idx_impact_stats_user_id_unique on public.impact_stats(user_id);

-- 2) Basic NOT NULL and sane defaults
alter table public.spaces
  alter column owner_id set not null,
  alter column title set not null,
  alter column location set not null,
  alter column size_sqft set not null,
  alter column sunlight_hours set not null,
  alter column is_available set not null,
  alter column created_at set not null;

alter table public.compost_pickups
  alter column user_id set not null,
  alter column address set not null,
  alter column pickup_date set not null,
  alter column waste_kg set not null,
  alter column status set not null,
  alter column created_at set not null;

alter table public.marketplace
  alter column seller_id set not null,
  alter column crop_name set not null,
  alter column quantity_kg set not null,
  alter column price_per_kg set not null,
  alter column is_barter set not null,
  alter column created_at set not null;

alter table public.impact_stats
  alter column user_id set not null,
  alter column food_grown_kg set not null,
  alter column waste_composted_kg set not null,
  alter column co2_saved_kg set not null,
  alter column updated_at set not null;

-- 3) Data checks
alter table public.spaces
  add constraint spaces_size_sqft_check check (size_sqft > 0),
  add constraint spaces_sunlight_hours_check check (sunlight_hours between 0 and 24);

alter table public.compost_pickups
  add constraint compost_pickups_waste_kg_check check (waste_kg > 0),
  add constraint compost_pickups_status_check check (status in ('pending', 'scheduled', 'completed'));

alter table public.marketplace
  add constraint marketplace_quantity_kg_check check (quantity_kg > 0),
  add constraint marketplace_price_per_kg_check check (
    (is_barter = true and price_per_kg = 0)
    or
    (is_barter = false and price_per_kg > 0)
  );

alter table public.impact_stats
  add constraint impact_stats_food_grown_kg_check check (food_grown_kg >= 0),
  add constraint impact_stats_waste_composted_kg_check check (waste_composted_kg >= 0),
  add constraint impact_stats_co2_saved_kg_check check (co2_saved_kg >= 0);

-- 4) Keep updated_at fresh on updates for impact_stats
create or replace function public.set_impact_stats_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_set_impact_stats_updated_at on public.impact_stats;
create trigger trg_set_impact_stats_updated_at
before update on public.impact_stats
for each row
execute function public.set_impact_stats_updated_at();

-- 5) Replace broad policies with ownership-based policies
-- Existing policy names are the same on all tables in your script.
drop policy if exists "Allow all for users" on public.spaces;
drop policy if exists "Allow all for users" on public.compost_pickups;
drop policy if exists "Allow all for users" on public.marketplace;
drop policy if exists "Allow all for users" on public.impact_stats;

-- spaces: anyone authenticated can read; only owner can write own rows
create policy spaces_select_auth
on public.spaces
for select
using (auth.uid() is not null);

create policy spaces_insert_own
on public.spaces
for insert
with check (owner_id = auth.uid());

create policy spaces_update_own
on public.spaces
for update
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy spaces_delete_own
on public.spaces
for delete
using (owner_id = auth.uid());

-- compost_pickups: restrict writes to record owner; select for logged in users
create policy compost_pickups_select_auth
on public.compost_pickups
for select
using (auth.uid() is not null);

create policy compost_pickups_insert_own
on public.compost_pickups
for insert
with check (user_id = auth.uid());

create policy compost_pickups_update_own
on public.compost_pickups
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy compost_pickups_delete_own
on public.compost_pickups
for delete
using (user_id = auth.uid());

-- marketplace: authenticated users can browse; only seller can mutate own rows
create policy marketplace_select_auth
on public.marketplace
for select
using (auth.uid() is not null);

create policy marketplace_insert_own
on public.marketplace
for insert
with check (seller_id = auth.uid());

create policy marketplace_update_own
on public.marketplace
for update
using (seller_id = auth.uid())
with check (seller_id = auth.uid());

create policy marketplace_delete_own
on public.marketplace
for delete
using (seller_id = auth.uid());

-- impact_stats: private per-user stats
create policy impact_stats_select_own
on public.impact_stats
for select
using (user_id = auth.uid());

create policy impact_stats_insert_own
on public.impact_stats
for insert
with check (user_id = auth.uid());

create policy impact_stats_update_own
on public.impact_stats
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy impact_stats_delete_own
on public.impact_stats
for delete
using (user_id = auth.uid());
