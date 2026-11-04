import type { Metadata } from "next";
import pages from "@/content/pages.json";
if (process.env.NODE_ENV === "production" && !process.env.SITE_URL) {
  throw new Error("Set SITE_URL before building the production frontend.");
}
export const siteUrl = new URL(process.env.SITE_URL || "http://localhost:3000");
export function pageMetadata(key: keyof typeof pages): Metadata {
  const page = pages[key];
  const url = new URL(page.path, siteUrl).toString();
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: url },
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
  email: "globallawyersforum@gmail.com",
  description: pages.home.description,
};
