export function getStripeSecretKey() {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    return {
      ok: false as const,
      error: "Stripe configuration missing",
      status: 500,
    };
  }

  if (process.env.VERCEL_ENV === "production" && !stripeSecretKey.startsWith("sk_live_")) {
    return {
      ok: false as const,
      error: "Stripe live secret key is required in production",
      status: 500,
    };
  }

  return {
    ok: true as const,
    key: stripeSecretKey,
    livemode: stripeSecretKey.startsWith("sk_live_"),
  };
}
