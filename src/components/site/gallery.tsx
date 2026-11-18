"use client";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import type { GalleryAlbum, GalleryImage, Page } from "@/contracts";
import { Dialog } from "@/components/ui/dialog";
export const galleryImageUrl = (image: GalleryImage, thumbnail = true) =>
  `/api/gallery/${image.albumId}/images/${image.id}${thumbnail ? "?size=thumb" : ""}`;

export function Gallery({
  initial,
  unavailable,
}: {
  initial: Page<GalleryAlbum>;
  unavailable: boolean;
}) {
  const [albums, setAlbums] = useState(initial.items),
    [page, setPage] = useState(initial.page),
    [total, setTotal] = useState(initial.total),
    [filter, setFilter] = useState("all"),
    [loading, setLoading] = useState(false),
    [error, setError] = useState(
      unavailable
        ? "The gallery is temporarily unavailable. Please try again."
        : "",
    );
  async function more(reset = false) {
    setLoading(true);
    setError("");
    try {
      const result = await api<Page<GalleryAlbum>>(
        `/gallery?page=${reset ? 1 : page + 1}`,
      );
      setAlbums((old) =>
        reset
          ? result.items
          : [
              ...old,
              ...result.items.filter(
                (item) => !old.some((a) => a.id === item.id),
              ),
            ],
      );
      setPage(result.page);
      setTotal(result.total);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="gallery-experience">
      <div className="gallery-filter" aria-label="Filter gallery events">
        <button
          className={filter === "all" ? "active" : ""}
          aria-pressed={filter === "all"}
          onClick={() => setFilter("all")}
        >
          All moments
        </button>
        {albums.map((album) => (
          <button
            key={album.id}
            className={filter === album.id ? "active" : ""}
            aria-pressed={filter === album.id}
            onClick={() => setFilter(album.id)}
          >
            {album.name}
          </button>
        ))}
      </div>
      {!albums.length && !error && (
        <div className="gallery-empty">
          <span className="eyebrow">The story continues</span>
          <h2>Our next chapter, in pictures.</h2>
          <p>Photographs from the Forum’s gatherings will appear here.</p>
        </div>
      )}
      <div className="gallery-sections">
        {albums
          .filter((a) => filter === "all" || a.id === filter)
          .map((album) => (
            <GallerySection key={album.id} album={album} />
          ))}
      </div>
      {error && (
        <div role="alert" className="empty-state">
          <p>{error}</p>
          <button
            className="btn btn-ghost"
            disabled={loading}
            onClick={() => void more(!albums.length)}
          >
            Try again
          </button>
        </div>
      )}
      {albums.length < total && (
        <div className="gallery-more">
          <button
            className="btn btn-ghost"
            disabled={loading}
            onClick={() => void more()}
          >
            {loading ? "Loading events…" : "Discover more events"}
          </button>
        </div>
      )}
    </div>
  );
}
function GallerySection({ album }: { album: GalleryAlbum }) {
  const [images, setImages] = useState(album.images),
    [expanded, setExpanded] = useState(false),
    [page, setPage] = useState(0),
    [loading, setLoading] = useState(false),
    [error, setError] = useState(""),
    [selected, setSelected] = useState<number | null>(null);
  async function more() {
    setLoading(true);
    setError("");
    try {
      const result = await api<Page<GalleryImage>>(
        `/gallery/${album.id}/images?page=${page + 1}`,
      );
      setImages((old) =>
        page === 0
          ? result.items
          : [
              ...old,
              ...result.items.filter((i) => !old.some((o) => o.id === i.id)),
            ],
      );
      setPage(result.page);
      setExpanded(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }
  return (
    <section
      className="gallery-event"
      id={`event-${album.id}`}
      aria-labelledby={`heading-${album.id}`}
    >
      <div className="gallery-event-heading">
        <div>
          <p className="eyebrow">
            {album.eventDate
              ? new Date(`${album.eventDate}T12:00:00Z`).toLocaleDateString(
                  "en-GB",
                  { month: "long", year: "numeric", timeZone: "UTC" },
                )
              : "From the Forum"}
          </p>
          <h2 id={`heading-${album.id}`}>{album.name}</h2>
          {album.description && (
            <p className="gallery-description">{album.description}</p>
          )}
        </div>
        <span className="gallery-count">{album.imageCount} photographs</span>
      </div>
      <div className={`gallery-mosaic${expanded ? " expanded" : ""}`}>
        {images.map((image, index) => (
          <button
            className="gallery-frame"
            key={image.id}
            onClick={() => setSelected(index)}
            aria-label={`View ${image.altText}, photo ${index + 1} of ${album.name}`}
          >
            <img
              src={galleryImageUrl(image)}
              alt={image.altText}
              width={image.width}
              height={image.height}
              loading="lazy"
              decoding="async"
            />
            <span className="gallery-frame-overlay">
              <span>View photograph</span>
              <span aria-hidden="true">＋</span>
            </span>
          </button>
        ))}
      </div>
      {images.length < album.imageCount && (
        <div className="gallery-more">
          <button
            className="btn btn-ghost"
            disabled={loading}
            onClick={() => void more()}
          >
            {loading
              ? "Loading photographs…"
              : expanded
                ? "More photographs"
                : `Explore all ${album.imageCount} photographs`}
          </button>
        </div>
      )}
      {error && (
        <p role="alert" className="field-error">
          {error}
        </p>
      )}
      {selected !== null && (
        <Lightbox
          images={images}
          initialIndex={selected}
          title={album.name}
          close={() => setSelected(null)}
        />
      )}
    </section>
  );
}
function Lightbox({
  images,
  initialIndex,
  title,
  close,
}: {
  images: GalleryImage[];
  initialIndex: number;
  title: string;
  close: () => void;
}) {
  const [index, setIndex] = useState(initialIndex),
    [zoom, setZoom] = useState(false);
  const touch = useRef<number | null>(null);
  const image = images[index];
  function move(delta: number) {
    setIndex((v) => (v + delta + images.length) % images.length);
    setZoom(false);
  }
  useEffect(() => {
    if (images.length > 1) {
      const next = new window.Image();
      next.src = galleryImageUrl(images[(index + 1) % images.length], false);
    }
  }, [index, images]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        setIndex(
          (v) =>
            (v + (e.key === "ArrowRight" ? 1 : -1) + images.length) %
            images.length,
        );
        setZoom(false);
      }
    };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [images.length]);
  return (
    <Dialog title={title} onClose={close} wide>
      <div
        className="gallery-lightbox"
        onTouchStart={(e) => {
          touch.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (touch.current !== null && !zoom) {
            const delta = e.changedTouches[0].clientX - touch.current;
            if (Math.abs(delta) > 60) move(delta < 0 ? 1 : -1);
          }
          touch.current = null;
        }}
      >
        <div className={`gallery-lightbox-image${zoom ? " zoomed" : ""}`}>
          <img
            key={image.id}
            src={galleryImageUrl(image, false)}
            alt={image.altText}
            width={image.width}
            height={image.height}
          />
        </div>
        <div className="gallery-lightbox-controls">
          <button
            className="btn btn-ghost"
            disabled={images.length < 2}
            onClick={() => move(-1)}
          >
            Previous
          </button>
          <span aria-live="polite">
            {index + 1} / {images.length}
          </span>
          <button
            className="btn btn-ghost"
            aria-pressed={zoom}
            onClick={() => setZoom((v) => !v)}
          >
            {zoom ? "Fit image" : "Zoom"}
          </button>
          <button
            className="btn btn-ghost"
            disabled={images.length < 2}
            onClick={() => move(1)}
          >
            Next
          </button>
        </div>
        <p className="gallery-caption">{image.altText}</p>
      </div>
    </Dialog>
  );
}
