// Simple in-memory sliding-window rate limiter for login attempts.
// Note: resets on server restart / cold start; fine for a demo deployment.
// For multi-instance production use, back this with Redis instead.

import { RATE_LIMIT_MAX_ATTEMPTS, RATE_LIMIT_WINDOW_MS } from "./constants";

interface Attempt {
  count: number;
  firstAttemptAt: number;
}

const attemptsByKey = new Map<string, Attempt>();

// Periodically clear stale entries so the map doesn't grow unbounded.
function prune(now: number) {
  for (const [key, attempt] of attemptsByKey.entries()) {
    if (now - attempt.firstAttemptAt > RATE_LIMIT_WINDOW_MS) {
      attemptsByKey.delete(key);
    }
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

export function checkRateLimit(key: string): RateLimitResult {
  const now = Date.now();
  prune(now);

  const existing = attemptsByKey.get(key);

  if (!existing || now - existing.firstAttemptAt > RATE_LIMIT_WINDOW_MS) {
    attemptsByKey.set(key, { count: 1, firstAttemptAt: now });
    return { allowed: true, remaining: RATE_LIMIT_MAX_ATTEMPTS - 1, retryAfterMs: 0 };
  }

  if (existing.count >= RATE_LIMIT_MAX_ATTEMPTS) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: RATE_LIMIT_WINDOW_MS - (now - existing.firstAttemptAt),
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: RATE_LIMIT_MAX_ATTEMPTS - existing.count,
    retryAfterMs: 0,
  };
}

export function resetRateLimit(key: string) {
  attemptsByKey.delete(key);
}
