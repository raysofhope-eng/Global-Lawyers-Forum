import { ChaptersContent } from "@/components/site/chapters-content";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata("chapters");
export default function Page() {
  return <ChaptersContent />;
}
