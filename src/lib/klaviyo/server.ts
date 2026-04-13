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
      return { ok: false, status: res.status };
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
  console.log('Klaviyo headers check:', headers ? 'has headers' : 'NO HEADERS');
  console.log('Klaviyo API key prefix:', process.env.KLAVIYO_PRIVATE_API_KEY?.substring(0, 10));
  
  if (!headers) return { ok: false, skipped: true, reason: "missing_api_key" };

  const listId = params.listId || process.env.KLAVIYO_LIST_ID;
  console.log('Klaviyo listId:', listId);

  try {
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
    
    console.log('Profile upsert status:', profileRes.status);
    const profileText = await profileRes.text();
    console.log('Profile response:', profileText.substring(0, 500));

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
      
      console.log('Subscription status:', subRes.status);
      const subText = await subRes.text();
      console.log('Subscription response:', subText.substring(0, 500));
    }

    return { ok: true };
  } catch (error) {
    console.error("Klaviyo subscribe failed:", error);
    return { ok: false };
  }
}
