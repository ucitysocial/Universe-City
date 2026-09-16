-- Universe City. 0003. Member identity fields used at signup.
-- Birthday is stored because the member's zodiac badge is derived from it.
-- Zodiac is never accepted as user-entered profile data.

begin;

alter table profiles
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists birth_date date,
  add column if not exists zodiac text;

alter table profiles
  drop constraint if exists profiles_birth_date_not_future,
  add constraint profiles_birth_date_not_future
    check (birth_date is null or birth_date <= current_date);

alter table profiles
  drop constraint if exists profiles_zodiac_valid,
  add constraint profiles_zodiac_valid
    check (zodiac is null or zodiac in (
      'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
      'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'
    ));

comment on column profiles.birth_date is
  'Member birthday. Used to derive the zodiac badge shown on the member file.';
comment on column profiles.zodiac is
  'Derived from birth_date. Never accepted directly from signup input.';

create or replace function uc_zodiac_from_date(d date) returns text
language plpgsql immutable as $$
declare md int;
begin
  if d is null then return null; end if;
  md := extract(month from d)::int * 100 + extract(day from d)::int;

  return case
    when md >= 1222 or md <= 119 then 'Capricorn'
    when md <= 218 then 'Aquarius'
    when md <= 320 then 'Pisces'
    when md <= 419 then 'Aries'
    when md <= 520 then 'Taurus'
    when md <= 620 then 'Gemini'
    when md <= 722 then 'Cancer'
    when md <= 822 then 'Leo'
    when md <= 922 then 'Virgo'
    when md <= 1022 then 'Libra'
    when md <= 1121 then 'Scorpio'
    else 'Sagittarius'
  end;
end $$;

create or replace function uc_derive_profile_identity() returns trigger
language plpgsql as $$
begin
  if new.first_name is not null then new.first_name := nullif(trim(new.first_name), ''); end if;
  if new.last_name is not null then new.last_name := nullif(trim(new.last_name), ''); end if;
  new.name := nullif(trim(concat_ws(' ', new.first_name, new.last_name)), '');
  new.zodiac := uc_zodiac_from_date(new.birth_date);
  return new;
end $$;

drop trigger if exists profiles_derive_identity on profiles;
create trigger profiles_derive_identity
  before insert or update of first_name, last_name, birth_date on profiles
  for each row execute function uc_derive_profile_identity();

-- Keep signup metadata and the profile row in one transaction through the auth trigger.
create or replace function uc_handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  first text := nullif(trim(coalesce(new.raw_user_meta_data->>'first_name', '')), '');
  last  text := nullif(trim(coalesce(new.raw_user_meta_data->>'last_name', '')), '');
  birthday date := nullif(new.raw_user_meta_data->>'birth_date', '')::date;
begin
  insert into public.profiles (
    id, email, first_name, last_name, birth_date
  ) values (
    new.id,
    new.email,
    first,
    last,
    birthday
  );
  return new;
end $$;

commit;
