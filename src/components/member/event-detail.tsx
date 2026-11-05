"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { MemberEvent } from "@/contracts";
export function MemberEventDetail({ slug }: { slug: string }) {
  const query = useQuery({
    queryKey: ["member", "events"],
    queryFn: () => api<MemberEvent[]>("/member/events"),
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
        <Link className="btn btn-ghost" href="/member">
          Return to portal
        </Link>
      </div>
    );
  const event = query.data.find((item) => item.slug === slug);
  if (!event)
    return (
      <div className="empty-state">
        <h1>Event unavailable</h1>
        <p>This event may have been removed or unpublished.</p>
        <Link className="btn btn-ghost" href="/member">
          Return to portal
        </Link>
      </div>
    );
  return (
    <>
      <div className="event-detail-nav">
        <Link className="portal-back" href="/member">
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
            <Link className="btn btn-gold" href="/member">
              Book in member portal
            </Link>
          </aside>
        </div>
      </article>
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
