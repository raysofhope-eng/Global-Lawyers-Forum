import { HomeContent } from "@/components/site/index-content";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata("home");
export default function Page() {
  return <HomeContent />;
}
