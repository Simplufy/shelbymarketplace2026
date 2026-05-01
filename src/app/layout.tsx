import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/global/Header";
import Footer from "@/components/global/Footer";
import RouteScrollManager from "@/components/global/RouteScrollManager";
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

const googleAnalyticsId = "G-JTQ0SM9NJG";

export const metadata: Metadata = {
  title: "Shelby Exchange | Premium Ford Shelby Marketplace",
  description: "Buy and sell authentic Ford Shelby vehicles on the world's premier marketplace. GT500, GT350, Super Snake, and more. Verified sellers, curated listings.",
  keywords: ["Ford Shelby", "Shelby GT500", "Shelby GT350", "Super Snake", "muscle cars", "performance vehicles", "buy Shelby", "sell Shelby"],
  authors: [{ name: "Shelby Exchange" }],
  creator: "Shelby Exchange",
  publisher: "Shelby Exchange",
  metadataBase: new URL("https://shelbyexchange.com"),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon.png", type: "image/png", sizes: "512x512" },
      { url: "/favicon.ico" },
    ],
    shortcut: "/favicon.ico",
    apple: "/icon-192.png",
  },
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
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
        />
        <Script
          id="google-analytics-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${googleAnalyticsId}');
            `,
          }}
        />
        <Script
          id="klaviyo-tracking"
          strategy="afterInteractive"
          src="https://static.klaviyo.com/onsite/js/SnPPrL/klaviyo.js?company_id=SnPPrL"
        />
        <Script
          id="klaviyo-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html:
              "!function(){if(!window.klaviyo){window._klOnsite=window._klOnsite||[];try{window.klaviyo=new Proxy({},{get:function(n,i){return\"push\"===i?function(){var n;(n=window._klOnsite).push.apply(n,arguments)}:function(){for(var n=arguments.length,o=new Array(n),w=0;w<n;w++)o[w]=arguments[w];var t=\"function\"==typeof o[o.length-1]?o.pop():void 0,e=new Promise((function(n){window._klOnsite.push([i].concat(o,[function(i){t&&t(i),n(i)}]))}));return e}}})}catch(n){window.klaviyo=window.klaviyo||[],window.klaviyo.push=function(){var n;(n=window._klOnsite).push.apply(n,arguments)}}}}();",
          }}
        />
        <AuthProvider>
          <CompareProvider>
            <RouteScrollManager />
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
