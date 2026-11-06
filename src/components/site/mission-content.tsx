import Link from "next/link";
import { PageBanner } from "./page-banner";
export function MissionContent() {
  return (
    <>
      <PageBanner
        eyebrow={<>Our Charter</>}
        label="Mission"
        title={
          <>A profession without frontiers, held together by the rule of law.</>
        }
        description={
          <>
            GLF exists where jurisdictions meet. We convene the lawyers who
            practise across them, and we defend the standards that make
            cross-border justice possible.
          </>
        }
        path="/mission"
      />

      <section className="sec" id="mission">
        <div className="spine"></div>
        <div className="wrap">
          <div className="pillars reveal d1">
            <article className="pillar">
              <span className="idx">I.</span>
              <h3>Uphold the Rule of Law</h3>
              <p>
                We speak for judicial independence and due process, and we stand
                with lawyers who face pressure for doing their duty, in any of
                our jurisdictions and beyond.
              </p>
            </article>
            <article className="pillar">
              <span className="idx">II.</span>
              <h3>Enable Cross-Border Practice</h3>
              <p>
                A working network of counsel across our member jurisdictions, so
                a matter in London, New York, Karachi, Dubai or Brussels never
                has to start from a stranger.
              </p>
            </article>
            <article className="pillar">
              <span className="idx">III.</span>
              <h3>Champion Human Rights</h3>
              <p>
                Access to justice, fair trial and equality before the law are
                not regional ideals. Our advocacy carries them into every forum
                where they are contested.
              </p>
            </article>
            <article className="pillar">
              <span className="idx">IV.</span>
              <h3>Advance Professional Excellence</h3>
              <p>
                Continuing education, international accreditation and shared
                scholarship that keep our members at the front of a
                fast-changing global practice.
              </p>
            </article>
          </div>
          <div
            className="reveal d2"
            style={{ marginTop: "56px", textAlign: "center" }}
          >
            <Link href="/chairman" className="btn btn-ghost">
              Read a Message from the Chairman
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12h14M13 6l6 6-6 6"></path>
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
