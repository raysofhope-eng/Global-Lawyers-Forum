"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { GalleryAlbum, GalleryImage, Page } from "@/contracts";
import { api } from "@/lib/api";
import { useSession } from "@/hooks/use-session";
import { Dialog } from "@/components/ui/dialog";

export function AdminGallery() {
  const client = useQueryClient();
  const [deleting, setDeleting] = useState<GalleryAlbum | null>(null);
  const [deleteName, setDeleteName] = useState("");
  const [notice, setNotice] = useState("");
  const remove = useMutation({
    mutationFn: (id: string) =>
      api(`/admin/gallery/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      setDeleting(null);
      setEdit(null);
      setNotice(
        "Collection deleted. Public pages may take a minute to refresh.",
      );
      client.removeQueries({ queryKey: ["admin-gallery-images"] });
      void client.invalidateQueries({ queryKey: ["admin-gallery"] });
      if (query.data?.items.length === 1 && page > 1)
        setPage((value) => value - 1);
    },
  });
  const session = useSession(),
    [page, setPage] = useState(1),
    [edit, setEdit] = useState<GalleryAlbum | "new" | null>(null);
  const query = useQuery({
    queryKey: ["admin-gallery", page],
    queryFn: () => api<Page<GalleryAlbum>>(`/admin/gallery?page=${page}`),
    enabled: session.data?.role === "admin",
  });
  if (session.isPending) return <p role="status">Checking access…</p>;
  if (session.data?.role !== "admin")
    return (
      <div className="empty-state">
        <h1>Gallery administration</h1>
        <Link className="btn btn-gold" href="/admin">
          Sign in as administrator
        </Link>
      </div>
    );
  return (
    <>
      <div className="workspace-heading">
        <div>
          <h1>Gallery</h1>
          <p>Curate the moments that tell the Forum’s story.</p>
        </div>
        <div className="row-actions">
          <Link className="btn btn-ghost" href="/admin">
            Memberships
          </Link>
          <Link className="btn btn-ghost" href="/gallery">
            Public gallery
          </Link>
          <button className="btn btn-gold" onClick={() => setEdit("new")}>
            Create event collection
          </button>
        </div>
      </div>
      {notice && (
        <p role="status" className="inline-success">
          {notice}
        </p>
      )}
      {query.isPending ? (
        <p role="status">Loading collections…</p>
      ) : query.error ? (
        <p role="alert">{query.error.message}</p>
      ) : (
        <>
          <div className="gallery-admin-grid">
            {query.data.items.map((album) => (
              <article key={album.id} className="draft-card">
                {album.images[0] && (
                  <img
                    className="gallery-admin-cover"
                    src={`/api/admin/gallery/${album.id}/images/${album.images[0].id}?size=thumb`}
                    alt={album.name}
                    loading="lazy"
                  />
                )}
                <div className="row-actions">
                  <span
                    className={`status-badge ${album.published ? "approved" : ""}`}
                  >
                    {album.published ? "Published" : "Draft"}
                  </span>
                  {album.featured && (
                    <span className="status-badge">Home highlight</span>
                  )}
                </div>
                <h2>{album.name}</h2>
                <p>{album.imageCount} photographs</p>
                <button
                  className="btn btn-ghost"
                  onClick={() => setEdit(album)}
                >
                  Manage collection
                </button>
                <button
                  className="text-button danger"
                  onClick={() => {
                    setDeleteName("");
                    remove.reset();
                    setDeleting(album);
                  }}
                >
                  Delete collection
                </button>
              </article>
            ))}
          </div>
          {!query.data.items.length && (
            <div className="empty-state">
              <h2>Your first collection starts here.</h2>
              <p>
                Create an event, upload photographs and publish when it is
                ready.
              </p>
            </div>
          )}
          <div className="admin-pagination">
            <button disabled={page === 1} onClick={() => setPage((v) => v - 1)}>
              Previous
            </button>
            <span>Page {page}</span>
            <button
              disabled={page * 6 >= query.data.total}
              onClick={() => setPage((v) => v + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
      {edit && (
        <Collection
          key={edit === "new" ? "new" : edit.id}
          initial={edit === "new" ? null : edit}
          close={() => setEdit(null)}
        />
      )}
      {deleting && (
        <Dialog
          title="Delete gallery collection permanently?"
          onClose={() => {
            if (!remove.isPending) setDeleting(null);
          }}
        >
          <div className="dialog-body">
            <p>
              <strong>{deleting.name}</strong> and all {deleting.imageCount}{" "}
              photographs will be removed from the gallery. Its image folder
              will be moved to Drive trash. The collection cannot be restored
              from this website.
            </p>
            <label className="field">
              Type the collection name to confirm
              <input
                value={deleteName}
                onChange={(event) => setDeleteName(event.target.value)}
                autoComplete="off"
              />
            </label>
            {remove.error && (
              <p role="alert" className="field-error">
                {remove.error.message}
              </p>
            )}
          </div>
          <div className="dialog-footer">
            <button
              className="btn btn-ghost"
              disabled={remove.isPending}
              onClick={() => setDeleting(null)}
            >
              Keep collection
            </button>
            <button
              className="btn btn-danger"
              disabled={remove.isPending || deleteName !== deleting.name}
              onClick={() => remove.mutate(deleting.id)}
            >
              {remove.isPending ? "Deleting…" : "Delete collection permanently"}
            </button>
          </div>
        </Dialog>
      )}
    </>
  );
}
function Collection({
  initial,
  close,
}: {
  initial: GalleryAlbum | null;
  close: () => void;
}) {
  const client = useQueryClient(),
    [album, setAlbum] = useState(initial),
    [name, setName] = useState(initial?.name || ""),
    [description, setDescription] = useState(initial?.description || ""),
    [date, setDate] = useState(initial?.eventDate || ""),
    [published, setPublished] = useState(initial?.published || false),
    [featured, setFeatured] = useState(initial?.featured || false),
    [position, setPosition] = useState(initial?.position || 0),
    [page, setPage] = useState(1),
    [busy, setBusy] = useState(false),
    [progress, setProgress] = useState(""),
    [error, setError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const images = useQuery({
    queryKey: ["admin-gallery-images", album?.id, page],
    queryFn: () =>
      api<Page<GalleryImage>>(
        `/admin/gallery/${album!.id}/images?page=${page}`,
      ),
    enabled: !!album,
  });
  const refresh = () => {
    void client.invalidateQueries({ queryKey: ["admin-gallery"] });
    void client.invalidateQueries({
      queryKey: ["admin-gallery-images", album?.id],
    });
  };
  const save = useMutation({
    mutationFn: () =>
      api<GalleryAlbum>(
        album ? `/admin/gallery/${album.id}` : "/admin/gallery",
        {
          method: album ? "PATCH" : "POST",
          body: JSON.stringify({
            name,
            description,
            eventDate: date || null,
            published,
            featured,
            position,
          }),
        },
      ),
    onSuccess: (data) => {
      setAlbum(data);
      refresh();
      setProgress(
        "Collection saved. Public changes may take a minute to appear.",
      );
    },
  });
  async function upload(files: File[]) {
    if (!album || !files.length) return;
    setBusy(true);
    setError("");
    let count = 0;
    try {
      for (const file of files) {
        if (
          !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
          file.size > 12 * 1024 * 1024
        )
          throw new Error(`${file.name}: choose JPG, PNG or WebP up to 12 MB.`);
        setProgress(`Uploading ${count + 1} of ${files.length}…`);
        const data = new FormData();
        data.set("images", file);
        await api(`/admin/gallery/${album.id}/images`, {
          method: "POST",
          body: data,
        });
        count++;
      }
      setProgress(`${count} photographs uploaded.`);
    } catch (e) {
      setError(
        `${(e as Error).message} ${count} of ${files.length} photographs uploaded; retry only the remaining files.`,
      );
    } finally {
      setBusy(false);
      refresh();
      if (fileInput.current) fileInput.current.value = "";
    }
  }
  return (
    <Dialog
      title={initial ? "Edit event collection" : "Create event collection"}
      onClose={() => {
        if (!busy && !save.isPending) close();
      }}
      wide
    >
      <div className="dialog-body">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate();
          }}
        >
          <div className="compact-grid">
            <label className="field">
              Event / category name
              <input
                required
                minLength={2}
                maxLength={180}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label className="field">
              Event date (optional)
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
            <label className="field full">
              Introduction (optional)
              <textarea
                maxLength={1000}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>
            <label className="field">
              Display order
              <input
                type="number"
                min={0}
                max={10000}
                value={position}
                onChange={(e) => setPosition(Number(e.target.value))}
              />
            </label>
          </div>
          <div className="gallery-publish-options">
            <label>
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
              />{" "}
              Publish in the gallery
            </label>
            <label>
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
              />{" "}
              Highlight on the homepage
            </label>
          </div>
          <div className="panel-actions">
            <button className="btn btn-gold" disabled={busy || save.isPending}>
              {save.isPending
                ? "Saving…"
                : album
                  ? "Save collection"
                  : "Create collection"}
            </button>
            {save.error && (
              <p role="alert" className="field-error">
                {save.error.message}
              </p>
            )}
          </div>
        </form>
        {album && (
          <>
            <div
              className="gallery-upload"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (!busy) void upload(Array.from(e.dataTransfer.files));
              }}
            >
              <p>Drop photographs here to add to this event.</p>
              <label className="btn btn-ghost">
                {busy ? "Uploading…" : "Choose photographs"}
                <input
                  ref={fileInput}
                  className="sr-only"
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  disabled={busy}
                  onChange={(e) =>
                    void upload(Array.from(e.target.files || []))
                  }
                />
              </label>
              <p className="field-hint">JPG, PNG or WebP · up to 12 MB each</p>
            </div>
            {images.isPending ? (
              <p>Loading photographs…</p>
            ) : images.error ? (
              <p role="alert">{images.error.message}</p>
            ) : (
              <>
                <div className="gallery-admin-images">
                  {images.data?.items.map((image) => (
                    <ImageEditor
                      key={`${image.id}-${image.position}`}
                      image={image}
                      disabled={busy}
                      refresh={refresh}
                    />
                  ))}
                </div>
                <div className="admin-pagination">
                  <button
                    disabled={page === 1 || busy}
                    onClick={() => setPage((v) => v - 1)}
                  >
                    Previous
                  </button>
                  <span>Page {page}</span>
                  <button
                    disabled={page * 24 >= (images.data?.total || 0) || busy}
                    onClick={() => setPage((v) => v + 1)}
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </>
        )}
        {progress && <p role="status">{progress}</p>}
        {error && (
          <p role="alert" className="field-error">
            {error}
          </p>
        )}
      </div>
    </Dialog>
  );
}
function ImageEditor({
  image,
  disabled,
  refresh,
}: {
  image: GalleryImage;
  disabled: boolean;
  refresh: () => void;
}) {
  const [alt, setAlt] = useState(image.altText),
    [position, setPosition] = useState(image.position),
    [confirm, setConfirm] = useState(false),
    [saved, setSaved] = useState(false);
  const mutation = useMutation({
    mutationFn: (remove: boolean) =>
      api(`/admin/gallery/${image.albumId}/images/${image.id}`, {
        method: remove ? "DELETE" : "PATCH",
        ...(remove ? {} : { body: JSON.stringify({ altText: alt, position }) }),
      }),
    onSuccess: () => {
      setConfirm(false);
      setSaved(true);
      refresh();
    },
    onError: () => refresh(),
  });
  return (
    <article className="gallery-image-editor">
      <img
        src={`/api/admin/gallery/${image.albumId}/images/${image.id}?size=thumb`}
        alt={image.altText}
        loading="lazy"
      />
      <label className="field">
        Image description
        <input
          maxLength={180}
          value={alt}
          onChange={(e) => {
            setAlt(e.target.value);
            setSaved(false);
          }}
        />
      </label>
      <label className="field">
        Order (0 is cover)
        <input
          type="number"
          min={0}
          max={100000}
          value={position}
          onChange={(e) => {
            setPosition(Number(e.target.value));
            setSaved(false);
          }}
        />
      </label>
      <div className="row-actions">
        <button
          className="btn btn-ghost"
          disabled={disabled || mutation.isPending || alt.trim().length < 2}
          onClick={() => mutation.mutate(false)}
        >
          Save
        </button>
        <button
          className="text-button danger"
          disabled={disabled || mutation.isPending}
          onClick={() => setConfirm(true)}
        >
          Remove
        </button>
      </div>
      {saved && <p role="status">Saved.</p>}
      {mutation.error && <p role="alert">{mutation.error.message}</p>}
      {confirm && (
        <Dialog
          title="Remove photograph?"
          onClose={() => {
            if (!mutation.isPending) setConfirm(false);
          }}
        >
          <div className="dialog-body">
            <p>
              This photograph will be removed from the gallery and moved to
              Drive trash.
            </p>
          </div>
          <div className="dialog-footer">
            <button
              className="btn btn-ghost"
              disabled={mutation.isPending}
              onClick={() => setConfirm(false)}
            >
              Cancel
            </button>
            <button
              className="btn btn-gold"
              disabled={mutation.isPending}
              onClick={() => mutation.mutate(true)}
            >
              Remove photograph
            </button>
          </div>
        </Dialog>
      )}
    </article>
  );
}
