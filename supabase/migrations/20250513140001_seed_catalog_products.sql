-- Seed storefront products (matches app catalog slugs) for Stripe webhooks + order_items FK.

insert into public.products (
  id, name, description, price_cents, currency, inventory_count,
  is_prescription_required, slug, is_active
) values
  ('a1111111-1111-4111-8111-111111111101'::uuid, 'UPNEEQ 45 Day Supply',
   'Prescription-strength eye drops — fulfillment subject to medical review when required.',
   22000, 'usd', 99, true, 'upneeq-eyedrops-45-vials', true),
  ('a1111111-1111-4111-8111-111111111102'::uuid, 'Scientis Cyspera Cysteamine Intensive Pigment Corrector',
   'Intensive pigment-correcting care for stubborn discoloration.',
   17500, 'usd', 99, false, 'scientis-cyspera-cysteamine-intensive-pigment-corrector', true),
  ('a1111111-1111-4111-8111-111111111103'::uuid, 'Obagi Nu-Derm Clear RX 2.0oz',
   'Rx clarifying formula — prescription verification applies.',
   13500, 'usd', 99, true, 'obagi-clear', true),
  ('a1111111-1111-4111-8111-111111111104'::uuid, 'Kenra Thermal Styling Spray 19',
   'Thermal protection for heat styling.',
   2000, 'usd', 99, false, 'kenra-thermal-styling-spray-19', true),
  ('a1111111-1111-4111-8111-111111111105'::uuid, 'GlyMed Plus Skin Mist',
   'Refreshing facial mist for hydration on the go.',
   8400, 'usd', 99, false, 'glymed-plus-skin-mist-1', true),
  ('a1111111-1111-4111-8111-111111111106'::uuid, 'Obagi C RX Clarifying Serum Normal to Dry',
   'Vitamin C clarifying serum — Rx where applicable.',
   15500, 'usd', 99, true, 'obagi-c-rc-norm-dry', true),
  ('a1111111-1111-4111-8111-111111111107'::uuid, 'Obagi Tretinoin 0.1% Cream 0.7 oz',
   'Prescription retinoid — Nicole approval workflow required.',
   10500, 'usd', 99, true, 'obagitretinoin0-1', true),
  ('a1111111-1111-4111-8111-111111111108'::uuid, 'UPNEEQ 10 Day Supply',
   'Shorter supply option — prescription rules apply.',
   6500, 'usd', 99, true, 'upneeq-sample-box-10-vials-1', true),
  ('a1111111-1111-4111-8111-111111111109'::uuid, 'Moira Lip Appeal Waterproof Liner',
   'Waterproof liner — multiple shade options in-store.',
   600, 'usd', 0, false, 'moira-lip-appeal-waterproof-liner', true)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  price_cents = excluded.price_cents,
  inventory_count = excluded.inventory_count,
  is_prescription_required = excluded.is_prescription_required,
  is_active = excluded.is_active,
  updated_at = timezone('utc', now());

-- Subscription “membership” placeholder product for Stripe Checkout mode=subscription
insert into public.products (
  id, name, description, price_cents, currency, inventory_count,
  is_prescription_required, slug, is_active
) values
  ('a1111111-1111-4111-8111-1111111111aa'::uuid, 'Totality Skincare Club — monthly',
   'Subscribe & save: monthly curated drops + member pricing (configure Stripe price id in env).',
   2900, 'usd', 999999, false, 'totality-skincare-club-monthly', true)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  price_cents = excluded.price_cents,
  updated_at = timezone('utc', now());
