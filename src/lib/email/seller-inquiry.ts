type SellerInquiryEmailInput = {
  to: string;
  sellerName: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone?: string | null;
  message: string;
  vehicleLabel: string;
  listingUrl: string;
};

type EmailResult =
  | { ok: true; id?: string }
  | { ok: false; error: string };

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function plainText(input: SellerInquiryEmailInput) {
  return [
    `New inquiry about ${input.vehicleLabel}`,
    "",
    `Seller: ${input.sellerName}`,
    `From: ${input.buyerName}`,
    `Email: ${input.buyerEmail}`,
    `Phone: ${input.buyerPhone || "Not provided"}`,
    "",
    "Message:",
    input.message,
    "",
    `Listing: ${input.listingUrl}`,
  ].join("\n");
}

function html(input: SellerInquiryEmailInput) {
  const safeVehicle = escapeHtml(input.vehicleLabel);
  const safeSeller = escapeHtml(input.sellerName);
  const safeBuyer = escapeHtml(input.buyerName);
  const safeEmail = escapeHtml(input.buyerEmail);
  const safePhone = escapeHtml(input.buyerPhone || "Not provided");
  const safeMessage = escapeHtml(input.message).replace(/\n/g, "<br />");
  const safeListingUrl = escapeHtml(input.listingUrl);

  return `
    <div style="font-family: Arial, sans-serif; color: #171a1f; max-width: 640px; margin: 0 auto; padding: 24px;">
      <h1 style="color: #002D72; font-size: 24px; margin: 0 0 16px;">New listing inquiry</h1>
      <p style="margin: 0 0 16px;">Hello ${safeSeller},</p>
      <p style="margin: 0 0 20px;">A buyer contacted you about your ${safeVehicle} listing on Ford Shelby For Sale.</p>

      <div style="border: 1px solid #dee1e6; border-radius: 12px; padding: 18px; margin: 20px 0; background: #fafafb;">
        <h2 style="font-size: 18px; margin: 0 0 12px; color: #002D72;">${safeVehicle}</h2>
        <p style="margin: 8px 0;"><strong>Name:</strong> ${safeBuyer}</p>
        <p style="margin: 8px 0;"><strong>Email:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a></p>
        <p style="margin: 8px 0;"><strong>Phone:</strong> ${safePhone}</p>
      </div>

      <div style="border-left: 4px solid #E31837; padding: 12px 16px; background: #fff5f6; margin: 20px 0;">
        <p style="margin: 0; line-height: 1.5;">${safeMessage}</p>
      </div>

      <p style="margin: 24px 0;">
        <a href="${safeListingUrl}" style="display: inline-block; background: #002D72; color: white; text-decoration: none; font-weight: 700; padding: 12px 18px; border-radius: 8px;">View Listing</a>
      </p>

      <p style="font-size: 12px; color: #565d6d; margin-top: 28px;">Reply directly to this email to contact the buyer.</p>
    </div>
  `;
}

export async function sendSellerInquiryEmail(input: SellerInquiryEmailInput): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "RESEND_API_KEY is not configured" };
  }

  const from =
    process.env.SELLER_INQUIRY_FROM_EMAIL ||
    process.env.RESEND_FROM_EMAIL ||
    process.env.EMAIL_FROM ||
    "Ford Shelby For Sale <leads@fordshelbyforsale.com>";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      reply_to: input.buyerEmail,
      subject: `New inquiry about your ${input.vehicleLabel}`,
      html: html(input),
      text: plainText(input),
    }),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      ok: false,
      error: payload?.message || payload?.error || "Failed to send seller email",
    };
  }

  return { ok: true, id: payload?.id };
}
