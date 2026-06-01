/**
 * Fetches Shopify `collections/all/products.json` from the live Totality store
 * (or reads shopify-p*.json dumps in repo root) and writes `src/config/catalog-products.ts`.
 *
 * Usage:
 *   node scripts/generate-catalog.mjs           # fetch live (default)
 *   node scripts/generate-catalog.mjs --offline # use shopify-p*.json only
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const LIVE_PRODUCTS_URL =
  "https://totality-skincare.com/collections/all/products.json";

/** @typedef {{ handle: string; title: string; body_html?: string; vendor?: string; product_type?: string; tags?: string[]; variants: { position: number; price: string; available: boolean }[]; images: { src: string }[] }} ShopifyProduct */

const offline = process.argv.includes("--offline");

/** @returns {Promise<ShopifyProduct[]>} */
async function fetchLiveProducts() {
  const all = [];
  for (let page = 1; page <= 20; page++) {
    const url = `${LIVE_PRODUCTS_URL}?limit=250&page=${page}`;
    const res = await fetch(url, { headers: { "User-Agent": "totality-catalog-sync/1.0" } });
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
    const j = await res.json();
    const products = j.products || [];
    if (!products.length) break;
    all.push(...products);
    console.log(`Fetched page ${page}: ${products.length} products (${all.length} total)`);
    if (products.length < 250) break;
  }
  return all;
}

/** @returns {ShopifyProduct[]} */
function readLocalDumps() {
  const JSON_FILES = fs
    .readdirSync(root)
    .filter((f) => /^shopify-p\d+\.json$/i.test(f))
    .sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]));

  if (!JSON_FILES.length) {
    console.error("No shopify-p*.json files in repo root.");
    process.exit(1);
  }

  const all = [];
  for (const f of JSON_FILES) {
    const j = JSON.parse(fs.readFileSync(path.join(root, f), "utf8"));
    all.push(...j.products);
  }
  return all;
}

/** @param {string} v */
function slugify(v) {
  const s = (v || "brand")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s || "brand";
}

/** @param {ShopifyProduct} p */
function vendorBrandSlug(p) {
  const v = p.vendor?.trim() || "Unknown";
  const map = {
    GlyMed: "glymed-plus",
    Upneeq: "upneeq",
    Scientis: "scientis",
    Cyspera: "scientis",
  };
  if (map[v]) return map[v];
  return slugify(v);
}

/** @param {ShopifyProduct} p */
function vendorDisplayLabel(p) {
  const v = p.vendor?.trim() || "Unknown";
  if (v === "Cyspera") return "Scientis";
  if (v === "GlyMed") return "GlyMed Plus";
  if (v === "Upneeq") return "UPNEEQ";
  return v;
}

/** @param {string | undefined} html */
function normalizeProductHtml(html) {
  if (!html) return "";
  let h = html.trim();
  h = h.replace(/[\u200B-\u200D\uFEFF]/g, "");
  h = h.replace(/<div class="product_description">\s*<\/div>/gi, "");
  h = h.replace(/\s*data-mce-fragment="[^"]*"/gi, "");
  h = h.replace(/<span>\s*(?:&nbsp;|\u00a0)?\s*<\/span>/gi, " ");
  h = h.replace(
    /<h4([^>]*)>([^<]*)<\/h4>\s*((?:(?!<h[1-4])[\s\S])+?)(?=\s*<h[1-4]|\s*<div|\s*$)/gi,
    (_match, attrs, title, body) => {
      const text = body.trim();
      if (!text || text.startsWith("<")) {
        return `<h4${attrs}>${title}</h4>${body}`;
      }
      const parts = text.split(/[\u0007\u2022•]\s*/).map((s) => s.trim()).filter(Boolean);
      if (parts.length > 1) {
        return `<h4${attrs}>${title}</h4><ul class="list-column">${parts.map((item) => `<li>${item}</li>`).join("")}</ul>`;
      }
      return `<h4${attrs}>${title}</h4><p>${text}</p>`;
    },
  );
  h = h.replace(/>\s+</g, "><");
  return h;
}

/** @param {string | undefined} html */
function plainDescription(html) {
  if (!html) return "";
  const t = html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return t.length > 300 ? `${t.slice(0, 297)}…` : t;
}

/** @param {ShopifyProduct} p */
function inferConcerns(p) {
  const tags = Array.isArray(p.tags) ? p.tags : [];
  const blob = [...tags, p.product_type || ""].join(" ").toLowerCase();
  /** @type {Set<string>} */
  const out = new Set();
  if (/\bacne\b|blemish|breakout|clarif/.test(blob)) out.add("acne");
  if (/\boily\b|oil-control|sebum|shine/.test(blob)) out.add("oily");
  if (/sensitive|rosacea|redness|calm|soothe/.test(blob)) out.add("sensitive");
  if (/\bdry|hydrat|moist|barrier|lipid/.test(blob)) out.add("dryness");
  if (/aging|wrinkle|firm|elastic|retin|renew/.test(blob)) out.add("anti-aging");
  if (/bright|pigment|tone|melasma|sun damage|spot|hyperpig|lumin/.test(blob)) out.add("brightening");
  if (out.size === 0) {
    if (/hair|scalp|shampoo|conditioner|styling/.test(blob)) out.add("dryness");
    else out.add("dryness");
  }
  return [...out].slice(0, 5);
}

/** @param {ShopifyProduct} p */
function isRx(p) {
  const t = (p.title || "").toLowerCase();
  const h = (p.handle || "").toLowerCase();
  if (/tretinoin|latisse|upneeq/.test(t + h)) return true;
  if (/nu-derm clear rx|nu-derm blender rx|sunfader rx|trial kit norm-.*rx/.test(t)) return true;
  if (/obagi c rx|obagi-c rx|c-rx-clarifying|obagi-c-rc-/.test(t + h)) return true;
  if (/obagi-c rx system|obagi42/.test(h)) return true;
  if (/therapy night cream/.test(t) && /obagi-c rx|obagi-c/.test(t)) return true;
  return false;
}

/** @param {ShopifyProduct} p */
function firstImage(p) {
  const src = p.images?.[0]?.src;
  if (src) return src;
  return "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=720&q=80&sig=placeholder";
}

/** @param {ShopifyProduct[]} products */
function filterSellable(products) {
  return products.filter((p) => {
    if (p.vendor === "Monster-ShipProtect") return false;
    if (/shipping protection/i.test(p.title)) return false;
    return true;
  });
}

let raw;
if (offline) {
  console.log("Reading local shopify-p*.json dumps…");
  raw = readLocalDumps();
} else {
  console.log(`Fetching live catalog from ${LIVE_PRODUCTS_URL}…`);
  try {
    raw = await fetchLiveProducts();
  } catch (err) {
    console.error("Live fetch failed:", err.message);
    console.error("Retry with --offline if you have shopify-p*.json dumps.");
    process.exit(1);
  }
}

const filtered = filterSellable(raw);
console.log(`Source: ${raw.length} products → ${filtered.length} sellable (excluded ${raw.length - filtered.length} non-products)`);

/** @type {Map<string, { slug: string; label: string }>} */
const brandBySlug = new Map();
for (const p of filtered) {
  const slug = vendorBrandSlug(p);
  const label = vendorDisplayLabel(p);
  if (!brandBySlug.has(slug)) brandBySlug.set(slug, { slug, label });
}

const BRANDS = [...brandBySlug.values()].sort((a, b) => a.label.localeCompare(b.label, "en"));

const lines = [];
lines.push(`import type { ConcernSlug, StoreProduct } from "@/lib/types";`);
lines.push("");
lines.push(`/** Auto-generated by scripts/generate-catalog.mjs — do not edit by hand. */`);
lines.push(`export const CATALOG_BRANDS: { slug: string; label: string }[] = ${JSON.stringify(BRANDS, null, 2)};`);
lines.push("");
lines.push(`export const CATALOG_PRODUCTS: StoreProduct[] = [`);

for (const p of filtered) {
  const variants = [...p.variants].sort((a, b) => a.position - b.position);
  const v0 = variants[0];
  const price = Number.parseFloat(String(v0.price).replace(/,/g, ""));
  const cents = Number.isFinite(price) ? Math.round(price * 100) : 0;
  const desc =
    plainDescription(p.body_html) ||
    `${p.product_type || "Skincare product"} — ${vendorDisplayLabel(p)}.`.slice(0, 300);
  const anyAvail = variants.some((x) => x.available);
  const comingSoon = !anyAvail;
  const rx = isRx(p);
  const brand = vendorBrandSlug(p);
  const concerns = inferConcerns(p);
  const img = firstImage(p);

  const parts = [
    `    slug: ${JSON.stringify(p.handle)}`,
    `    name: ${JSON.stringify(p.title)}`,
    `    description: ${JSON.stringify(desc)}`,
    `    priceCents: ${cents}`,
    `    currency: "usd"`,
    `    brand: ${JSON.stringify(brand)}`,
    `    concerns: ${JSON.stringify(concerns)} as ConcernSlug[]`,
    `    imageSrc: ${JSON.stringify(img)}`,
    `    isPrescriptionRequired: ${rx}`,
  ];
  if (comingSoon) parts.push(`    comingSoon: true`);
  lines.push(`  {\n${parts.join(",\n")},\n  },`);
}

lines.push(`];`);
lines.push("");

const outPath = path.join(root, "src", "config", "catalog-products.ts");
fs.writeFileSync(outPath, lines.join("\n"), "utf8");
console.log(`Wrote ${outPath} (${filtered.length} products, ${BRANDS.length} brands)`);

/** Full Shopify body_html for PDP — same content as totality-skincare.com “More Details” blocks. */
const descriptions = {};
for (const p of filtered) {
  descriptions[p.handle] = normalizeProductHtml(p.body_html || "");
}
const descPath = path.join(root, "src", "data", "catalog-descriptions.json");
fs.mkdirSync(path.dirname(descPath), { recursive: true });
fs.writeFileSync(descPath, JSON.stringify(descriptions), "utf8");
console.log(`Wrote ${descPath} (${Object.keys(descriptions).length} HTML descriptions)`);
