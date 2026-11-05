"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { api } from "@/lib/api";
import type { EventBooking, MemberEvent } from "@/contracts";
import { Dialog } from "@/components/ui/dialog";

const publishableKey =
  (process.env.NEXT_PUBLIC_STRIPE_MODE === "test"
    ? process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST
    : (process.env.NODE_ENV === "production"
        ? process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE
        : process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST)) ||
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST ||
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

const price = (event: MemberEvent) =>
  event.feeCents
    ? new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: event.currency.toUpperCase(),
      }).format(event.feeCents / 100)
    : "Complimentary";

export function MemberEventDetail({ slug }: { slug: string }) {
  const [clientSecret, setClientSecret] = useState("");
  const [preview, setPreview] = useState<EventBooking | null>(null);

  const query = useQuery({
    queryKey: ["member", "events"],
    queryFn: () => api<MemberEvent[]>("/member/events"),
  });

  const bookings = useQuery({
    queryKey: ["member", "event-bookings"],
    queryFn: () => api<EventBooking[]>("/member/event-bookings"),
    refetchInterval: (q) =>
      clientSecret && q.state.data?.some((item) => item.status === "pending")
        ? 3000
        : false,
  });

  const event = query.data?.find((item) => item.slug === slug);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("event") === "complete" && bookings.data?.length && event) {
        const found = bookings.data.find(
          (b) => b.eventId === event.id && b.status === "paid",
        );
        if (found && !preview) {
          setPreview(found);
        }
      }
    }
  }, [bookings.data, event, preview]);

  const checkout = useMutation({
    mutationFn: (id: string) =>
      api<{
        clientSecret?: string;
        free?: boolean;
        paid?: boolean;
        booking?: EventBooking;
      }>(`/member/events/${id}/checkout`, { method: "POST" }),
    onSuccess: async (result) => {
      if (result.clientSecret) {
        setClientSecret(result.clientSecret);
      } else {
        const updated = await bookings.refetch();
        if (result.booking) {
          const matched =
            updated.data?.find((b) => b.id === result.booking?.id) ||
            result.booking;
          setPreview(matched);
        }
      }
    },
  });
  if (query.isPending)
    return (
      <div className="empty-state">
        <p role="status">Loading event…</p>
      </div>
    );
  if (query.error)
    return (
      <div className="empty-state">
        <p role="alert" className="field-error">
          {query.error.message}
        </p>
        <Link className="btn btn-ghost" href="/member?tab=events">
          Return to events
        </Link>
      </div>
    );
  if (!event)
    return (
      <div className="empty-state">
        <h1>Event unavailable</h1>
        <p>This event may have been removed or unpublished.</p>
        <Link className="btn btn-ghost" href="/member?tab=events">
          Return to events
        </Link>
      </div>
    );
  return (
    <>
      <div className="event-detail-nav">
        <Link className="portal-back" href="/member?tab=events">
          ← Member events
        </Link>
        <span>
          {event.type || "Member event"} · {event.format}
        </span>
      </div>
      <article className="member-event-detail">
        {!!event.images.length && (
          <div
            className={`member-event-gallery detail-gallery gallery-${Math.min(event.images.length, 3)}`}
          >
            {event.images.slice(0, 3).map((image, index) => (
              <img
                key={image.id}
                src={`/api/member/events/${event.id}/images/${image.id}`}
                alt={image.altText || `${event.name} image ${index + 1}`}
              />
            ))}
          </div>
        )}
        <header>
          <div className="event-meta-row">
            <span>{event.type || "Member event"}</span>
            {event.category && <span>{event.category}</span>}
            <span>{event.format}</span>
          </div>
          <p className="eyebrow">{new Date(event.startsAt).toLocaleString()}</p>
          <h1>{event.name}</h1>
          {event.theme && <p className="event-theme">{event.theme}</p>}
        </header>
        <div className="event-detail-layout">
          <main>
            <div
              className="event-rich-text event-lead"
              dangerouslySetInnerHTML={{ __html: event.description }}
            />
            {event.objectives && (
              <Content title="Objectives" html={event.objectives} />
            )}{" "}
            {!!event.topics.length && (
              <section className="event-detail-block">
                <h2>Main topics</h2>
                <div className="event-topic-grid">
                  {event.topics.map((topic, index) => (
                    <div key={topic.id || index}>
                      <strong>{topic.title}</strong>
                      {topic.description && (
                        <div
                          className="event-rich-text"
                          dangerouslySetInnerHTML={{
                            __html: topic.description,
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
            {!!event.agenda.length && (
              <section className="event-detail-block">
                <h2>Programme</h2>
                <div className="event-agenda">
                  {event.agenda.map((item, index) => (
                    <div key={item.id || index}>
                      <time>
                        {new Date(item.startsAt).toLocaleString([], {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </time>
                      <div>
                        <strong>{item.title}</strong>
                        {item.location && <span>{item.location}</span>}
                        {item.description && (
                          <div
                            className="event-rich-text"
                            dangerouslySetInnerHTML={{
                              __html: item.description,
                            }}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
            {!!event.speakers.length && (
              <section className="event-detail-block">
                <h2>Speakers</h2>
                <div className="event-speakers">
                  {event.speakers.map((speaker, index) => (
                    <div key={speaker.id || index}>
                      <span className="speaker-monogram" aria-hidden="true">
                        {speaker.name.charAt(0)}
                      </span>
                      <div>
                        <strong>{speaker.name}</strong>
                        {(speaker.designation || speaker.organization) && (
                          <span>
                            {[speaker.designation, speaker.organization]
                              .filter(Boolean)
                              .join(" · ")}
                          </span>
                        )}
                        {speaker.bio && (
                          <div
                            className="event-rich-text"
                            dangerouslySetInnerHTML={{ __html: speaker.bio }}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </main>
          <aside>
            <h2>Event information</h2>
            <dl>
              <div>
                <dt>Begins</dt>
                <dd>{new Date(event.startsAt).toLocaleString()}</dd>
              </div>
              <div>
                <dt>Ends</dt>
                <dd>{new Date(event.endsAt).toLocaleString()}</dd>
              </div>
              {event.format !== "online" && (
                <div>
                  <dt>Location</dt>
                  <dd>
                    {event.venue}
                    <br />
                    {event.address}
                    <br />
                    {event.city}, {event.country}
                  </dd>
                </div>
              )}
              <div>
                <dt>Entry</dt>
                <dd>
                  {event.feeCents
                    ? new Intl.NumberFormat(undefined, {
                        style: "currency",
                        currency: event.currency.toUpperCase(),
                      }).format(event.feeCents / 100)
                    : "Complimentary"}
                </dd>
              </div>
              {event.organizer && (
                <div>
                  <dt>Organizer</dt>
                  <dd>{event.organizer}</dd>
                </div>
              )}
            </dl>
            {(() => {
              const booking = bookings.data?.find((b) => b.eventId === event.id);
              const isPaid = booking && ["paid", "refunded"].includes(booking.status);
              const isPending = booking?.status === "pending";
              const paidCount = bookings.data?.filter(
                (b) => b.eventId === event.id && b.status === "paid",
              ).length || 0;
              const isSoldOut = Boolean(event.capacity && paidCount >= event.capacity);

              if (isPaid) {
                return (
                  <div className="detail-booking-status">
                    <span className="status-badge approved" style={{ display: "inline-block", marginBottom: 12 }}>
                      Ticket confirmed
                    </span>
                    {booking.invitationCode && (
                      <p className="detail-invitation-code" style={{ fontSize: "0.85rem", opacity: 0.8, marginBottom: 12 }}>
                        Invitation: <strong>{booking.invitationCode}</strong>
                      </p>
                    )}
                    <button
                      type="button"
                      className="btn btn-gold"
                      style={{ width: "100%" }}
                      onClick={() => setPreview(booking)}
                    >
                      View official invitation
                    </button>
                  </div>
                );
              }

              if (isPending) {
                return (
                  <div className="detail-booking-status">
                    <span className="status-badge reviewing" style={{ display: "inline-block", marginBottom: 8 }}>
                      Payment pending
                    </span>
                    <p style={{ fontSize: "0.85rem", opacity: 0.8, marginBottom: 12 }}>
                      Your reservation is held. Click below to complete checkout.
                    </p>
                    <button
                      type="button"
                      className="btn btn-gold"
                      style={{ width: "100%" }}
                      disabled={checkout.isPending}
                      onClick={() => checkout.mutate(event.id)}
                    >
                      {checkout.isPending ? "Preparing checkout…" : "Complete payment"}
                    </button>
                  </div>
                );
              }

              return (
                <div>
                  <button
                    type="button"
                    className="btn btn-gold"
                    style={{ width: "100%" }}
                    disabled={checkout.isPending || isSoldOut}
                    onClick={() => checkout.mutate(event.id)}
                  >
                    {checkout.isPending
                      ? "Preparing checkout…"
                      : isSoldOut
                        ? "Sold out"
                        : event.feeCents
                          ? `Book seat · ${price(event)}`
                          : "Book complimentary seat"}
                  </button>
                </div>
              );
            })()}
            {checkout.error && (
              <p role="alert" className="field-error" style={{ marginTop: 12 }}>
                {checkout.error.message}
              </p>
            )}
          </aside>
        </div>
      </article>

      {clientSecret && stripePromise && (
        <Dialog
          title="Secure event payment"
          onClose={() => {
            setClientSecret("");
            void bookings.refetch();
          }}
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
          title={`Invitation · ${event.name}`}
          onClose={() => setPreview(null)}
          wide
        >
          <div className="dialog-body">
            <iframe
              src={`/api/member/event-bookings/${preview.id}/invitation/preview`}
              className="invitation-frame"
              title="Official Invitation Preview"
              style={{ width: "100%", height: "550px", border: "none" }}
            />
          </div>
          <div className="dialog-footer">
            <a
              className="btn btn-gold"
              href={`/api/member/event-bookings/${preview.id}/invitation`}
            >
              Download PDF
            </a>
          </div>
        </Dialog>
      )}
    </>
  );
}
function Content({ title, html }: { title: string; html: string }) {
  return (
    <section className="event-detail-block">
      <h2>{title}</h2>
      <div
        className="event-rich-text"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </section>
  );
}
