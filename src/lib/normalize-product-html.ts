/**
 * Cleans Shopify body_html so it renders like totality-skincare.com PDP copy.
 */
export function normalizeProductHtml(html: string): string {
  let h = html.trim();
  if (!h) return h;

  h = h.replace(/[\u200B-\u200D\uFEFF]/g, "");
  h = h.replace(/<div class="product_description">\s*<\/div>/gi, "");
  h = h.replace(/\s*data-mce-fragment="[^"]*"/gi, "");
  h = h.replace(/<span>\s*(?:&nbsp;|\u00a0)?\s*<\/span>/gi, " ");

  // h4 followed by plain text (no wrapper) → paragraph or bullet list
  h = h.replace(
    /<h4([^>]*)>([^<]*)<\/h4>\s*((?:(?!<h[1-4])[\s\S])+?)(?=\s*<h[1-4]|\s*<div|\s*$)/gi,
    (_match, attrs: string, title: string, body: string) => {
      const text = body.trim();
      if (!text || text.startsWith("<")) {
        return `<h4${attrs}>${title}</h4>${body}`;
      }
      const bulletSplit = text.split(/[\u0007\u2022•]\s*/).map((s) => s.trim()).filter(Boolean);
      if (bulletSplit.length > 1) {
        const items = bulletSplit.map((item) => `<li>${item}</li>`).join("");
        return `<h4${attrs}>${title}</h4><ul class="list-column">${items}</ul>`;
      }
      return `<h4${attrs}>${title}</h4><p>${text}</p>`;
    },
  );

  // Collapse excessive whitespace between tags
  h = h.replace(/>\s+</g, "><");

  return h;
}
