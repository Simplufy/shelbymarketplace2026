import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/global/Header";
import Footer from "@/components/global/Footer";
import { AuthProvider } from "@/contexts/AuthContext";
import { CompareProvider } from "@/contexts/CompareContext";
import { CompareBar } from "@/components/CompareBar";
import { KlaviyoPopup } from "@/components/KlaviyoPopup";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Shelby Exchange | Premium Ford Shelby Marketplace",
  description: "Buy and sell authentic Ford Shelby vehicles on the world's premier marketplace. GT500, GT350, Super Snake, and more. Verified sellers, curated listings.",
  keywords: ["Ford Shelby", "Shelby GT500", "Shelby GT350", "Super Snake", "muscle cars", "performance vehicles", "buy Shelby", "sell Shelby"],
  authors: [{ name: "Shelby Exchange" }],
  creator: "Shelby Exchange",
  publisher: "Shelby Exchange",
  metadataBase: new URL("https://shelbyexchange.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://shelbyexchange.com",
    siteName: "Shelby Exchange",
    title: "Shelby Exchange | Premium Ford Shelby Marketplace",
    description: "Buy and sell authentic Ford Shelby vehicles on the world's premier marketplace.",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Shelby Exchange - Premium Ford Shelby Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shelby Exchange | Premium Ford Shelby Marketplace",
    description: "Buy and sell authentic Ford Shelby vehicles on the world's premier marketplace.",
    images: ["/images/og-image.jpg"],
    creator: "@shelbyexchange",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code", // Replace with actual code
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="font-sans min-h-full flex flex-col pt-0 bg-white text-[#171a1f]">
        {process.env.NEXT_PUBLIC_KLAVIYO_COMPANY_ID ? (
          <Script
            id="klaviyo-tracking"
            strategy="afterInteractive"
            src={`https://static.klaviyo.com/onsite/js/klaviyo.js?company_id=${process.env.NEXT_PUBLIC_KLAVIYO_COMPANY_ID}`}
          />
        ) : null}
        <AuthProvider>
          <CompareProvider>
            <Header />
            <main className="flex-1 flex flex-col">
              {children}
            </main>
            <Footer />
            <CompareBar />
            <KlaviyoPopup />
          </CompareProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
