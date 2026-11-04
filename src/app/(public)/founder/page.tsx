import { FounderContent } from "@/components/site/founder-content";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata("founder");
export default function Page() {
  return <FounderContent />;
}
