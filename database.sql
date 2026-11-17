create table if not exists public.finance_state (user_id uuid primary key references auth.users(id) on delete cascade,payload jsonb not null default '{}'::jsonb,revision bigint not null default 0,updated_at timestamptz not null default now());
alter table public.finance_state enable row level security;
revoke all on public.finance_state from anon;
grant select,insert,update on public.finance_state to authenticated;
drop policy if exists finance_select_own on public.finance_state;
create policy finance_select_own on public.finance_state for select to authenticated using (auth.uid()=user_id);
drop policy if exists finance_insert_own on public.finance_state;
create policy finance_insert_own on public.finance_state for insert to authenticated with check (auth.uid()=user_id);
drop policy if exists finance_update_own on public.finance_state;
create policy finance_update_own on public.finance_state for update to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id);
create or replace function public.save_finance_state(p_payload jsonb,p_revision bigint)
returns bigint language plpgsql security invoker set search_path=public as $$
declare v_revision bigint;
begin
 update finance_state set payload=p_payload,revision=revision+1,updated_at=now()
 where user_id=auth.uid() and revision=p_revision returning revision into v_revision;
 if v_revision is null then raise exception 'SYNC_CONFLICT'; end if;
 return v_revision;
end $$;
revoke all on function public.save_finance_state(jsonb,bigint) from public;
grant execute on function public.save_finance_state(jsonb,bigint) to authenticated;