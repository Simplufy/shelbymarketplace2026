export const CARFAX_FEATURE_PREFIX = "Vehicle history report URL:";

export const CARFAX_FEATURE_PREFIXES = [
  CARFAX_FEATURE_PREFIX,
  "Carfax report URL:",
  "CARFAX report URL:",
  "Vehicle History Report URL:",
];

function featureText(value: unknown) {
  if (typeof value === "string") return value.trim();
  if (value && typeof value === "object" && "feature" in value) {
    const feature = (value as { feature?: unknown }).feature;
    return typeof feature === "string" ? feature.trim() : "";
  }
  return "";
}

export function normalizeCarfaxReportUrl(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function formatCarfaxFeature(url: string) {
  return `${CARFAX_FEATURE_PREFIX} ${url.trim()}`;
}

export function isCarfaxReportFeature(value: unknown) {
  const text = featureText(value).toLowerCase();
  return CARFAX_FEATURE_PREFIXES.some((prefix) => text.startsWith(prefix.toLowerCase()));
}

export function extractCarfaxReportUrlFromFeatures(features: unknown[] | null | undefined) {
  if (!Array.isArray(features)) return null;

  for (const value of features) {
    const text = featureText(value);
    const lowerText = text.toLowerCase();
    const prefix = CARFAX_FEATURE_PREFIXES.find((candidate) =>
      lowerText.startsWith(candidate.toLowerCase())
    );

    if (!prefix) continue;

    const url = text.slice(prefix.length).trim();
    if (url) return url;
  }

  return null;
}
