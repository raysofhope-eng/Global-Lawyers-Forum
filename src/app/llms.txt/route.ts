import pages from "@/content/pages.json";
import { siteUrl } from "@/lib/seo";
export const dynamic = "force-static";
export function GET() {
  return new Response(
    "# Global Lawyers Forum\n\n" +
      pages.home.description +
      "\n\n## Public pages\n" +
      Object.values(pages)
        .map(
          (page) =>
            `- [${page.title}](${new URL(page.path, siteUrl)}): ${page.description}`,
        )
        .join("\n") +
      "\n\nContact: globallawyersforumuk@gmail.com\nThe admin panel, applications, and identity documents are private.\n",
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
}
