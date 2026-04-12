"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global error:", error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen bg-[#fafafb] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-lg border border-[#dee1e6]/50 p-8 md:p-12 max-w-lg w-full text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="font-outfit font-black text-2xl text-[#171a1f] mb-3">
              Something went wrong
            </h2>
            <p className="text-[#565d6d] mb-6">
              We apologize for the inconvenience. Our team has been notified and is working to fix the issue.
            </p>
            {error.digest && (
              <p className="text-xs text-[#565d6d] mb-6 font-mono bg-gray-100 p-2 rounded">
                Error ID: {error.digest}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={reset}
                className="px-6 py-3 bg-[#002D72] text-white font-bold rounded-xl hover:bg-[#001D4A] transition-colors"
              >
                Try Again
              </button>
              <Link
                href="/"
                className="px-6 py-3 border-2 border-[#dee1e6] text-[#565d6d] font-bold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Go Home
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
