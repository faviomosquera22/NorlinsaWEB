-- Libro de Control de gastos: ingresos, egresos y saldo acumulado.
alter table public.expenses add column if not exists movement_type text not null default 'expense';
alter table public.expenses drop constraint if exists expenses_movement_type_check;
alter table public.expenses add constraint expenses_movement_type_check check (movement_type in ('income', 'expense'));

create or replace view public.company_expense_ledger with (security_invoker = true) as
select id, organization_id, expense_date, concept, expense_type, beneficiary, movement_type, amount,
  case when movement_type = 'income' then amount else 0 end::numeric(14,2) as income,
  case when movement_type = 'expense' then amount else 0 end::numeric(14,2) as expense,
  sum(case when movement_type = 'income' then amount else -amount end) over (partition by organization_id order by expense_date nulls last, created_at, id)::numeric(14,2) as running_balance
from public.expenses;
