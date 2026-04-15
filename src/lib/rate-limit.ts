import { NextRequest } from "next/server";

type RateLimitConfig = {
  windowMs: number;
  max: number;
};

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

function getIp(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return req.headers.get("x-real-ip") || "unknown";
}

export function checkRateLimit(req: NextRequest, key: string, config: RateLimitConfig) {
  const now = Date.now();
  const ip = getIp(req);
  const bucketKey = `${key}:${ip}`;
  const existing = buckets.get(bucketKey);

  if (!existing || now >= existing.resetAt) {
    buckets.set(bucketKey, { count: 1, resetAt: now + config.windowMs });
    return {
      allowed: true,
      limit: config.max,
      remaining: config.max - 1,
      retryAfterMs: config.windowMs,
    };
  }

  if (existing.count >= config.max) {
    return {
      allowed: false,
      limit: config.max,
      remaining: 0,
      retryAfterMs: Math.max(0, existing.resetAt - now),
    };
  }

  existing.count += 1;
  buckets.set(bucketKey, existing);

  return {
    allowed: true,
    limit: config.max,
    remaining: Math.max(0, config.max - existing.count),
    retryAfterMs: Math.max(0, existing.resetAt - now),
  };
}
