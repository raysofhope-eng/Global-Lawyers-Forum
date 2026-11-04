import { LeadershipContent } from "@/components/site/leadership-content";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata("leadership");
export default function Page() {
  return <LeadershipContent />;
}
