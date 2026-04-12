type TrackPayload = {
  event: string;
  profile?: {
    email?: string;
    external_id?: string;
    first_name?: string;
    last_name?: string;
  };
  properties?: Record<string, unknown>;
};

function getAnonymousId() {
  if (typeof window === "undefined") return "server";
  const key = "klaviyo_anon_id";
  const existing = localStorage.getItem(key);
  if (existing) return existing;

  const id = `anon_${crypto.randomUUID()}`;
  localStorage.setItem(key, id);
  return id;
}

export async function trackClientEvent(payload: TrackPayload) {
  try {
    const body: TrackPayload = {
      ...payload,
      profile: {
        external_id: payload.profile?.external_id || getAnonymousId(),
        ...payload.profile,
      },
    };

    await fetch("/api/klaviyo/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (error) {
    console.error("Failed to track client event", error);
  }
}

export async function subscribeClientEmail(email: string, source: string) {
  try {
    await fetch("/api/klaviyo/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, source }),
    });
  } catch (error) {
    console.error("Failed to subscribe email", error);
  }
}
