-- Admin read policies for operational dashboards

create policy "orders_admin_select"
on public.orders
for select
to authenticated
using (exists (select 1 from public.admin_roles ar where ar.user_id = auth.uid()));

create policy "order_items_admin_select"
on public.order_items
for select
to authenticated
using (exists (select 1 from public.admin_roles ar where ar.user_id = auth.uid()));

create policy "customers_admin_select"
on public.customers
for select
to authenticated
using (exists (select 1 from public.admin_roles ar where ar.user_id = auth.uid()));

create policy "loyalty_ledger_admin_select"
on public.loyalty_ledger
for select
to authenticated
using (exists (select 1 from public.admin_roles ar where ar.user_id = auth.uid()));

create policy "loyalty_accounts_admin_select"
on public.loyalty_accounts
for select
to authenticated
using (exists (select 1 from public.admin_roles ar where ar.user_id = auth.uid()));

create policy "customer_subscriptions_admin_select"
on public.customer_subscriptions
for select
to authenticated
using (exists (select 1 from public.admin_roles ar where ar.user_id = auth.uid()));

create policy "prescriptions_admin_select"
on public.prescriptions
for select
to authenticated
using (exists (select 1 from public.admin_roles ar where ar.user_id = auth.uid()));
