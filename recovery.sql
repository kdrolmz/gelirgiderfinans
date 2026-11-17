-- Run once in this project's Supabase SQL editor. Contains NO personal records.
-- A 256-bit recovery key is a bearer credential. Only its SHA-256 hash is stored.
-- Existing finance_state rows and authentication settings are untouched.
begin;
create table if not exists public.finance_vault (
  key_hash text primary key,
  payload jsonb not null,
  revision bigint not null default 0,
  updated_at timestamptz not null default now()
);
alter table public.finance_vault enable row level security;
revoke all on public.finance_vault from public, anon, authenticated;

create or replace function public.read_finance_vault(p_key text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare result jsonb;
begin
  if p_key is null or p_key !~ '^[a-f0-9]{64}$' then raise exception 'INVALID_KEY'; end if;
  select jsonb_build_object('payload',v.payload,'revision',v.revision)
    into result from public.finance_vault v
    where v.key_hash = pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(p_key,'UTF8')),'hex');
  return result;
end $$;

create or replace function public.write_finance_vault(p_key text,p_payload jsonb,p_revision bigint)
returns bigint language plpgsql security definer set search_path = '' as $$
declare h text; result bigint;
begin
  if p_key is null or p_key !~ '^[a-f0-9]{64}$' then raise exception 'INVALID_KEY'; end if;
  if p_payload is null or pg_catalog.jsonb_typeof(p_payload) <> 'object'
    or pg_catalog.jsonb_typeof(p_payload->'records') is distinct from 'array'
    or pg_catalog.jsonb_typeof(p_payload->'payments') is distinct from 'object'
    or pg_catalog.jsonb_typeof(p_payload->'collections') is distinct from 'object'
    or pg_catalog.octet_length(p_payload::text) > 2000000 then raise exception 'INVALID_PAYLOAD'; end if;
  h := pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(p_key,'UTF8')),'hex');
  if p_revision = -1 then
    insert into public.finance_vault(key_hash,payload,revision) values(h,p_payload,0)
    on conflict do nothing returning revision into result;
  else
    update public.finance_vault set payload=p_payload,revision=revision+1,updated_at=now()
    where key_hash=h and revision=p_revision returning revision into result;
  end if;
  if result is null then raise exception 'SYNC_CONFLICT'; end if;
  return result;
end $$;
revoke all on function public.read_finance_vault(text) from public;
revoke all on function public.write_finance_vault(text,jsonb,bigint) from public;
grant execute on function public.read_finance_vault(text) to anon, authenticated;
grant execute on function public.write_finance_vault(text,jsonb,bigint) to anon, authenticated;
notify pgrst, 'reload schema';
commit;
