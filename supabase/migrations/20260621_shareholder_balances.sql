-- Libro mayor de saldo disponible por socio.
create table public.shareholder_balance_entries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  shareholder_id uuid not null references public.shareholders(id) on delete restrict,
  movement_date date not null default current_date,
  entry_type text not null check (entry_type in ('opening_balance', 'adjustment_credit', 'adjustment_debit', 'withdrawal', 'guide_payment')),
  direction text not null check (direction in ('credit', 'debit')),
  amount numeric(14,2) not null check (amount > 0),
  description text,
  guide_id uuid unique references public.guides(id) on delete cascade,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index shareholder_balance_entries_organization_date_idx on public.shareholder_balance_entries (organization_id, movement_date desc);
create index shareholder_balance_entries_shareholder_idx on public.shareholder_balance_entries (shareholder_id, movement_date desc);
create trigger shareholder_balance_entries_audit after insert or update or delete on public.shareholder_balance_entries for each row execute function public.write_audit_log();

alter table public.shareholder_balance_entries enable row level security;
create policy "members read shareholder balances" on public.shareholder_balance_entries for select using (public.is_org_member(organization_id));
create policy "members write shareholder balances" on public.shareholder_balance_entries for insert with check (public.is_org_member(organization_id));
create policy "members update shareholder balances" on public.shareholder_balance_entries for update using (public.is_org_member(organization_id));
create policy "members delete shareholder balances" on public.shareholder_balance_entries for delete using (public.is_org_member(organization_id));

create or replace function public.sync_guide_payment_to_shareholder_balance()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'Pagada' and new.shareholder_id is not null then
    insert into public.shareholder_balance_entries (organization_id, shareholder_id, movement_date, entry_type, direction, amount, description, guide_id, created_by)
    values (new.organization_id, new.shareholder_id, new.purchase_date, 'guide_payment', 'debit', new.driver_payment, concat('Pago de guía ', coalesce(new.guide_number, new.id::text)), new.id, auth.uid())
    on conflict (guide_id) do update set shareholder_id = excluded.shareholder_id, movement_date = excluded.movement_date, amount = excluded.amount, description = excluded.description;
  elsif old.status = 'Pagada' then
    delete from public.shareholder_balance_entries where guide_id = old.id;
  end if;
  return new;
end;
$$;
create trigger guides_sync_shareholder_balance
after insert or update of status, driver_payment, shareholder_id, purchase_date on public.guides
for each row execute function public.sync_guide_payment_to_shareholder_balance();

create or replace view public.shareholder_available_balances with (security_invoker = true) as
select s.id as shareholder_id, s.organization_id, s.name as shareholder_name,
  coalesce(sum(case when e.direction = 'credit' then e.amount else -e.amount end), 0)::numeric(14,2) as available_balance,
  coalesce(sum(case when e.entry_type = 'guide_payment' then e.amount else 0 end), 0)::numeric(14,2) as paid_guides,
  coalesce(sum(case when e.entry_type = 'withdrawal' then e.amount else 0 end), 0)::numeric(14,2) as withdrawals
from public.shareholders s
left join public.shareholder_balance_entries e on e.shareholder_id = s.id
group by s.id, s.organization_id, s.name;
