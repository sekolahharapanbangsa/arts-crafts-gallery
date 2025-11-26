import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin Panel - Arts & Crafts Gallery",
  description: "Secure admin dashboard for managing students, artworks, and gallery content. Features include user management, artwork curation, and analytics.",
  keywords: ["Admin Panel", "Gallery Management", "Student Management", "Artwork Curation", "Education Admin"],
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  openGraph: {
    title: "Admin Panel - Arts & Crafts Gallery",
    description: "Secure admin dashboard for gallery management",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Admin Panel - Arts & Crafts Gallery",
    description: "Secure admin dashboard for gallery management",
  },
}