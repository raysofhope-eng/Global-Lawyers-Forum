import { PageBanner } from "./page-banner";
export function EventsContent() {
  return (
    <>
      <PageBanner
        eyebrow={<>Convenings</>}
        label="Events"
        title={<>Where the Forum meets the profession.</>}
        description={
          <>
            The Global Legal Summit and regional roundtables that put members in
            the room with peers and the bench.
          </>
        }
        path="/events"
      />

      <section className="sec founder" id="events">
        <div className="wrap">
          <div className="events reveal d1">
            <div className="row">
              <div className="date">
                <div className="d">14</div>
                <div className="m">Nov</div>
              </div>
              <div className="info">
                <h3>Inaugural Global Legal Summit</h3>
                <p>
                  Foundational address by the Chairman and the seating of
                  the eight chapters.
                </p>
              </div>
              <div className="loc">London, UK</div>
              <svg
                className="arrow"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12h14M13 6l6 6-6 6"></path>
              </svg>
            </div>
            <div className="row">
              <div className="date">
                <div className="d">05</div>
                <div className="m">Feb</div>
              </div>
              <div className="info">
                <h3>Cross-Border Arbitration Forum</h3>
                <p>
                  Gulf and European practitioners on the future of commercial
                  dispute resolution.
                </p>
              </div>
              <div className="loc">Dubai, UAE</div>
              <svg
                className="arrow"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12h14M13 6l6 6-6 6"></path>
              </svg>
            </div>
            <div className="row">
              <div className="date">
                <div className="d">22</div>
                <div className="m">Apr</div>
              </div>
              <div className="info">
                <h3>Rule of Law Symposium</h3>
                <p>
                  A joint session on judicial independence and the protection of
                  lawyers at risk.
                </p>
              </div>
              <div className="loc">Brussels, EU</div>
              <svg
                className="arrow"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12h14M13 6l6 6-6 6"></path>
              </svg>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
