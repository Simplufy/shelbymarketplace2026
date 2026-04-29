"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

export default function CheckoutReturnHandler({ compact = false }: { compact?: boolean }) {
  const searchParams = useSearchParams();
  const isSuccess = searchParams.get("success") === "true" || !!searchParams.get("session_id");
  const isCanceled = searchParams.get("canceled") === "true";
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"idle" | "confirming" | "ready" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!isSuccess || !sessionId) return;

    let canceled = false;

    const confirmCheckout = async () => {
      setStatus("confirming");
      setMessage("Confirming your payment and sending your listing to the approval queue.");

      try {
        const response = await fetch("/api/stripe/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ session_id: sessionId }),
        });
        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(payload?.error || "Unable to confirm checkout");
        }

        if (!canceled) {
          setStatus("ready");
          setMessage("Payment confirmed. Your listing is waiting for admin approval.");
        }
      } catch (error: any) {
        if (!canceled) {
          setStatus("error");
          setMessage(error.message || "Payment succeeded, but we could not confirm the listing yet.");
        }
      }
    };

    void confirmCheckout();

    return () => {
      canceled = true;
    };
  }, [isSuccess, sessionId]);

  if (isCanceled) {
    return (
      <div className={`${compact ? "" : "mx-auto mt-8 max-w-3xl"} rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm font-semibold text-yellow-800`}>
        Checkout was canceled. Your listing has not been submitted yet.
      </div>
    );
  }

  if (!isSuccess || !sessionId || status === "idle") return null;

  const Icon = status === "confirming" ? Loader2 : status === "ready" ? CheckCircle2 : XCircle;

  return (
    <div className={`${compact ? "" : "mx-auto mt-8 max-w-3xl"} flex items-center gap-3 rounded-xl border p-4 text-sm font-semibold ${
      status === "ready"
        ? "border-green-200 bg-green-50 text-green-800"
        : status === "error"
          ? "border-red-200 bg-red-50 text-red-800"
          : "border-blue-200 bg-blue-50 text-blue-800"
    }`}>
      <Icon className={`h-5 w-5 shrink-0 ${status === "confirming" ? "animate-spin" : ""}`} />
      <span>{message}</span>
    </div>
  );
}
