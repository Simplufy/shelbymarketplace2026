export function getStripeSecretKey() {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY?.trim();

  if (!stripeSecretKey) {
    return {
      ok: false as const,
      error: "Stripe configuration missing",
      status: 500,
    };
  }

  const isLiveKey = stripeSecretKey.startsWith("sk_live_") || stripeSecretKey.startsWith("rk_live_");

  if (process.env.VERCEL_ENV === "production" && !isLiveKey) {
    return {
      ok: false as const,
      error: "Stripe live secret key is required in production",
      status: 500,
    };
  }

  return {
    ok: true as const,
    key: stripeSecretKey,
    livemode: isLiveKey,
  };
}
