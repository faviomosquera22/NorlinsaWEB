-- Servicios logísticos y reserva automática del saldo de cada accionista.
-- Requiere ejecutar primero 20260621_shareholder_balances.sql.
create table public.logistics_services (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  service_date date not null,
  service_number text,
  description text not null,
  provider_name text not null,
  shareholder_id uuid references public.shareholders(id) on delete set null,
  invoice_number text,
  original_cost numeric(14,2) not null check (original_cost >= 0),
  profitability_rate numeric(6,4) not null check (profitability_rate between 0 and 1),
  advance numeric(14,2) not null default 0 check (advance >= 0),
  transfer_fee numeric(14,2) not null default 0.41 check (transfer_fee >= 0),
  profitability numeric(14,2) generated always as (round(original_cost * profitability_rate, 2)) stored,
  provider_payment numeric(14,2) generated always as (round(original_cost - (original_cost * profitability_rate) - advance, 2)) stored,
  transferred_amount numeric(14,2) generated always as (round(original_cost - (original_cost * profitability_rate) - advance - transfer_fee, 2)) stored,
  status text not null default 'Pendiente' check (status in ('Pendiente', 'Facturada', 'Pagada')),
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index logistics_services_organization_date_idx on public.logistics_services (organization_id, service_date desc);
create trigger logistics_services_set_updated_at before update on public.logistics_services for each row execute function public.set_updated_at();
create trigger logistics_services_audit after insert or update or delete on public.logistics_services for each row execute function public.write_audit_log();

alter table public.logistics_services enable row level security;
create policy "members read logistics services" on public.logistics_services for select using (public.is_org_member(organization_id));
create policy "members write logistics services" on public.logistics_services for insert with check (public.is_org_member(organization_id));
create policy "members update logistics services" on public.logistics_services for update using (public.is_org_member(organization_id));
create policy "members delete logistics services" on public.logistics_services for delete using (public.is_org_member(organization_id));

alter table public.shareholder_balance_entries add column if not exists logistics_service_id uuid references public.logistics_services(id) on delete cascade;
create unique index if not exists shareholder_balance_entries_logistics_service_unique on public.shareholder_balance_entries (logistics_service_id) where logistics_service_id is not null;
alter table public.shareholder_balance_entries drop constraint if exists shareholder_balance_entries_entry_type_check;
alter table public.shareholder_balance_entries add constraint shareholder_balance_entries_entry_type_check check (entry_type in ('opening_balance', 'adjustment_credit', 'adjustment_debit', 'withdrawal', 'guide_payment', 'guide_reserve', 'logistics_service'));

-- Al registrar una guía se reserva el pago al chofer, aun cuando esté pendiente.
create or replace function public.sync_guide_payment_to_shareholder_balance()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'DELETE' then
    delete from public.shareholder_balance_entries where guide_id = old.id;
    return old;
  end if;
  if new.shareholder_id is not null then
    insert into public.shareholder_balance_entries (organization_id, shareholder_id, movement_date, entry_type, direction, amount, description, guide_id, created_by)
    values (new.organization_id, new.shareholder_id, new.purchase_date, 'guide_reserve', 'debit', new.driver_payment, concat('Guía registrada ', coalesce(new.guide_number, new.id::text)), new.id, auth.uid())
    on conflict (guide_id) do update set shareholder_id = excluded.shareholder_id, movement_date = excluded.movement_date, entry_type = excluded.entry_type, amount = excluded.amount, description = excluded.description;
  else
    delete from public.shareholder_balance_entries where guide_id = new.id;
  end if;
  return new;
end;
$$;

-- Al registrar un servicio logístico se reserva el pago al proveedor.
create or replace function public.sync_logistics_service_to_shareholder_balance()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'DELETE' then
    delete from public.shareholder_balance_entries where logistics_service_id = old.id;
    return old;
  end if;
  if new.shareholder_id is not null then
    insert into public.shareholder_balance_entries (organization_id, shareholder_id, movement_date, entry_type, direction, amount, description, logistics_service_id, created_by)
    values (new.organization_id, new.shareholder_id, new.service_date, 'logistics_service', 'debit', new.provider_payment, concat('Servicio logístico ', coalesce(new.service_number, new.id::text)), new.id, auth.uid())
    on conflict (logistics_service_id) where logistics_service_id is not null do update set shareholder_id = excluded.shareholder_id, movement_date = excluded.movement_date, amount = excluded.amount, description = excluded.description;
  else
    delete from public.shareholder_balance_entries where logistics_service_id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists guides_sync_shareholder_balance on public.guides;
create trigger guides_sync_shareholder_balance after insert or update of status, driver_payment, shareholder_id, purchase_date on public.guides for each row execute function public.sync_guide_payment_to_shareholder_balance();
drop trigger if exists logistics_services_sync_shareholder_balance on public.logistics_services;
create trigger logistics_services_sync_shareholder_balance after insert or update of provider_payment, shareholder_id, service_date on public.logistics_services for each row execute function public.sync_logistics_service_to_shareholder_balance();
create trigger logistics_services_delete_sync_shareholder_balance after delete on public.logistics_services for each row execute function public.sync_logistics_service_to_shareholder_balance();

-- Reserva retroactiva para las guías ya registradas, sin duplicarlas.
insert into public.shareholder_balance_entries (organization_id, shareholder_id, movement_date, entry_type, direction, amount, description, guide_id)
select g.organization_id, g.shareholder_id, g.purchase_date, 'guide_reserve', 'debit', g.driver_payment, concat('Guía registrada ', coalesce(g.guide_number, g.id::text)), g.id
from public.guides g where g.shareholder_id is not null
on conflict (guide_id) do update set shareholder_id = excluded.shareholder_id, movement_date = excluded.movement_date, entry_type = excluded.entry_type, amount = excluded.amount, description = excluded.description;

create or replace view public.shareholder_available_balances with (security_invoker = true) as
select s.id as shareholder_id, s.organization_id, s.name as shareholder_name,
  coalesce(sum(case when e.direction = 'credit' then e.amount else -e.amount end), 0)::numeric(14,2) as available_balance,
  coalesce(sum(case when e.entry_type in ('guide_payment', 'guide_reserve') then e.amount else 0 end), 0)::numeric(14,2) as paid_guides,
  coalesce(sum(case when e.entry_type = 'logistics_service' then e.amount else 0 end), 0)::numeric(14,2) as logistics_services,
  coalesce(sum(case when e.entry_type = 'withdrawal' then e.amount else 0 end), 0)::numeric(14,2) as withdrawals
from public.shareholders s left join public.shareholder_balance_entries e on e.shareholder_id = s.id
group by s.id, s.organization_id, s.name;
