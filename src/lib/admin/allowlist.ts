export const ADMIN_EMAIL_ALLOWLIST = ["mcguireflanigan@gmail.com"];

export function isAllowlistedAdminEmail(email?: string | null) {
  if (!email) return false;
  return ADMIN_EMAIL_ALLOWLIST.includes(email.toLowerCase());
}
