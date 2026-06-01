/**
 * Spot-check catalog HTML patterns for PDP description rendering.
 * Run: node scripts/audit-description-patterns.mjs
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const descriptions = JSON.parse(
  readFileSync(join(root, "src/data/catalog-descriptions.json"), "utf8"),
);

const fixed = [
  "obagi-tret-05-cream",
  "amika-top-gloss-shine-spray",
  "alastin-a-luminate-brightening-serum",
  "scientis-cyspera-cysteamine-intensive-pigment-corrector",
];

const slugs = Object.keys(descriptions);
const random = slugs
  .sort(() => Math.random() - 0.5)
  .slice(0, 8);

const check = [...new Set([...fixed, ...random])];

const patterns = [
  { name: "product_description-title", re: /product_description-title/ },
  { name: "h4 sections", re: /<h4[\s>]/i },
  { name: "h1 legal", re: /<h1[\s>]/i },
  { name: "list-column", re: /list-column/ },
  { name: "column layout", re: /class="[^"]*column/ },
  { name: "data-rte-list", re: /data-rte-list/ },
  { name: "tab_content", re: /tab_content/ },
  { name: "inline images", re: /<img[\s>]/i },
];

let ok = 0;
for (const slug of check) {
  const html = descriptions[slug];
  if (!html) {
    console.log(`MISSING\t${slug}`);
    continue;
  }
  const hits = patterns.filter((p) => p.re.test(html)).map((p) => p.name);
  console.log(`OK\t${slug}\tlen=${html.length}\t${hits.join(", ") || "(plain)"}`);
  ok++;
}

console.log(`\nChecked ${ok}/${check.length} slugs (${slugs.length} total in catalog).`);
