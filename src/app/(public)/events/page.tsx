import { EventsContent } from "@/components/site/events-content";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata("events");
export default function Page() {
  return <EventsContent />;
}
