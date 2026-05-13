-- Palmetto Developments Storefront — initial schema
-- Products, customers, orders, line items, prescriptions (Nicole workflow), shipping hooks.

-- ---------------------------------------------------------------------------
-- Enumerations
-- ---------------------------------------------------------------------------

create type public.order_status as enum (
  'draft',
  'pending_payment',
  'paid',
  'pending_approval',
  'authorized',
  'shipped',
  'cancelled',
  'refunded'
);

comment on type public.order_status is
  'paid: funds captured or authorized per Stripe policy; pending_approval: post-checkout Rx queue for Nicole; authorized: Nicole signed and order may fulfill.';

-- ---------------------------------------------------------------------------
-- Utility: updated_at
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- customers
-- id, email, sms_number; "order_history" is modeled as orders.customer_id (no duplicated column)
-- ---------------------------------------------------------------------------

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users (id) on delete set null,
  email text not null,
  sms_number text,
  full_name text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index customers_email_idx on public.customers (lower(email));
create index customers_user_id_idx on public.customers (user_id);

create trigger customers_set_updated_at
before update on public.customers
for each row execute function public.set_updated_at();

comment on table public.customers is 'Shopper identity; link user_id when logged in via Supabase Auth.';

-- ---------------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------------

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price_cents bigint not null check (price_cents >= 0),
  currency text not null default 'usd',
  inventory_count integer not null default 0 check (inventory_count >= 0),
  is_prescription_required boolean not null default false,
  slug text not null unique,
  sku text unique,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index products_active_idx on public.products (is_active) where is_active = true;

create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

comment on column public.products.price_cents is 'Stripe-compatible integer minor units (e.g. USD cents).';

-- ---------------------------------------------------------------------------
-- orders
-- ---------------------------------------------------------------------------

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete restrict,
  status public.order_status not null default 'draft',
  total_cents bigint not null default 0 check (total_cents >= 0),
  currency text not null default 'usd',
  shipping_label_url text,
  tracking_number text,
  shipping_carrier text,
  requires_prescription_review boolean not null default false,
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  shippo_rate_id text,
  shippo_transaction_id text,
  shipping_address jsonb,
  billing_address jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index orders_customer_id_idx on public.orders (customer_id);
create index orders_status_idx on public.orders (status);
create index orders_created_at_idx on public.orders (created_at desc);

create trigger orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

comment on column public.orders.requires_prescription_review is
  'True when cart contained Rx product; checkout should set status to pending_approval after successful payment.';
comment on column public.orders.shipping_label_url is 'URL to label PDF (e.g. Shippo label_url or Supabase Storage).';

-- ---------------------------------------------------------------------------
-- order_items (normalized line items)
-- ---------------------------------------------------------------------------

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete restrict,
  quantity integer not null check (quantity > 0),
  unit_price_cents bigint not null check (unit_price_cents >= 0),
  created_at timestamptz not null default timezone('utc', now())
);

create index order_items_order_id_idx on public.order_items (order_id);
create index order_items_product_id_idx on public.order_items (product_id);

-- ---------------------------------------------------------------------------
-- prescriptions (one row per order that undergoes Rx review)
-- ---------------------------------------------------------------------------

create table public.prescriptions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders (id) on delete cascade,
  form_data jsonb not null default '{}'::jsonb,
  authorized_by_nicole boolean not null default false,
  signature_image_url text,
  nicole_signed_at timestamptz,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint prescriptions_signature_when_authorized check (
    (authorized_by_nicole = false)
    or (signature_image_url is not null and nicole_signed_at is not null)
  )
);

create trigger prescriptions_set_updated_at
before update on public.prescriptions
for each row execute function public.set_updated_at();

comment on table public.prescriptions is 'Medical intake + Nicole digital signature; pairs with orders.requires_prescription_review.';

-- ---------------------------------------------------------------------------
-- Row Level Security
-- Server routes / Edge Functions should use the service role for admin paths.
-- ---------------------------------------------------------------------------

alter table public.customers enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.prescriptions enable row level security;

-- Catalog: active products readable by anyone with anon or authenticated key
create policy "products_select_active"
on public.products
for select
to anon, authenticated
using (is_active = true);

-- Customers: users can read/update their own profile row
create policy "customers_select_own"
on public.customers
for select
to authenticated
using (user_id = auth.uid());

create policy "customers_update_own"
on public.customers
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Orders: customers see only their orders (via linked customer.user_id)
create policy "orders_select_own"
on public.orders
for select
to authenticated
using (
  exists (
    select 1 from public.customers c
    where c.id = orders.customer_id and c.user_id = auth.uid()
  )
);

create policy "order_items_select_own"
on public.order_items
for select
to authenticated
using (
  exists (
    select 1
    from public.orders o
    join public.customers c on c.id = o.customer_id
    where o.id = order_items.order_id and c.user_id = auth.uid()
  )
);

create policy "prescriptions_select_own"
on public.prescriptions
for select
to authenticated
using (
  exists (
    select 1
    from public.orders o
    join public.customers c on c.id = o.customer_id
    where o.id = prescriptions.order_id and c.user_id = auth.uid()
  )
);

-- Inserts/updates for checkout and admin: handled with service role or add stricter policies later

-- ---------------------------------------------------------------------------
-- customer_order_history (view — replaces a redundant "order_history" column)
-- ---------------------------------------------------------------------------

create or replace view public.customer_order_history as
select
  c.id as customer_id,
  c.email,
  c.full_name,
  o.id as order_id,
  o.status,
  o.total_cents,
  o.currency,
  o.requires_prescription_review,
  o.created_at as ordered_at
from public.customers c
join public.orders o on o.customer_id = c.id;

comment on view public.customer_order_history is
  'Derived order list per customer; query from service role or SQL editor — clients should use orders with RLS.';
