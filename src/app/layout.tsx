import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://localhost:3000'),
  title: "Arts & Crafts Gallery - Student Artwork Showcase",
  description: "A modern gallery platform for showcasing student artwork and crafts. Features include student profiles, artwork management, and interactive engagement features.",
  keywords: ["Arts & Crafts", "Gallery", "Student Artwork", "Education", "Creative Showcase", "Next.js", "TypeScript", "PostgreSQL"],
  authors: [{ name: "Sekolah Harapan Bangsa" }],
  creator: "Sekolah Harapan Bangsa",
  publisher: "Sekolah Harapan Bangsa",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Arts & Crafts Gallery",
  },
  openGraph: {
    title: "Arts & Crafts Gallery",
    description: "Discover and explore creative artwork from talented students. A modern platform for showcasing artistic talent and creativity.",
    url: "https://arts-crafts-gallery.vercel.app",
    siteName: "Arts & Crafts Gallery",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Arts & Crafts Gallery - Student Artwork Showcase",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Arts & Crafts Gallery",
    description: "Discover and explore creative artwork from talented students",
    images: ["/logo.png"],
    creator: "@sekolahharapanbangsa",
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
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
  },
  alternates: {
    canonical: "https://arts-crafts-gallery.vercel.app",
  },
  category: "Education",
  classification: "Educational Platform",
  referrer: "origin-when-cross-origin",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
