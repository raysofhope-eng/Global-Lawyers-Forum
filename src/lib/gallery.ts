import "server-only";
import type { GalleryAlbum, Page } from "@/contracts";
export async function publicGallery(
  featured = false,
): Promise<{ data: Page<GalleryAlbum>; unavailable: boolean }> {
  try {
    const response = await fetch(
      `${process.env.API_INTERNAL_URL || "http://127.0.0.1:4000"}/api/gallery${featured ? "?featured=true" : ""}`,
      { next: { revalidate: 60 }, signal: AbortSignal.timeout(6000) },
    );
    if (!response.ok) throw new Error("Gallery unavailable");
    return { data: await response.json(), unavailable: false };
  } catch {
    return {
      data: { items: [], total: 0, page: 1, pageSize: 6 },
      unavailable: true,
    };
  }
}
