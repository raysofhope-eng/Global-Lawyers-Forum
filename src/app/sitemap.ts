import type { MetadataRoute } from "next";
import pages from "@/content/pages.json";
import { siteUrl } from "@/lib/seo";
export default function sitemap(): MetadataRoute.Sitemap {
  return Object.values(pages).map((page) => ({
    url: new URL(page.path, siteUrl).toString(),
  }));
}
