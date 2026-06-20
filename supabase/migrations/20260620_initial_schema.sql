-- NORLINSA: modelo operativo-financiero. Ejecutar en Supabase SQL Editor o con `supabase db push`.
create extension if not exists pgcrypto;

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'operator' check (role in ('owner', 'operator')),
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table public.shareholders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (organization_id, name)
);

create table public.drivers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  vehicle_identifier text,
  created_at timestamptz not null default now(),
  unique (organization_id, name)
);

create table public.guides (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  purchase_date date not null,
  week_of_year integer generated always as (extract(week from purchase_date)::integer) stored,
  guide_number text,
  vehicle_identifier text,
  driver_id uuid references public.drivers(id) on delete set null,
  shareholder_id uuid references public.shareholders(id) on delete set null,
  invoice_number text,
  original_cost numeric(14,2) not null check (original_cost >= 0),
  profitability_rate numeric(6,4) not null check (profitability_rate between 0 and 1),
  advance numeric(14,2) not null default 0 check (advance >= 0),
  transfer_fee numeric(14,2) not null default 0.41 check (transfer_fee >= 0),
  profitability numeric(14,2) generated always as (round(original_cost * profitability_rate, 2)) stored,
  driver_payment numeric(14,2) generated always as (round(original_cost - (original_cost * profitability_rate) - advance, 2)) stored,
  transferred_amount numeric(14,2) generated always as (round(original_cost - (original_cost * profitability_rate) - advance - transfer_fee, 2)) stored,
  status text not null default 'Pendiente' check (status in ('Pendiente', 'Facturada', 'Pagada')),
  physical_status text,
  notes text,
  source_sheet text,
  source_row integer,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique nulls not distinct (organization_id, source_sheet, source_row)
);

create table public.tax_expenses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  issue_date date,
  authorization_date timestamptz,
  supplier_ruc text,
  supplier_name text not null,
  receipt_type text,
  receipt_number text,
  access_key text,
  recipient_identification text,
  subtotal numeric(14,2) not null default 0 check (subtotal >= 0),
  vat numeric(14,2) not null default 0 check (vat >= 0),
  total numeric(14,2) not null default 0 check (total >= 0),
  assigned_to text,
  source_sheet text,
  source_row integer,
  created_at timestamptz not null default now(),
  unique nulls not distinct (organization_id, source_sheet, source_row)
);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  expense_date date,
  concept text not null,
  expense_type text,
  beneficiary text,
  amount numeric(14,2) not null check (amount >= 0),
  source_sheet text,
  source_row integer,
  created_at timestamptz not null default now(),
  unique nulls not distinct (organization_id, source_sheet, source_row)
);

create table public.capital_movements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  movement_date date not null,
  shareholder_id uuid references public.shareholders(id) on delete set null,
  movement_type text not null check (movement_type in ('investment', 'payment', 'adjustment')),
  amount numeric(14,2) not null,
  description text,
  source_sheet text,
  source_row integer,
  created_at timestamptz not null default now()
);

create table public.audit_log (
  id bigint generated always as identity primary key,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  entity_type text not null,
  entity_id uuid,
  action text not null check (action in ('INSERT', 'UPDATE', 'DELETE')),
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default now()
);

create index guides_organization_date_idx on public.guides (organization_id, purchase_date desc);
create index tax_expenses_organization_date_idx on public.tax_expenses (organization_id, issue_date desc);
create index expenses_organization_date_idx on public.expenses (organization_id, expense_date desc);

create or replace function public.is_org_member(target_organization uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.organization_members where organization_id = target_organization and user_id = auth.uid());
$$;

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger guides_set_updated_at before update on public.guides for each row execute function public.set_updated_at();

create or replace function public.write_audit_log()
returns trigger language plpgsql security definer set search_path = public as $$
declare org_id uuid;
begin
  org_id := coalesce(new.organization_id, old.organization_id);
  insert into public.audit_log (organization_id, user_id, entity_type, entity_id, action, old_data, new_data)
  values (org_id, auth.uid(), tg_table_name, coalesce(new.id, old.id), tg_op, case when tg_op = 'INSERT' then null else to_jsonb(old) end, case when tg_op = 'DELETE' then null else to_jsonb(new) end);
  return coalesce(new, old);
end;
$$;
create trigger guides_audit after insert or update or delete on public.guides for each row execute function public.write_audit_log();
create trigger expenses_audit after insert or update or delete on public.expenses for each row execute function public.write_audit_log();
create trigger tax_expenses_audit after insert or update or delete on public.tax_expenses for each row execute function public.write_audit_log();

alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.shareholders enable row level security;
alter table public.drivers enable row level security;
alter table public.guides enable row level security;
alter table public.tax_expenses enable row level security;
alter table public.expenses enable row level security;
alter table public.capital_movements enable row level security;
alter table public.audit_log enable row level security;

create policy "members read organization" on public.organizations for select using (public.is_org_member(id));
create policy "members read memberships" on public.organization_members for select using (public.is_org_member(organization_id));
create policy "members manage memberships" on public.organization_members for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));

create policy "members read shareholders" on public.shareholders for select using (public.is_org_member(organization_id));
create policy "members write shareholders" on public.shareholders for insert with check (public.is_org_member(organization_id));
create policy "members update shareholders" on public.shareholders for update using (public.is_org_member(organization_id));
create policy "members read drivers" on public.drivers for select using (public.is_org_member(organization_id));
create policy "members write drivers" on public.drivers for insert with check (public.is_org_member(organization_id));
create policy "members update drivers" on public.drivers for update using (public.is_org_member(organization_id));

create policy "members read guides" on public.guides for select using (public.is_org_member(organization_id));
create policy "members write guides" on public.guides for insert with check (public.is_org_member(organization_id));
create policy "members update guides" on public.guides for update using (public.is_org_member(organization_id));
create policy "members delete guides" on public.guides for delete using (public.is_org_member(organization_id));
create policy "members read tax expenses" on public.tax_expenses for select using (public.is_org_member(organization_id));
create policy "members write tax expenses" on public.tax_expenses for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "members read expenses" on public.expenses for select using (public.is_org_member(organization_id));
create policy "members write expenses" on public.expenses for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "members read capital movements" on public.capital_movements for select using (public.is_org_member(organization_id));
create policy "members write capital movements" on public.capital_movements for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "members read audit log" on public.audit_log for select using (public.is_org_member(organization_id));

create or replace view public.monthly_financial_summary with (security_invoker = true) as
with guide_months as (
  select organization_id, date_trunc('month', purchase_date)::date as month_start,
    sum(original_cost) as billed, sum(profitability) as profitability, sum(driver_payment) as driver_payments
  from public.guides group by organization_id, date_trunc('month', purchase_date)::date
), expense_months as (
  select organization_id, date_trunc('month', issue_date)::date as month_start, sum(total) as tax_expenses
  from public.tax_expenses where issue_date is not null group by organization_id, date_trunc('month', issue_date)::date
)
select coalesce(g.organization_id, e.organization_id) as organization_id, coalesce(g.month_start, e.month_start) as month_start,
  coalesce(g.billed, 0)::numeric(14,2) as billed, coalesce(g.profitability, 0)::numeric(14,2) as profitability,
  coalesce(g.driver_payments, 0)::numeric(14,2) as driver_payments, coalesce(e.tax_expenses, 0)::numeric(14,2) as tax_expenses
from guide_months g full outer join expense_months e on e.organization_id = g.organization_id and e.month_start = g.month_start;
