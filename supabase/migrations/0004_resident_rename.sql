-- The founder ruled on October 10, 2026: there are no memberships, only residencies.
-- The person is a resident. This renames the stored values to match.
-- Applied to the live database on October 10, 2026 as "resident_rename".

alter type uc_role   rename value 'member' to 'resident';
alter type uc_source rename value 'member' to 'resident';
alter type uc_membership rename to uc_residency;
alter table profiles rename column membership to residency;

alter policy standards_member_insert on standards rename to standards_resident_insert;
alter policy standards_member_update on standards rename to standards_resident_update;
alter policy standards_member_delete on standards rename to standards_resident_delete;
alter policy statements_member_insert on statements rename to statements_resident_insert;
alter policy statements_member_update on statements rename to statements_resident_update;
alter policy statements_member_delete on statements rename to statements_resident_delete;
alter policy blocks_member_insert on blocks rename to blocks_resident_insert;
alter policy blocks_member_update on blocks rename to blocks_resident_update;
alter policy blocks_member_delete on blocks rename to blocks_resident_delete;
alter policy inventory_items_member_insert on inventory_items rename to inventory_items_resident_insert;
alter policy inventory_items_member_update on inventory_items rename to inventory_items_resident_update;
alter policy inventory_items_member_delete on inventory_items rename to inventory_items_resident_delete;
alter policy entries_member_insert on entries rename to entries_resident_insert;
alter policy entries_member_update on entries rename to entries_resident_update;
alter policy entries_member_delete on entries rename to entries_resident_delete;
alter policy salary_member_insert on salary rename to salary_resident_insert;
alter policy salary_member_update on salary rename to salary_resident_update;
alter policy salary_member_delete on salary rename to salary_resident_delete;

comment on column profiles.birth_date is
  'Resident birthday. Used to derive the zodiac badge shown on the resident file.';

create or replace function uc_block_revision() returns trigger
language plpgsql security definer set search_path to 'public' as $function$
declare actor uuid := auth.uid();
declare who uc_source;
begin
  if to_jsonb(old) is distinct from to_jsonb(new) then
    if actor is null then who := 'ai';
    elsif uc_is_agent() then who := 'agent';
    else who := 'resident';
    end if;

    insert into public.block_revisions (block_id, user_id, before, after, changed_by, origin)
    values (old.id, old.user_id, to_jsonb(old), to_jsonb(new), actor, who);
  end if;
  new.updated_at := now();
  return new;
end $function$;

create or replace function uc_force_origin() returns trigger
language plpgsql security definer set search_path to 'public' as $function$
begin
  if auth.uid() is null then return new; end if;
  if uc_is_agent() then return new; end if;
  new.origin := 'resident';
  return new;
end $function$;

create or replace function uc_force_source() returns trigger
language plpgsql security definer set search_path to 'public' as $function$
begin
  if auth.uid() is null then return new; end if;
  if uc_is_agent() then
    if new.source = 'ai' then
      raise exception 'Only a server side process may record source = ai';
    end if;
    return new;
  end if;
  new.source := 'resident';
  return new;
end $function$;

create or replace function uc_guard_profile() returns trigger
language plpgsql security definer set search_path to 'public' as $function$
declare acting_agent boolean;
begin
  if auth.uid() is null then
    new.updated_at := now();
    return new;
  end if;

  acting_agent := uc_is_agent();

  if not acting_agent then
    if new.role is distinct from old.role
       or new.residency is distinct from old.residency
       or new.case_no is distinct from old.case_no
       or new.represented_since is distinct from old.represented_since then
      raise exception 'Not yours to change: role, residency, case_no, represented_since';
    end if;
  end if;

  if new.email is distinct from old.email then
    raise exception 'Change your email through account settings, not the profile record';
  end if;

  new.updated_at := now();
  return new;
end $function$;
