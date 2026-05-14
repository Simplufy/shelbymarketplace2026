type ListingPriceProps = {
  price: number | null | undefined;
  originalPrice?: number | null;
  className?: string;
  currentClassName?: string;
  originalClassName?: string;
  orientation?: "stacked" | "inline";
  formatPrice?: (price: number | null | undefined) => string;
};

export function formatListingPrice(price: number | null | undefined) {
  const amount = Number(price || 0);

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getSlashedOriginalPrice(price: number | null | undefined, originalPrice?: number | null) {
  const current = Number(price || 0);
  const original = Number(originalPrice || 0);

  if (!Number.isFinite(current) || !Number.isFinite(original)) return null;
  if (current <= 0 || original <= current) return null;

  return original;
}

export function ListingPrice({
  price,
  originalPrice,
  className = "",
  currentClassName = "font-black text-[#E31837]",
  originalClassName = "text-xs font-bold text-[#565d6d] line-through decoration-2",
  orientation = "stacked",
  formatPrice = formatListingPrice,
}: ListingPriceProps) {
  const slashedPrice = getSlashedOriginalPrice(price, originalPrice);
  const wrapperClass =
    orientation === "inline"
      ? "flex flex-wrap items-baseline gap-x-2 gap-y-0.5"
      : "flex flex-col";

  return (
    <div className={`${wrapperClass} ${className}`}>
      {slashedPrice ? (
        <span className={originalClassName}>{formatPrice(slashedPrice)}</span>
      ) : null}
      <span className={currentClassName}>{formatPrice(price)}</span>
    </div>
  );
}
