import type { Metadata } from "next"

// Static metadata for artwork pages
// Note: Dynamic metadata would require server components
export const metadata: Metadata = {
  title: "Artwork - Arts & Crafts Gallery",
  description: "View student artwork from our creative gallery. Discover amazing pieces created by talented students.",
  keywords: ["Student Artwork", "Arts & Crafts", "Gallery", "Creative Education", "Student Showcase"],
  openGraph: {
    title: "Student Artwork - Arts & Crafts Gallery",
    description: "Discover amazing artwork created by talented students",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Arts & Crafts Gallery - Student Artwork",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Student Artwork - Arts & Crafts Gallery",
    description: "Discover amazing artwork created by talented students",
    images: ["/logo.png"],
  },
}