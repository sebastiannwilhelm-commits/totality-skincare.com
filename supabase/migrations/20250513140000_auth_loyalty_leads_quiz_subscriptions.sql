-- Auth-linked customers, leads, loyalty, subscriptions, quiz, admin roles, checkout audit.
-- Run after 20250512120000_initial_storefront_schema.sql

-- ---------------------------------------------------------------------------
-- customers: Stripe id
-- ---------------------------------------------------------------------------

alter table public.customers
  add column if not exists stripe_customer_id text;

create index if not exists customers_stripe_customer_id_idx
  on public.customers (stripe_customer_id)
  where stripe_customer_id is not null;

-- ---------------------------------------------------------------------------
-- admin_roles — grant by insert: insert into admin_roles (user_id) values ('<auth uuid>');
-- ---------------------------------------------------------------------------

create table public.admin_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.admin_roles enable row level security;

create policy "admin_roles_self_read"
on public.admin_roles
for select
to authenticated
using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- leads — popup / footer / quiz captures (insert via service role from Next API)
-- ---------------------------------------------------------------------------

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  source text not null,
  email text not null,
  first_name text,
  last_name text,
  phone text,
  page_url text,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb
);

create index leads_created_at_idx on public.leads (created_at desc);
create index leads_source_idx on public.leads (source);
create index leads_email_idx on public.leads (lower(email));

alter table public.leads enable row level security;

create policy "leads_admin_select"
on public.leads
for select
to authenticated
using (exists (select 1 from public.admin_roles ar where ar.user_id = auth.uid()));

-- ---------------------------------------------------------------------------
-- loyalty
-- ---------------------------------------------------------------------------

create table public.loyalty_accounts (
  customer_id uuid primary key references public.customers (id) on delete cascade,
  points_balance integer not null default 0 check (points_balance >= 0),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.loyalty_ledger (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete cascade,
  delta integer not null,
  reason text not null,
  reference text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index loyalty_ledger_customer_id_idx on public.loyalty_ledger (customer_id, created_at desc);

alter table public.loyalty_accounts enable row level security;
alter table public.loyalty_ledger enable row level security;

create policy "loyalty_accounts_own"
on public.loyalty_accounts
for select
to authenticated
using (
  exists (select 1 from public.customers c where c.id = loyalty_accounts.customer_id and c.user_id = auth.uid())
);

create policy "loyalty_ledger_own"
on public.loyalty_ledger
for select
to authenticated
using (
  exists (select 1 from public.customers c where c.id = loyalty_ledger.customer_id and c.user_id = auth.uid())
);

-- ---------------------------------------------------------------------------
-- subscriptions (Stripe Billing mirror)
-- ---------------------------------------------------------------------------

create table public.customer_subscriptions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete cascade,
  stripe_subscription_id text not null unique,
  stripe_price_id text,
  status text not null,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index customer_subscriptions_customer_id_idx on public.customer_subscriptions (customer_id);

create trigger customer_subscriptions_set_updated_at
before update on public.customer_subscriptions
for each row execute function public.set_updated_at();

alter table public.customer_subscriptions enable row level security;

create policy "customer_subscriptions_own"
on public.customer_subscriptions
for select
to authenticated
using (
  exists (select 1 from public.customers c where c.id = customer_subscriptions.customer_id and c.user_id = auth.uid())
);

-- ---------------------------------------------------------------------------
-- quiz_sessions — native skin quiz
-- ---------------------------------------------------------------------------

create table public.quiz_sessions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  user_id uuid references auth.users (id) on delete set null,
  email text,
  answers jsonb not null default '{}'::jsonb,
  recommended_slugs text[] not null default array[]::text[],
  completed boolean not null default false
);

create index quiz_sessions_created_at_idx on public.quiz_sessions (created_at desc);

alter table public.quiz_sessions enable row level security;

create policy "quiz_sessions_own"
on public.quiz_sessions
for select
to authenticated
using (user_id = auth.uid());

create policy "quiz_sessions_admin_select"
on public.quiz_sessions
for select
to authenticated
using (exists (select 1 from public.admin_roles ar where ar.user_id = auth.uid()));

-- ---------------------------------------------------------------------------
-- checkout_sessions — Stripe Checkout audit + admin analytics
-- ---------------------------------------------------------------------------

create table public.checkout_sessions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  stripe_checkout_session_id text not null unique,
  customer_email text,
  customer_id uuid references public.customers (id) on delete set null,
  amount_total_cents bigint,
  currency text default 'usd',
  payment_status text,
  metadata jsonb not null default '{}'::jsonb
);

create index checkout_sessions_created_at_idx on public.checkout_sessions (created_at desc);

alter table public.checkout_sessions enable row level security;

create policy "checkout_sessions_admin_select"
on public.checkout_sessions
for select
to authenticated
using (exists (select 1 from public.admin_roles ar where ar.user_id = auth.uid()));

-- ---------------------------------------------------------------------------
-- analytics_daily — optional rollup (manual or cron later)
-- ---------------------------------------------------------------------------

create table public.analytics_daily (
  day date primary key,
  lead_count integer not null default 0,
  checkout_completed integer not null default 0,
  quiz_completed integer not null default 0,
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.analytics_daily enable row level security;

create policy "analytics_daily_admin"
on public.analytics_daily
for select
to authenticated
using (exists (select 1 from public.admin_roles ar where ar.user_id = auth.uid()));

-- ---------------------------------------------------------------------------
-- Auth: auto-create customer profile row
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  cid uuid;
  em text;
begin
  em := coalesce(nullif(new.email, ''), new.id::text || '@signup.totality-skincare.local');

  insert into public.customers (user_id, email, full_name)
  values (
    new.id,
    em,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(em, '@', 1))
  )
  on conflict (user_id) do update
    set email = excluded.email,
        full_name = coalesce(public.customers.full_name, excluded.full_name),
        updated_at = timezone('utc', now())
  returning id into cid;

  insert into public.loyalty_accounts (customer_id)
  values (cid)
  on conflict (customer_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

comment on function public.handle_new_user is 'Creates customers + loyalty_accounts row for new Supabase Auth signups.';
