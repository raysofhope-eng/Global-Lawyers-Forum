import type { Metadata } from "next";
import pages from "@/content/pages.json";
export const siteUrl = new URL(
  process.env.SITE_URL ||
    (process.env.NODE_ENV === "production"
      ? "https://globallawyersforum.org"
      : "http://localhost:3000"),
);
if (
  process.env.NODE_ENV === "production" &&
  (siteUrl.protocol !== "https:" ||
    ["localhost", "127.0.0.1"].includes(siteUrl.hostname))
) {
  throw new Error("Production SITE_URL must be the public HTTPS domain.");
}
export function pageMetadata(key: keyof typeof pages): Metadata {
  const page = pages[key];
  const url = new URL(page.path, siteUrl).toString();
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: url },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      type: "website",
      siteName: "Global Lawyers Forum",
      title: page.title,
      description: page.description,
      url,
      images: [
        {
          url: new URL("/og-image.jpg", siteUrl).toString(),
          width: 1200,
          height: 630,
          alt: "Global Lawyers Forum — Justice Without Borders",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
      images: [new URL("/og-image.jpg", siteUrl).toString()],
    },
  };
}
export const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": new URL("/#organization", siteUrl).toString(),
  name: "Global Lawyers Forum",
  alternateName: "GLF",
  url: siteUrl.toString(),
  logo: new URL("/logo-badge-512.png", siteUrl).toString(),
  foundingDate: "2010",
  foundingLocation: "London, United Kingdom",
  email: "globallawyersforumuk@gmail.com",
  description: pages.home.description,
};
