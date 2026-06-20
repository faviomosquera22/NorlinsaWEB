-- Facturación manual y distribución de ingresos/ganancia por socio.
create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  invoice_number text not null,
  issue_date date not null,
  total_amount numeric(14,2) not null check (total_amount > 0),
  owner_shareholder_id uuid references public.shareholders(id) on delete set null,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, invoice_number)
);

create table public.invoice_allocations (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  shareholder_id uuid not null references public.shareholders(id) on delete restrict,
  allocated_amount numeric(14,2) not null check (allocated_amount >= 0),
  created_at timestamptz not null default now(),
  unique (invoice_id, shareholder_id)
);

create index invoices_organization_date_idx on public.invoices (organization_id, issue_date desc);
create index invoice_allocations_invoice_idx on public.invoice_allocations (invoice_id);
create trigger invoices_set_updated_at before update on public.invoices for each row execute function public.set_updated_at();
create trigger invoices_audit after insert or update or delete on public.invoices for each row execute function public.write_audit_log();

alter table public.invoices enable row level security;
alter table public.invoice_allocations enable row level security;
create policy "members read invoices" on public.invoices for select using (public.is_org_member(organization_id));
create policy "members write invoices" on public.invoices for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "members read allocations" on public.invoice_allocations for select using (exists (select 1 from public.invoices i where i.id = invoice_id and public.is_org_member(i.organization_id)));
create policy "members write allocations" on public.invoice_allocations for all using (exists (select 1 from public.invoices i where i.id = invoice_id and public.is_org_member(i.organization_id))) with check (exists (select 1 from public.invoices i where i.id = invoice_id and public.is_org_member(i.organization_id)));

create or replace function public.create_invoice_with_allocations(
  p_organization_id uuid,
  p_invoice_number text,
  p_issue_date date,
  p_total_amount numeric,
  p_owner_shareholder_id uuid,
  p_allocations jsonb,
  p_notes text default null
) returns uuid language plpgsql security definer set search_path = public as $$
declare invoice_id uuid;
declare allocated_total numeric(14,2);
begin
  if not public.is_org_member(p_organization_id) then raise exception 'No tiene acceso a esta organización'; end if;
  if p_total_amount <= 0 then raise exception 'El total de la factura debe ser mayor a cero'; end if;
  select round(coalesce(sum((item->>'amount')::numeric), 0), 2) into allocated_total from jsonb_array_elements(p_allocations) as item;
  if allocated_total <> round(p_total_amount, 2) then raise exception 'La distribución entre socios debe sumar exactamente el total de la factura'; end if;
  if exists (select 1 from jsonb_array_elements(p_allocations) as item where (item->>'amount')::numeric < 0) then raise exception 'La distribución no puede tener valores negativos'; end if;
  if exists (select 1 from jsonb_array_elements(p_allocations) as item left join public.shareholders s on s.id = (item->>'shareholder_id')::uuid where s.organization_id <> p_organization_id or s.id is null) then raise exception 'Uno de los socios no pertenece a la organización'; end if;
  insert into public.invoices (organization_id, invoice_number, issue_date, total_amount, owner_shareholder_id, notes, created_by)
  values (p_organization_id, trim(p_invoice_number), p_issue_date, round(p_total_amount, 2), p_owner_shareholder_id, nullif(trim(p_notes), ''), auth.uid()) returning id into invoice_id;
  insert into public.invoice_allocations (invoice_id, shareholder_id, allocated_amount)
  select invoice_id, (item->>'shareholder_id')::uuid, round((item->>'amount')::numeric, 2) from jsonb_array_elements(p_allocations) as item;
  return invoice_id;
end;
$$;

create or replace view public.invoice_shareholder_profit_summary with (security_invoker = true) as
select i.id as invoice_id, i.organization_id, i.invoice_number, i.issue_date, i.total_amount, i.owner_shareholder_id,
  a.shareholder_id, s.name as shareholder_name, a.allocated_amount,
  coalesce((select sum(g.profitability) from public.guides g where g.organization_id = i.organization_id and g.invoice_number = i.invoice_number and g.shareholder_id = a.shareholder_id), 0)::numeric(14,2) as guide_profitability
from public.invoices i
join public.invoice_allocations a on a.invoice_id = i.id
join public.shareholders s on s.id = a.shareholder_id;
