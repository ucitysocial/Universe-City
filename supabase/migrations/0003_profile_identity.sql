-- Universe City. 0003. Member identity fields used at signup.
-- Full birth day is deliberately not stored. Month and year are sufficient
-- for the member file; zodiac is stored as the resulting badge value.

begin;

alter table profiles
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists birth_month smallint,
  add column if not exists birth_year smallint,
  add column if not exists zodiac text;

comment on column profiles.birth_month is 'Birth month only, 1-12. Full birth date is not required.';
comment on column profiles.birth_year is 'Four digit birth year. Full birth date is not required.';
comment on column profiles.zodiac is 'Member zodiac badge. Calculated from optional birth day or selected from the two signs in the birth month.';

-- Keep signup metadata and the profile row in one transaction through the auth trigger.
create or replace function uc_handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  first text := nullif(trim(coalesce(new.raw_user_meta_data->>'first_name', '')), '');
  last  text := nullif(trim(coalesce(new.raw_user_meta_data->>'last_name', '')), '');
  month_value smallint := nullif(new.raw_user_meta_data->>'birth_month', '')::smallint;
  year_value  smallint := nullif(new.raw_user_meta_data->>'birth_year', '')::smallint;
  sign_value  text := nullif(trim(coalesce(new.raw_user_meta_data->>'zodiac', '')), '');
begin
  insert into public.profiles (
    id, email, name, first_name, last_name, birth_month, birth_year, zodiac
  ) values (
    new.id,
    new.email,
    nullif(trim(concat_ws(' ', first, last)), ''),
    first,
    last,
    month_value,
    year_value,
    sign_value
  );
  return new;
end $$;

commit;
