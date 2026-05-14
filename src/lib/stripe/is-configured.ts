/** True when server routes can call Stripe (secret key present and non-empty after trim). */
export function isStripeSecretConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}
