"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";
import { useSession } from "@/hooks/use-session";
import type {
  EventAgendaItem,
  EventSpeaker,
  EventTopic,
  MemberEvent,
} from "@/contracts";
import { Dialog } from "@/components/ui/dialog";
import { z } from "zod";

type Booking = {
  id: string;
  status: string;
  feeCents: number;
  currency: string;
  paidAt: string | null;
  application: { name: string; email: string };
};
type TopicInput = Omit<EventTopic, "id">;
type AgendaInput = Omit<EventAgendaItem, "id">;
type SpeakerInput = Omit<EventSpeaker, "id">;
type EventValues = {
  name: string;
  description: string;
  type: string;
  category: string;
  theme: string;
  organizer: string;
  format: "physical" | "online" | "hybrid";
  onlineUrl: string;
  objectives: string;
  startsAt: string;
  endsAt: string;
  venue: string;
  address: string;
  city: string;
  country: string;
  currency: string;
  fee: string;
  capacity: string;
  status: "draft" | "published" | "cancelled";
  topics: TopicInput[];
  agenda: AgendaInput[];
  speakers: SpeakerInput[];
};
const empty: EventValues = {
  name: "",
  description: "",
  type: "",
  category: "",
  theme: "",
  organizer: "",
  format: "physical",
  onlineUrl: "",
  objectives: "",
  startsAt: "",
  endsAt: "",
  venue: "",
  address: "",
  city: "",
  country: "",
  currency: "usd",
  fee: "0",
  capacity: "",
  status: "draft",
  topics: [],
  agenda: [],
  speakers: [],
};
const currencies = ["usd", "gbp", "eur", "pkr", "aed", "sar", "cad", "try"];
const money = (cents: number, currency: string) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
const eventFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, "Enter an event name of at least 3 characters.")
      .max(180),
    description: z
      .string()
      .trim()
      .min(10, "Add at least 10 characters describing the event.")
      .max(30000),
    type: z.string().trim().max(80),
    category: z.string().trim().max(80),
    theme: z.string().trim().max(160),
    organizer: z.string().trim().max(160),
    format: z.enum(["physical", "online", "hybrid"]),
    onlineUrl: z.string().trim().max(500),
    objectives: z.string().trim().max(10000),
    startsAt: z.string().min(1, "Choose a start date and time."),
    endsAt: z.string().min(1, "Choose an end date and time."),
    venue: z.string().trim().max(120),
    address: z.string().trim().max(300),
    city: z.string().trim().max(100),
    country: z.string().trim().max(100),
    currency: z.enum(["usd", "gbp", "eur", "pkr", "aed", "sar", "cad", "try"]),
    fee: z
      .string()
      .refine(
        (value) =>
          value !== "" &&
          Number.isFinite(Number(value)) &&
          Number(value) >= 0 &&
          Number(value) <= 1000000,
        "Enter a valid price between 0 and 1,000,000.",
      ),
    capacity: z
      .string()
      .refine(
        (value) =>
          value === "" ||
          (Number.isInteger(Number(value)) &&
            Number(value) >= 1 &&
            Number(value) <= 1000000),
        "Enter a whole number of at least 1, or leave blank.",
      ),
    status: z.enum(["draft", "published", "cancelled"]),
    topics: z
      .array(
        z.object({
          title: z.string().trim().min(2, "Enter a topic title.").max(180),
          description: z.string().max(3000).nullable(),
        }),
      )
      .max(30),
    agenda: z
      .array(
        z.object({
          title: z.string().trim().min(2, "Enter an activity title.").max(180),
          startsAt: z.string().min(1, "Choose a start time."),
          endsAt: z.string().min(1, "Choose an end time."),
          description: z.string().max(3000).nullable(),
          location: z.string().max(160).nullable(),
        }),
      )
      .max(200),
    speakers: z
      .array(
        z.object({
          name: z.string().trim().min(2, "Enter the speaker name.").max(160),
          designation: z.string().max(180).nullable(),
          organization: z.string().max(180).nullable(),
          bio: z.string().max(5000).nullable(),
        }),
      )
      .max(100),
  })
  .superRefine((value, ctx) => {
    const start = new Date(value.startsAt),
      end = new Date(value.endsAt);
    if (value.startsAt && value.endsAt && end <= start)
      ctx.addIssue({
        code: "custom",
        path: ["endsAt"],
        message: "End date and time must be after the start.",
      });
    if (
      value.format !== "online" &&
      (!value.venue.trim() ||
        !value.address.trim() ||
        !value.city.trim() ||
        !value.country.trim())
    )
      ctx.addIssue({
        code: "custom",
        path: ["venue"],
        message:
          "Complete venue details are required for physical and hybrid events.",
      });
    if (value.format !== "physical") {
      try {
        new URL(value.onlineUrl);
      } catch {
        ctx.addIssue({
          code: "custom",
          path: ["onlineUrl"],
          message: "Enter a valid online event URL.",
        });
      }
    }
    value.agenda.forEach((item, index) => {
      const itemStart = new Date(item.startsAt),
        itemEnd = new Date(item.endsAt);
      if (itemEnd <= itemStart || itemStart < start || itemEnd > end)
        ctx.addIssue({
          code: "custom",
          path: [`agenda-${index}`],
          message: "Activity times must fall within the event schedule.",
        });
    });
  });

export function AdminEvents() {
  const session = useSession(),
    client = useQueryClient();
  const [edit, setEdit] = useState<MemberEvent | null | undefined>();
  const [attendees, setAttendees] = useState<MemberEvent | null>(null);
  const [deleting, setDeleting] = useState<MemberEvent | null>(null);
  const query = useQuery({
    queryKey: ["admin", "events"],
    queryFn: () => api<MemberEvent[]>("/admin/events"),
    enabled: session.data?.role === "admin",
  });
  const remove = useMutation({
    mutationFn: (id: string) =>
      api("/admin/events/" + id, { method: "DELETE" }),
    onSuccess: () => {
      setDeleting(null);
      void client.invalidateQueries({ queryKey: ["admin", "events"] });
    },
  });
  const changeStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: MemberEvent["status"] }) =>
      api(`/admin/events/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: ["admin", "events"] }),
  });
  if (session.isPending) return <p role="status">Checking your session…</p>;
  if (session.error instanceof ApiError && session.error.status === 401)
    return (
      <div className="empty-state">
        <p>Administrator sign-in required.</p>
        <Link className="btn btn-gold" href="/admin">
          Sign in
        </Link>
      </div>
    );
  const events = query.data || [],
    published = events.filter((item) => item.status === "published").length;
  return (
    <>
      <div className="workspace-heading">
        <div>
          <p className="eyebrow">Event operations</p>
          <h1>Events</h1>
          <p>Publish events, manage capacity and review paid invitations.</p>
        </div>
        <div className="row-actions">
          <Link className="btn btn-ghost" href="/admin">
            Members
          </Link>
          <button className="btn btn-gold" onClick={() => setEdit(null)}>
            Create event
          </button>
        </div>
      </div>
      <div className="event-summary">
        <div>
          <strong>{events.length}</strong>
          <span>Total events</span>
        </div>
        <div>
          <strong>{published}</strong>
          <span>Published</span>
        </div>
        <div>
          <strong>
            {events.reduce((sum, item) => sum + (item.capacity || 0), 0) || "—"}
          </strong>
          <span>Configured seats</span>
        </div>
      </div>
      {query.isPending ? (
        <div className="empty-state">
          <p role="status">Loading events…</p>
        </div>
      ) : query.error ? (
        <div className="empty-state">
          <p className="field-error">{query.error.message}</p>
          <button className="btn btn-ghost" onClick={() => query.refetch()}>
            Retry
          </button>
        </div>
      ) : events.length ? (
        <div className="admin-table-wrap">
          <table className="admin-table compact-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Schedule</th>
                <th>Location</th>
                <th>Ticket</th>
                <th>Status</th>
                <th>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id}>
                  <td>
                    <strong>{event.name}</strong>
                    <span className="table-secondary">
                      {event.capacity
                        ? `${event.capacity} seats`
                        : "Open capacity"}
                    </span>
                  </td>
                  <td>
                    {new Date(event.startsAt).toLocaleDateString()}
                    <span className="table-secondary">
                      {new Date(event.startsAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </td>
                  <td>
                    {event.venue}
                    <span className="table-secondary">
                      {event.city}, {event.country}
                    </span>
                  </td>
                  <td>
                    {event.feeCents
                      ? money(event.feeCents, event.currency)
                      : "Complimentary"}
                  </td>
                  <td>
                    <select
                      className={`event-status-select ${event.status}`}
                      aria-label={`Status for ${event.name}`}
                      value={event.status}
                      disabled={changeStatus.isPending}
                      onChange={(input) => changeStatus.mutate({ id: event.id, status: input.target.value as MemberEvent["status"] })}
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="text-button"
                        onClick={() => setAttendees(event)}
                      >
                        Bookings
                      </button>
                      <button
                        className="text-button"
                        onClick={() => setEdit(event)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-button danger"
                        onClick={() => setDeleting(event)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state event-empty">
          <h2>No events yet</h2>
          <p>Create a draft, add ticket details, then publish it when ready.</p>
          <button className="btn btn-gold" onClick={() => setEdit(null)}>
            Create first event
          </button>
        </div>
      )}
      {edit !== undefined && (
        <EventForm
          event={edit}
          close={() => setEdit(undefined)}
          done={() => {
            setEdit(undefined);
            void query.refetch();
          }}
        />
      )}
      {attendees && (
        <Bookings event={attendees} close={() => setAttendees(null)} />
      )}
      {deleting && (
        <Dialog
          title={
            deleting.status === "published"
              ? "Cancel this event?"
              : "Delete this event?"
          }
          onClose={() => !remove.isPending && setDeleting(null)}
        >
          <div className="dialog-body">
            <p>
              <strong>{deleting.name}</strong>{" "}
              {deleting.status === "published"
                ? "will be cancelled if bookings exist, and affected members will be notified."
                : "will be permanently removed if it has no bookings."}
            </p>
            {remove.error && (
              <p className="field-error">{remove.error.message}</p>
            )}
          </div>
          <div className="dialog-footer">
            <button
              className="btn btn-ghost"
              disabled={remove.isPending}
              onClick={() => setDeleting(null)}
            >
              Keep event
            </button>
            <button
              className="btn btn-danger"
              disabled={remove.isPending}
              onClick={() => remove.mutate(deleting.id)}
            >
              {remove.isPending
                ? "Processing…"
                : deleting.status === "published"
                  ? "Cancel event"
                  : "Delete event"}
            </button>
          </div>
        </Dialog>
      )}
    </>
  );
}

function Field({
  label,
  hint,
  error,
  required,
  wide,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <label
      className={`event-field${wide ? " event-field-wide" : ""}${error ? " has-error" : ""}`}
    >
      <span>
        {label}
        {required && <b aria-hidden="true"> *</b>}
      </span>
      {children}
      {error ? (
        <small className="event-field-error">{error}</small>
      ) : (
        hint && <small>{hint}</small>
      )}
    </label>
  );
}

function RichTextEditor({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  const editor = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (editor.current && editor.current.innerHTML !== value)
      editor.current.innerHTML = value;
  }, [value]);
  const command = (name: string, argument?: string) => {
    editor.current?.focus();
    document.execCommand(name, false, argument);
    onChange(editor.current?.innerHTML || "");
  };
  return (
    <div className="rich-editor">
      <div
        className="rich-toolbar"
        role="toolbar"
        aria-label={`${label} formatting`}
      >
        <button type="button" onClick={() => command("bold")}>
          <strong>B</strong>
        </button>
        <button type="button" onClick={() => command("italic")}>
          <em>I</em>
        </button>
        <button type="button" onClick={() => command("formatBlock", "h3")}>
          Heading
        </button>
        <button type="button" onClick={() => command("insertUnorderedList")}>
          Bullets
        </button>
        <button type="button" onClick={() => command("insertOrderedList")}>
          Numbered
        </button>
        <button type="button" onClick={() => command("removeFormat")}>
          Clear
        </button>
      </div>
      <div
        ref={editor}
        className="rich-content"
        contentEditable
        role="textbox"
        aria-multiline="true"
        aria-label={label}
        onInput={(event) => onChange(event.currentTarget.innerHTML)}
        suppressContentEditableWarning
      />
    </div>
  );
}

function EventForm({
  event,
  close,
  done,
}: {
  event: MemberEvent | null;
  close: () => void;
  done: () => void;
}) {
  const initial = useMemo<EventValues>(
    () =>
      event
        ? {
            name: event.name,
            description: event.description,
            type: event.type || "",
            category: event.category || "",
            theme: event.theme || "",
            organizer: event.organizer || "",
            format: event.format || "physical",
            onlineUrl: event.onlineUrl || "",
            objectives: event.objectives || "",
            startsAt: event.startsAt.slice(0, 16),
            endsAt: event.endsAt.slice(0, 16),
            venue: event.venue,
            address: event.address,
            city: event.city,
            country: event.country,
            currency: event.currency,
            fee: String(event.feeCents / 100),
            capacity: event.capacity ? String(event.capacity) : "",
            status: event.status,
            topics: (event.topics || []).map(({ title, description }) => ({
              title,
              description,
            })),
            agenda: (event.agenda || []).map(
              ({ title, startsAt, endsAt, description, location }) => ({
                title,
                startsAt: startsAt.slice(0, 16),
                endsAt: endsAt.slice(0, 16),
                description,
                location,
              }),
            ),
            speakers: (event.speakers || []).map(
              ({ name, designation, organization, bio }) => ({
                name,
                designation,
                organization,
                bio,
              }),
            ),
          }
        : empty,
    [event],
  );
  const [values, setValues] = useState(initial),
    [images, setImages] = useState<File[]>([]),
    [existingImages, setExistingImages] = useState(event?.images || []),
    [previews, setPreviews] = useState<string[]>([]),
    [error, setError] = useState(""),
    [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  useEffect(() => {
    const urls = images.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach(URL.revokeObjectURL);
  }, [images]);
  const set =
    (key: keyof EventValues) =>
    (
      e: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      setValues((current) => ({ ...current, [key]: e.target.value }));
      setFieldErrors((current) => {
        const next = { ...current };
        delete next[key];
        return next;
      });
    };
  const updateList = <K extends "topics" | "agenda" | "speakers">(
    key: K,
    index: number,
    field: string,
    value: string,
  ) =>
    setValues((current) => ({
      ...current,
      [key]: current[key].map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ) as EventValues[K],
    }));
  const removeList = (key: "topics" | "agenda" | "speakers", index: number) =>
    setValues((current) => ({
      ...current,
      [key]: current[key].filter((_, itemIndex) => itemIndex !== index),
    }));
  const mutation = useMutation({
    mutationFn: async () => {
      setError("");
      const payload = {
        ...values,
        type: values.type || null,
        category: values.category || null,
        theme: values.theme || null,
        organizer: values.organizer || null,
        onlineUrl: values.onlineUrl || null,
        objectives: values.objectives || null,
        startsAt: new Date(values.startsAt).toISOString(),
        endsAt: new Date(values.endsAt).toISOString(),
        agenda: values.agenda.map((item) => ({
          ...item,
          startsAt: new Date(item.startsAt).toISOString(),
          endsAt: new Date(item.endsAt).toISOString(),
        })),
        feeCents: Math.round(Number(values.fee) * 100),
        capacity: values.capacity ? Number(values.capacity) : null,
      };
      const saved = await api<MemberEvent>(
        event ? `/admin/events/${event.id}` : "/admin/events",
        { method: event ? "PATCH" : "POST", body: JSON.stringify(payload) },
      );
      if (images.length) {
        const form = new FormData();
        images.forEach((file) => form.append("images", file));
        await api(`/admin/events/${saved.id}/images`, {
          method: "POST",
          body: form,
        });
      }
      return saved;
    },
    onSuccess: done,
    onError: (e) => setError(e.message),
  });
  const deleteImage = useMutation({
    mutationFn: (imageId: string) =>
      api(`/admin/events/${event!.id}/images/${imageId}`, { method: "DELETE" }),
    onSuccess: (_, imageId) =>
      setExistingImages((current) =>
        current.filter((image) => image.id !== imageId),
      ),
    onError: (e) => setError(e.message),
  });
  const submit = () => {
    const result = eventFormSchema.safeParse(values);
    if (!result.success) {
      const next: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = String(issue.path[0] || "form");
        if (!next[key]) next[key] = issue.message;
      }
      setFieldErrors(next);
      setError("Please correct the highlighted fields.");
      setTimeout(
        () =>
          document
            .querySelector<HTMLElement>(
              ".event-field.has-error input,.event-field.has-error textarea,.event-field.has-error select",
            )
            ?.focus(),
        0,
      );
      return;
    }
    setFieldErrors({});
    mutation.mutate();
  };
  return (
    <Dialog
      title={event ? "Edit event" : "Create event"}
      onClose={() => !mutation.isPending && close()}
    >
      <form
        className="event-editor"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <div className="dialog-body event-editor-body">
          <section className="event-form-section">
            <div className="event-section-heading">
              <span>01</span>
              <div>
                <h3>Event identity</h3>
                <p>The primary name members see before booking.</p>
              </div>
            </div>
            <div className="event-form-grid">
              <Field label="Event name" required wide error={fieldErrors.name}>
                <input
                  autoFocus
                  aria-invalid={!!fieldErrors.name}
                  maxLength={180}
                  placeholder="e.g. International Rule of Law Summit"
                  value={values.name}
                  onChange={set("name")}
                />
              </Field>
            </div>
          </section>
          <section className="event-form-section">
            <div className="event-section-heading">
              <span>02</span>
              <div>
                <h3>Schedule & location</h3>
                <p>Use the venue’s local date and time.</p>
              </div>
            </div>
            <div className="event-form-grid">
              <Field label="Starts" required error={fieldErrors.startsAt}>
                <input
                  aria-invalid={!!fieldErrors.startsAt}
                  type="datetime-local"
                  value={values.startsAt}
                  onChange={set("startsAt")}
                />
              </Field>
              <Field label="Ends" required error={fieldErrors.endsAt}>
                <input
                  aria-invalid={!!fieldErrors.endsAt}
                  type="datetime-local"
                  min={values.startsAt || undefined}
                  value={values.endsAt}
                  onChange={set("endsAt")}
                />
              </Field>
              <Field label="Venue" required error={fieldErrors.venue}>
                <input
                  aria-invalid={!!fieldErrors.venue}
                  maxLength={120}
                  placeholder="Venue or building"
                  value={values.venue}
                  onChange={set("venue")}
                />
              </Field>
              <Field
                label="Street address"
                required
                error={fieldErrors.address}
              >
                <input
                  aria-invalid={!!fieldErrors.address}
                  maxLength={300}
                  placeholder="Street and area"
                  value={values.address}
                  onChange={set("address")}
                />
              </Field>
              <Field label="City" required error={fieldErrors.city}>
                <input
                  aria-invalid={!!fieldErrors.city}
                  maxLength={100}
                  placeholder="City"
                  value={values.city}
                  onChange={set("city")}
                />
              </Field>
              <Field label="Country" required error={fieldErrors.country}>
                <input
                  aria-invalid={!!fieldErrors.country}
                  maxLength={100}
                  placeholder="Country"
                  value={values.country}
                  onChange={set("country")}
                />
              </Field>
            </div>
          </section>
          <section className="event-form-section">
            <div className="event-section-heading">
              <span>03</span>
              <div>
                <h3>Tickets & publishing</h3>
                <p>Set the price, availability and visibility.</p>
              </div>
            </div>
            <div className="event-form-grid event-ticket-grid">
              <Field
                label="Ticket price"
                required
                error={fieldErrors.fee || fieldErrors.currency}
                hint="Use 0 for a complimentary event."
              >
                <div className="money-input">
                  <select
                    aria-label="Currency"
                    aria-invalid={!!fieldErrors.currency}
                    value={values.currency}
                    onChange={set("currency")}
                  >
                    {currencies.map((item) => (
                      <option key={item} value={item}>
                        {item.toUpperCase()}
                      </option>
                    ))}
                  </select>
                  <input
                    aria-invalid={!!fieldErrors.fee}
                    min="0"
                    max="1000000"
                    step="0.01"
                    inputMode="decimal"
                    type="number"
                    value={values.fee}
                    onChange={set("fee")}
                  />
                </div>
              </Field>
              <Field
                label="Capacity"
                error={fieldErrors.capacity}
                hint="Leave blank for unlimited bookings."
              >
                <input
                  aria-invalid={!!fieldErrors.capacity}
                  min="1"
                  max="1000000"
                  step="1"
                  type="number"
                  placeholder="Unlimited"
                  value={values.capacity}
                  onChange={set("capacity")}
                />
              </Field>
              <Field
                label="Status"
                error={fieldErrors.status}
                hint="Draft events are hidden from members."
              >
                <select
                  aria-invalid={!!fieldErrors.status}
                  value={values.status}
                  onChange={set("status")}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </Field>
              <Field
                label="Event gallery"
                hint="Select several files together, or add more with another selection. Maximum 10 images."
              >
                <div
                  className={`event-upload${previews.length ? " has-preview" : ""}`}
                >
                  {previews.length ? (
                    <div className="event-upload-previews">
                      {previews.slice(0, 4).map((src, index) => (
                        <img src={src} alt="" key={src} />
                      ))}
                    </div>
                  ) : (
                    <span aria-hidden="true">+</span>
                  )}
                  <div>
                    <strong>
                      {images.length
                        ? `${images.length} image${images.length === 1 ? "" : "s"} selected`
                        : event?.hasImage
                          ? "Add more images"
                          : "Choose images"}
                    </strong>
                    <small>Recommended landscape images</small>
                  </div>
                  <input
                    multiple
                    type="file"
                    accept="image/jpeg,image/png"
                    aria-label="Choose event gallery images"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      if (
                        existingImages.length + images.length + files.length > 10 ||
                        files.some((file) => file.size > 12 * 1024 * 1024)
                      ) {
                        setError(
                          "Choose up to 10 images, each no larger than 12 MB.",
                        );
                        e.target.value = "";
                        return;
                      }
                      setImages((current) => [...current, ...files]);
                      e.target.value = "";
                    }}
                  />
                </div>
              </Field>
            </div>
          </section>
          <section className="event-form-section">
            <div className="event-section-heading">
              <span>04</span>
              <div>
                <h3>Format & presentation</h3>
                <p>
                  Classify the event and prepare polished member-facing content.
                </p>
              </div>
            </div>
            <div className="event-form-grid">
              <Field label="Event type">
                <input
                  maxLength={80}
                  placeholder="Conference, workshop, forum…"
                  value={values.type}
                  onChange={set("type")}
                />
              </Field>
              <Field label="Category">
                <input
                  maxLength={80}
                  placeholder="International law"
                  value={values.category}
                  onChange={set("category")}
                />
              </Field>
              <Field label="Theme">
                <input
                  maxLength={160}
                  placeholder="Justice without borders"
                  value={values.theme}
                  onChange={set("theme")}
                />
              </Field>
              <Field label="Organizer">
                <input
                  maxLength={160}
                  placeholder="Global Lawyers Forum"
                  value={values.organizer}
                  onChange={set("organizer")}
                />
              </Field>
              <Field label="Event format" required>
                <select value={values.format} onChange={set("format")}>
                  <option value="physical">Physical</option>
                  <option value="online">Online</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </Field>
              {values.format !== "physical" && (
                <Field
                  label="Online event URL"
                  required
                  error={fieldErrors.onlineUrl}
                >
                  <input
                    type="url"
                    maxLength={500}
                    placeholder="https://…"
                    value={values.onlineUrl}
                    onChange={set("onlineUrl")}
                  />
                </Field>
              )}
              <Field
                label="Formatted description"
                required
                wide
                error={fieldErrors.description}
              >
                <RichTextEditor
                  label="Event description"
                  value={values.description}
                  onChange={(description) =>
                    setValues((current) => ({ ...current, description }))
                  }
                />
              </Field>
              <Field
                label="Event objectives"
                wide
                hint="Optional outcomes attendees should gain."
              >
                <RichTextEditor
                  label="Event objectives"
                  value={values.objectives}
                  onChange={(objectives) =>
                    setValues((current) => ({ ...current, objectives }))
                  }
                />
              </Field>
            </div>
          </section>
          <section className="event-form-section">
            <div className="event-section-heading">
              <span>05</span>
              <div>
                <h3>Topics</h3>
                <p>Optional focus areas with supporting detail.</p>
              </div>
            </div>
            <div className="repeat-list">
              {values.topics.map((topic, index) => (
                <div className="repeat-card" key={index}>
                  <div className="repeat-card-head">
                    <strong>Topic {index + 1}</strong>
                    <button
                      type="button"
                      onClick={() => removeList("topics", index)}
                    >
                      Remove
                    </button>
                  </div>
                  <div className="event-form-grid">
                    <Field label="Topic title" required>
                      <input
                        maxLength={180}
                        value={topic.title}
                        onChange={(e) =>
                          updateList("topics", index, "title", e.target.value)
                        }
                      />
                    </Field>
                    <Field label="Description">
                      <textarea
                        maxLength={3000}
                        rows={2}
                        value={topic.description || ""}
                        onChange={(e) =>
                          updateList(
                            "topics",
                            index,
                            "description",
                            e.target.value,
                          )
                        }
                      />
                    </Field>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="add-row-button"
              onClick={() =>
                setValues((current) => ({
                  ...current,
                  topics: [...current.topics, { title: "", description: null }],
                }))
              }
            >
              + Add topic
            </button>
          </section>
          <section className="event-form-section">
            <div className="event-section-heading">
              <span>06</span>
              <div>
                <h3>Programme schedule</h3>
                <p>
                  Optional activities; times must remain inside the event
                  schedule.
                </p>
              </div>
            </div>
            <div className="repeat-list">
              {values.agenda.map((item, index) => (
                <div className="repeat-card" key={index}>
                  <div className="repeat-card-head">
                    <strong>Activity {index + 1}</strong>
                    <button
                      type="button"
                      onClick={() => removeList("agenda", index)}
                    >
                      Remove
                    </button>
                  </div>
                  <div className="event-form-grid">
                    <Field
                      label="Activity"
                      required
                      error={fieldErrors[`agenda-${index}`]}
                    >
                      <input
                        maxLength={180}
                        value={item.title}
                        onChange={(e) =>
                          updateList("agenda", index, "title", e.target.value)
                        }
                      />
                    </Field>
                    <Field label="Location / room">
                      <input
                        maxLength={160}
                        value={item.location || ""}
                        onChange={(e) =>
                          updateList(
                            "agenda",
                            index,
                            "location",
                            e.target.value,
                          )
                        }
                      />
                    </Field>
                    <Field label="Starts" required>
                      <input
                        type="datetime-local"
                        min={values.startsAt || undefined}
                        max={values.endsAt || undefined}
                        value={item.startsAt}
                        onChange={(e) =>
                          updateList(
                            "agenda",
                            index,
                            "startsAt",
                            e.target.value,
                          )
                        }
                      />
                    </Field>
                    <Field label="Ends" required>
                      <input
                        type="datetime-local"
                        min={item.startsAt || values.startsAt || undefined}
                        max={values.endsAt || undefined}
                        value={item.endsAt}
                        onChange={(e) =>
                          updateList("agenda", index, "endsAt", e.target.value)
                        }
                      />
                    </Field>
                    <Field label="Description" wide>
                      <textarea
                        maxLength={3000}
                        rows={2}
                        value={item.description || ""}
                        onChange={(e) =>
                          updateList(
                            "agenda",
                            index,
                            "description",
                            e.target.value,
                          )
                        }
                      />
                    </Field>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="add-row-button"
              onClick={() =>
                setValues((current) => ({
                  ...current,
                  agenda: [
                    ...current.agenda,
                    {
                      title: "",
                      startsAt: current.startsAt,
                      endsAt: current.endsAt,
                      description: null,
                      location: null,
                    },
                  ],
                }))
              }
            >
              + Add schedule activity
            </button>
          </section>
          <section className="event-form-section">
            <div className="event-section-heading">
              <span>07</span>
              <div>
                <h3>Speakers</h3>
                <p>Optional speakers, panelists and moderators.</p>
              </div>
            </div>
            <div className="repeat-list">
              {values.speakers.map((speaker, index) => (
                <div className="repeat-card" key={index}>
                  <div className="repeat-card-head">
                    <strong>Speaker {index + 1}</strong>
                    <button
                      type="button"
                      onClick={() => removeList("speakers", index)}
                    >
                      Remove
                    </button>
                  </div>
                  <div className="event-form-grid">
                    <Field label="Full name" required>
                      <input
                        maxLength={160}
                        value={speaker.name}
                        onChange={(e) =>
                          updateList("speakers", index, "name", e.target.value)
                        }
                      />
                    </Field>
                    <Field label="Designation">
                      <input
                        maxLength={180}
                        value={speaker.designation || ""}
                        onChange={(e) =>
                          updateList(
                            "speakers",
                            index,
                            "designation",
                            e.target.value,
                          )
                        }
                      />
                    </Field>
                    <Field label="Organization">
                      <input
                        maxLength={180}
                        value={speaker.organization || ""}
                        onChange={(e) =>
                          updateList(
                            "speakers",
                            index,
                            "organization",
                            e.target.value,
                          )
                        }
                      />
                    </Field>
                    <Field label="Biography">
                      <textarea
                        maxLength={5000}
                        rows={2}
                        value={speaker.bio || ""}
                        onChange={(e) =>
                          updateList("speakers", index, "bio", e.target.value)
                        }
                      />
                    </Field>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="add-row-button"
              onClick={() =>
                setValues((current) => ({
                  ...current,
                  speakers: [
                    ...current.speakers,
                    {
                      name: "",
                      designation: null,
                      organization: null,
                      bio: null,
                    },
                  ],
                }))
              }
            >
              + Add speaker
            </button>
          </section>
          {!!event && !!existingImages.length && (
            <section className="event-form-section">
              <div className="event-section-heading">
                <span>08</span>
                <div>
                  <h3>Current gallery</h3>
                  <p>
                    Remove images that should no longer appear on the event.
                  </p>
                </div>
              </div>
              <div className="existing-event-gallery">
                {existingImages.map((image, index) => (
                  <div key={image.id}>
                    <img
                      src={`/api/admin/events/${event.id}/images/${image.id}`}
                      alt={
                        image.altText ||
                        `${event.name} gallery image ${index + 1}`
                      }
                    />
                    <button
                      type="button"
                      disabled={deleteImage.isPending}
                      onClick={() => deleteImage.mutate(image.id)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}
          {(error || mutation.error) && (
            <p className="event-form-error" role="alert">
              {error || mutation.error?.message}
            </p>
          )}
        </div>
        <div className="dialog-footer event-editor-footer">
          <span>
            {event
              ? "Changes affect the event listing; paid invitations retain their original details."
              : "Save as draft if the event is not ready to publish."}
          </span>
          <div>
            <button
              type="button"
              className="btn btn-ghost"
              disabled={mutation.isPending}
              onClick={close}
            >
              Cancel
            </button>
            <button className="btn btn-gold" disabled={mutation.isPending}>
              {mutation.isPending
                ? "Saving…"
                : event
                  ? "Save changes"
                  : "Create event"}
            </button>
          </div>
        </div>
      </form>
    </Dialog>
  );
}

function Bookings({ event, close }: { event: MemberEvent; close: () => void }) {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<Booking | null>(null);
  const [notice, setNotice] = useState("");
  const query = useQuery({
    queryKey: ["admin", "event-bookings", event.id],
    queryFn: () => api<Booking[]>(`/admin/events/${event.id}/bookings`),
  });
  const refund = useMutation({
    mutationFn: ({ id, cancelBooking }: { id: string; cancelBooking: boolean }) =>
      api<{ status: "refunded" | "cancelled"; refundId: string }>(`/admin/bookings/${id}/refund`, {
        method: "POST",
        body: JSON.stringify({ cancelBooking }),
      }),
    onSuccess: (result, variables) => {
      queryClient.setQueryData<Booking[]>(
        ["admin", "event-bookings", event.id],
        (current) => current?.map((booking) => booking.id === variables.id ? { ...booking, status: result.status } : booking),
      );
      setNotice(result.status === "cancelled" ? `Refund confirmed. The booking and invitation were cancelled. Stripe reference: ${result.refundId}` : `Refund confirmed. The booking and invitation remain valid. Stripe reference: ${result.refundId}`);
      setSelected(null);
      void query.refetch();
    },
  });
  return (
    <>
      <Dialog title={`${event.name} · Bookings`} onClose={close} wide>
        <div className="dialog-body">
          {notice && <p className="inline-success refund-notice" role="status">{notice}</p>}
          {query.isPending ? (
            <p role="status">Loading bookings…</p>
          ) : query.data?.length ? (
            <div className="admin-table-wrap">
              <table className="admin-table compact-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Status</th>
                    <th>Paid</th>
                    <th>Date</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {query.data.map((booking) => (
                    <tr key={booking.id}>
                      <td>
                        <strong>{booking.application.name}</strong>
                        <span className="table-secondary">
                          {booking.application.email}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`status-badge ${booking.status === "paid" ? "approved" : booking.status === "refunded" ? "rejected" : "reviewing"}`}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td>{money(booking.feeCents, booking.currency)}</td>
                      <td>
                        {booking.paidAt
                          ? new Date(booking.paidAt).toLocaleDateString()
                          : "—"}
                      </td>
                      <td>
                        {booking.status === "paid" && booking.feeCents > 0 && (
                          <button
                            className="text-button danger"
                            onClick={() => setSelected(booking)}
                          >
                            Refund
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <p>No bookings yet.</p>
            </div>
          )}
        </div>
      </Dialog>
      {selected && (
        <Dialog
          title="Confirm refund"
          onClose={() => !refund.isPending && setSelected(null)}
        >
          <div className="dialog-body">
            <p>
              Refund{" "}
              <strong>{money(selected.feeCents, selected.currency)}</strong> to{" "}
              <strong>{selected.application.name}</strong>? Stripe will return
              the funds to the original payment method.
            </p>
            <p className="field-hint">
              Choose whether the member keeps their confirmed place and invitation,
              or whether the booking should also be cancelled.
            </p>
            {refund.error && (
              <p className="field-error">{refund.error.message}</p>
            )}
          </div>
          <div className="dialog-footer">
            <button
              className="btn btn-ghost"
              onClick={() => setSelected(null)}
              disabled={refund.isPending}
            >
              Back
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => refund.mutate({ id: selected.id, cancelBooking: false })}
              disabled={refund.isPending}
            >
              {refund.isPending ? "Processing…" : "Refund only · keep invitation"}
            </button>
            <button
              className="btn btn-danger"
              onClick={() => refund.mutate({ id: selected.id, cancelBooking: true })}
              disabled={refund.isPending}
            >
              {refund.isPending ? "Processing…" : "Refund & cancel booking"}
            </button>
          </div>
        </Dialog>
      )}
    </>
  );
}
