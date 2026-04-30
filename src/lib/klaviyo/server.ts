const KLAVIYO_API_BASE = "https://a.klaviyo.com/api";
const KLAVIYO_REVISION = "2026-04-15";

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
    accept: "application/vnd.api+json",
    "Content-Type": "application/vnd.api+json",
  };
}

function uniqueListIds(ids: Array<string | undefined>) {
  return [...new Set(ids.filter(Boolean))] as string[];
}

function resolveListIds(source?: string, explicitListId?: string) {
  if (explicitListId) return uniqueListIds([explicitListId]);

  const mainList = process.env.KLAVIYO_LIST_ID;
  const buyersList = process.env.KLAVIYO_LIST_ID_BUYERS;
  const sellersList = process.env.KLAVIYO_LIST_ID_SELLERS;
  const highIntentList = process.env.KLAVIYO_LIST_ID_HIGH_INTENT;

  const sourceMap: Record<string, Array<string | undefined>> = {
    account_signup: [mainList, buyersList],
    footer_newsletter: [mainList, buyersList],
    homepage_inline: [mainList, buyersList],
    listing_inline: [mainList, buyersList],
    popup_offer: [mainList, buyersList],
    website: [mainList],
    contact_form: [mainList],
    listing_view: [mainList, buyersList],
    high_intent_contact: [mainList, buyersList, highIntentList],
    seller_listing_submit: [mainList, sellersList],
    listing_published: [mainList, sellersList],
  };

  return uniqueListIds(sourceMap[source || ""] || [mainList]);
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

  const listIds = resolveListIds(params.source, params.listId);

  try {
    let hasError = false;
    const listResults: Array<{ listId: string; ok: boolean; status: number; error?: string }> = [];

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
    
    if (!profileRes.ok && profileRes.status !== 409) {
      const profileText = await profileRes.text();
      console.error("Klaviyo profile upsert failed:", profileText);
      hasError = true;
    }

    for (const listId of listIds) {
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
                    attributes: {
                      email: params.email,
                      subscriptions: {
                        email: {
                          marketing: {
                            consent: "SUBSCRIBED",
                          },
                        },
                      },
                    },
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
        console.error(`Klaviyo list subscription failed for ${listId}:`, subText);
        listResults.push({ listId, ok: false, status: subRes.status, error: subText });
        hasError = true;
      } else {
        listResults.push({ listId, ok: true, status: subRes.status });
      }
    }

    return hasError ? { ok: false, listResults } : { ok: true, listResults };
  } catch (error) {
    console.error("Klaviyo subscribe failed:", error);
    return { ok: false };
  }
}
