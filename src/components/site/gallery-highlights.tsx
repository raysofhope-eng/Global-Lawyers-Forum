import Link from "next/link";
import { publicGallery } from "@/lib/gallery";
export async function GalleryHighlights() {
  const { data } = await publicGallery(true);
  if (!data.items.length) return null;
  return (
    <section className="sec gallery-highlights">
      <div className="wrap">
        <div className="gallery-highlights-heading">
          <div>
            <p className="eyebrow">Life at the Forum</p>
            <h2>
              A shared purpose.
              <br />
              <em>Unforgettable moments.</em>
            </h2>
          </div>
          <Link href="/gallery" className="btn btn-ghost">
            Explore the gallery
          </Link>
        </div>
        <div className="gallery-highlight-grid">
          {data.items.slice(0, 3).map((album) => (
            <Link
              href="/gallery"
              className="gallery-highlight-card"
              key={album.id}
            >
              <div className="gallery-highlight-image">
                <img
                  src={`/api/gallery/${album.id}/images/${album.images[0].id}?size=thumb`}
                  alt={album.images[0].altText}
                  width={album.images[0].width}
                  height={album.images[0].height}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div>
                <span className="eyebrow">{album.imageCount} photographs</span>
                <h3>{album.name}</h3>
                <span className="gallery-highlight-link">
                  Discover the moments
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
