import { MembershipContent } from "@/components/site/membership-content";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata("membership");
export default function Page() {
  return <MembershipContent />;
}
