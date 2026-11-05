"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { api } from "@/lib/api";
import type { EventBooking, MemberEvent } from "@/contracts";
import { Dialog } from "@/components/ui/dialog";

const pageSize = 6;
const publishableKey =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE
    : process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;
const price = (event: MemberEvent) =>
  event.feeCents
    ? new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: event.currency.toUpperCase(),
      }).format(event.feeCents / 100)
    : "Complimentary";

export function MemberEventList() {
  const [clientSecret, setClientSecret] = useState("");
  const [preview, setPreview] = useState<EventBooking | null>(null);
  const [page, setPage] = useState(1);
  const [country, setCountry] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const events = useQuery({
    queryKey: ["member", "events"],
    queryFn: () => api<MemberEvent[]>("/member/events"),
  });
  const bookings = useQuery({
    queryKey: ["member", "event-bookings"],
    queryFn: () => api<EventBooking[]>("/member/event-bookings"),
    refetchInterval: (query) =>
      query.state.data?.some((item) => item.status === "pending")
        ? 3000
        : false,
  });
  const checkout = useMutation({
    mutationFn: (id: string) =>
      api<{ clientSecret?: string; free?: boolean }>(
        `/member/events/${id}/checkout`,
        { method: "POST" },
      ),
    onSuccess: (result) =>
      result.clientSecret
        ? setClientSecret(result.clientSecret)
        : void bookings.refetch(),
  });
  const countries = useMemo(
    () =>
      Array.from(
        new Set(
          (events.data || []).map((event) => event.country).filter(Boolean),
        ),
      ).sort(),
    [events.data],
  );
  const filtered = useMemo(
    () =>
      (events.data || []).filter(
        (event) =>
          (!country || event.country === country) &&
          (!from || event.startsAt.slice(0, 10) >= from) &&
          (!to || event.startsAt.slice(0, 10) <= to),
      ),
    [events.data, country, from, to],
  );
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize)),
    visible = filtered.slice(
      (Math.min(page, pages) - 1) * pageSize,
      Math.min(page, pages) * pageSize,
    ),
    paid =
      bookings.data?.filter((item) =>
        ["paid", "refunded"].includes(item.status),
      ) || [];
  const changeFilter = (apply: () => void) => {
    apply();
    setPage(1);
  };
  if (events.isPending || bookings.isPending)
    return <p role="status">Loading events…</p>;
  if (events.error || bookings.error)
    return (
      <p role="alert" className="field-error">
        {events.error?.message || bookings.error?.message}
      </p>
    );
  return (
    <>
      {clientSecret && stripePromise && (
        <Dialog
          title="Secure event payment"
          onClose={() => setClientSecret("")}
          wide
        >
          <div className="dialog-body stripe-checkout">
            <EmbeddedCheckoutProvider
              stripe={stripePromise}
              options={{ clientSecret }}
            >
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </div>
        </Dialog>
      )}
      {preview && (
        <Dialog
          title={`Invitation · ${preview.event.name}`}
          onClose={() => setPreview(null)}
          wide
        >
          <div className="invitation-preview">
            <iframe
              title={`Invitation for ${preview.event.name}`}
              src={`/api/member/event-bookings/${preview.id}/invitation/preview`}
            />
          </div>
          <div className="dialog-footer">
            <button className="btn btn-ghost" onClick={() => setPreview(null)}>
              Close
            </button>
            <a
              className="btn btn-gold"
              href={`/api/member/event-bookings/${preview.id}/invitation`}
            >
              Download PDF
            </a>
          </div>
        </Dialog>
      )}
      {!!paid.length && (
        <section>
          <div className="list-heading">
            <h2>My invitations</h2>
          </div>
          <div className="issued-list">
            {paid.map((item) => (
              <article className="issued-row" key={item.id}>
                <div>
                  <strong>{item.event.name}</strong>
                  <p>
                    {new Date(item.event.startsAt).toLocaleString()} ·{" "}
                    {item.event.format === "online"
                      ? "Online"
                      : item.event.country}
                  </p>
                  <span className={`status-badge ${item.status === "paid" ? "approved" : "reviewing"}`}>
                    {item.status === "paid" ? "Confirmed" : "Refunded · invitation retained"}
                  </span>
                </div>
                <div className="row-actions">
                  <button
                    className="btn btn-ghost"
                    onClick={() => setPreview(item)}
                  >
                    View invitation
                  </button>
                  <a
                    className="btn btn-gold"
                    href={`/api/member/event-bookings/${item.id}/invitation`}
                  >
                    Download PDF
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
      <section className="member-event-browser">
        <div className="event-browser-heading">
          <div>
            <h2>Upcoming events</h2>
            <p>
              {filtered.length} event{filtered.length === 1 ? "" : "s"}{" "}
              available
            </p>
          </div>
          <button
            className="text-button"
            type="button"
            onClick={() => {
              setCountry("");
              setFrom("");
              setTo("");
              setPage(1);
            }}
          >
            Clear filters
          </button>
        </div>
        <div className="event-filter-bar">
          <label>
            From
            <input
              type="date"
              value={from}
              onChange={(event) =>
                changeFilter(() => setFrom(event.target.value))
              }
            />
          </label>
          <label>
            To
            <input
              type="date"
              min={from || undefined}
              value={to}
              onChange={(event) =>
                changeFilter(() => setTo(event.target.value))
              }
            />
          </label>
          <label>
            Country
            <select
              value={country}
              onChange={(event) =>
                changeFilter(() => setCountry(event.target.value))
              }
            >
              <option value="">All countries</option>
              {countries.map((item) => (
                <option value={item} key={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>
        {!visible.length ? (
          <div className="empty-state">
            <p>No events match these filters.</p>
          </div>
        ) : (
          <div className="event-grid compact-event-grid">
            {visible.map((event) => {
              const own = bookings.data?.find(
                  (item) => item.eventId === event.id,
                ),
                cover = event.images?.[0];
              return (
                <article className="compact-event-card" key={event.id}>
                  {cover ? (
                    <img
                      src={`/api/member/events/${event.id}/images/${cover.id}`}
                      alt={cover.altText || ""}
                    />
                  ) : (
                    <div className="event-card-placeholder">
                      <span>{event.name.charAt(0)}</span>
                    </div>
                  )}
                  <div className="compact-event-content">
                    <div className="event-meta-row">
                      <span>{event.type || "Event"}</span>
                      <span>{event.format}</span>
                    </div>
                    <time>
                      {new Date(event.startsAt).toLocaleString([], {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </time>
                    <h3>{event.name}</h3>
                    <p>
                      {event.format === "online"
                        ? "Online event"
                        : [event.city, event.country]
                            .filter(Boolean)
                            .join(", ")}
                    </p>
                    <div className="compact-event-footer">
                      <strong>{price(event)}</strong>
                      <div className="row-actions">
                        <Link
                          className="btn btn-ghost"
                          href={`/member/events/${event.slug}`}
                        >
                          Details
                        </Link>
                        {own?.status === "paid" || own?.status === "refunded" ? (
                          <button
                            className="btn btn-gold"
                            onClick={() => setPreview(own)}
                          >
                            View invitation
                          </button>
                        ) : (
                          <button
                            className="btn btn-gold"
                            disabled={
                              checkout.isPending ||
                              (event.feeCents > 0 && !stripePromise)
                            }
                            onClick={() => checkout.mutate(event.id)}
                          >
                            {own?.status === "pending" ? "Continue" : "Book"}
                          </button>
                        )}
                      </div>
                    </div>
                    {own && (
                      <span
                        className={`status-badge ${own.status === "paid" ? "approved" : "reviewing"}`}
                      >
                        {own.status}
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
        {pages > 1 && (
          <nav className="event-pagination" aria-label="Event pages">
            <button
              disabled={page <= 1}
              onClick={() => setPage((current) => current - 1)}
            >
              Previous
            </button>
            <span>
              Page {Math.min(page, pages)} of {pages}
            </span>
            <button
              disabled={page >= pages}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </button>
          </nav>
        )}
        {checkout.error && (
          <p role="alert" className="field-error">
            {checkout.error.message}
          </p>
        )}
      </section>
    </>
  );
}
