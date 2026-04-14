const KLAVIYO_API_BASE = "https://a.klaviyo.com/api";
const KLAVIYO_REVISION = "2024-10-15";

type KlaviyoProfile = {
  email?: string;
  external_id?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  properties?: Record<string, unknown>;
};

function getHeaders() {
  const apiKey = process.env.KLAVIYO_PRIVATE_API_KEY;
  if (!apiKey) return null;

  return {
    Authorization: `Klaviyo-API-Key ${apiKey}`,
    revision: KLAVIYO_REVISION,
    "Content-Type": "application/json",
  };
}

function resolveListId(source?: string, explicitListId?: string) {
  if (explicitListId) return explicitListId;

  const sourceMap: Record<string, string | undefined> = {
    account_signup: process.env.KLAVIYO_LIST_ID_BUYERS,
    listing_view: process.env.KLAVIYO_LIST_ID_BUYERS,
    high_intent_contact: process.env.KLAVIYO_LIST_ID_HIGH_INTENT,
    seller_listing_submit: process.env.KLAVIYO_LIST_ID_SELLERS,
    listing_published: process.env.KLAVIYO_LIST_ID_SELLERS,
  };

  return sourceMap[source || ""] || process.env.KLAVIYO_LIST_ID;
}

export async function trackKlaviyoEvent(params: {
  metricName: string;
  profile: KlaviyoProfile;
  properties?: Record<string, unknown>;
}) {
  const headers = getHeaders();
  if (!headers) return { ok: false, skipped: true, reason: "missing_api_key" };

  try {
    const payload = {
      data: {
        type: "event",
        attributes: {
          metric: {
            data: {
              type: "metric",
              attributes: { name: params.metricName },
            },
          },
          profile: {
            data: {
              type: "profile",
              attributes: params.profile,
            },
          },
          properties: params.properties || {},
          time: new Date().toISOString(),
        },
      },
    };

    const res = await fetch(`${KLAVIYO_API_BASE}/events`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Klaviyo event error:", text);
      return { ok: false, status: res.status, error: text };
    }

    return { ok: true };
  } catch (error) {
    console.error("Klaviyo event request failed:", error);
    return { ok: false };
  }
}

export async function subscribeKlaviyoEmail(params: {
  email: string;
  firstName?: string;
  lastName?: string;
  source?: string;
  listId?: string;
  properties?: Record<string, unknown>;
}) {
  const headers = getHeaders();
  if (!headers) return { ok: false, skipped: true, reason: "missing_api_key" };

  const listId = resolveListId(params.source, params.listId);

  try {
    let hasError = false;

    // Upsert profile
    const profileRes = await fetch(`${KLAVIYO_API_BASE}/profiles/`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        data: {
          type: "profile",
          attributes: {
            email: params.email,
            first_name: params.firstName,
            last_name: params.lastName,
            properties: {
              source: params.source || "website",
              ...(params.properties || {}),
            },
          },
        },
      }),
    });
    
    if (!profileRes.ok) {
      const profileText = await profileRes.text();
      console.error("Klaviyo profile upsert failed:", profileText);
      hasError = true;
    }

    if (listId) {
      const subRes = await fetch(`${KLAVIYO_API_BASE}/profile-subscription-bulk-create-jobs`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          data: {
            type: "profile-subscription-bulk-create-job",
            attributes: {
              custom_source: params.source || "Website Signup",
              profiles: {
                data: [
                  {
                    type: "profile",
                    attributes: { email: params.email },
                  },
                ],
              },
            },
            relationships: {
              list: {
                data: {
                  type: "list",
                  id: listId,
                },
              },
            },
          },
        }),
      });
      
      if (!subRes.ok) {
        const subText = await subRes.text();
        console.error("Klaviyo list subscription failed:", subText);
        hasError = true;
      }
    }

    return hasError ? { ok: false } : { ok: true };
  } catch (error) {
    console.error("Klaviyo subscribe failed:", error);
    return { ok: false };
  }
}
