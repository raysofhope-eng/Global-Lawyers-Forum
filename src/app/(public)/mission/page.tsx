import { MissionContent } from "@/components/site/mission-content";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata("mission");
export default function Page() {
  return <MissionContent />;
}
