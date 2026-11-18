import { Gallery } from "@/components/site/gallery";
import { publicGallery } from "@/lib/gallery";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata("gallery");
export default async function Page() {
  const { data, unavailable } = await publicGallery();
  return (
    <>
      <section className="gallery-hero">
        <div className="wrap">
          <p className="eyebrow">The Forum, together</p>
          <h1>
            Beyond borders.
            <br />
            <em>Within every frame.</em>
          </h1>
          <div className="gallery-hero-bottom">
            <p>
              A living collection of the conversations, connections and shared
              moments that bring Global Lawyers Forum to life.
            </p>
            <span>Gatherings · People · Purpose</span>
          </div>
        </div>
      </section>
      <div className="wrap">
        <Gallery initial={data} unavailable={unavailable} />
      </div>
    </>
  );
}
