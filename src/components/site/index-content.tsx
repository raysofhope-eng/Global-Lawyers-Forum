import Link from "next/link";
import { JoinCta } from "./join-cta";
export function HomeContent() {
  return (
    <>
      <section className="hero" id="top">
        <canvas id="globe" aria-hidden="true"></canvas>
        <div className="wrap">
          <div>
            <p className="eyebrow hero-eyebrow reveal">
              Eight Jurisdictions &middot; One Global Forum
            </p>
            <h1 className="reveal d1">
              Justice
              <br />
              Without <em>Borders.</em>
            </h1>
            <p className="lede reveal d2">
              The Global Lawyers Forum unites advocates, solicitors and counsel
              across the United Kingdom, United States, Pakistan, Saudi Arabia,
              Canada, Turkey, the European Union and the UAE, standing up for
              the rule of law wherever it is challenged.
            </p>
            <div className="hero-cta reveal d3">
              <Link href="/membership" className="btn btn-gold">
                Become a Member
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
              <Link href="/mission" className="btn btn-ghost">
                Our Mission
              </Link>
            </div>
          </div>
          <aside className="hero-aside reveal d3">
            <img
              className="seal"
              src="/logo-badge-512.png"
              width="150"
              height="150"
              alt="Global Lawyers Forum seal"
              loading="lazy"
            />
            <h4>Office of the Founding President</h4>
            <p>
              Constituted to give the international legal profession a single,
              principled voice that answers to no government and stays faithful
              only to the law.
            </p>
            <div className="sig">
              Barrister Muhammad Sohail Anjum
              <small>Founder &amp; First President, GLF</small>
            </div>
          </aside>
        </div>
      </section>

      <div className="stats">
        <div className="wrap">
          <div className="stat reveal">
            <div className="n" data-count="8">
              8
            </div>
            <div className="l">Founding Jurisdictions</div>
          </div>
          <div className="stat reveal d1">
            <div className="n" data-count="2010">
              2010
            </div>
            <div className="l">Year of Foundation</div>
          </div>
          <div className="stat reveal d2">
            <div className="n" data-count="40" data-suffix="+">
              40+
            </div>
            <div className="l">Practice Areas Represented</div>
          </div>
          <div className="stat reveal d3">
            <div className="n">1</div>
            <div className="l">Unified Global Forum</div>
          </div>
        </div>
      </div>

      <section className="sec" id="explore">
        <div className="wrap">
          <div className="sec-head reveal">
            <p className="eyebrow">Find Your Way In</p>
            <h2>One federation, five ways to explore it.</h2>
            <p className="lede">
              Read our charter, meet the chapters, see who governs the Forum,
              and find out where we convene next.
            </p>
          </div>
          <div className="teasers reveal d1">
            <Link className="teaser" href="/mission">
              <h3>Our Charter</h3>
              <p>
                The four pillars behind GLF, and why a profession without
                frontiers still needs one institution to answer to.
              </p>
              <span className="go">
                Read the Charter
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                >
                  <path d="M5 12h14M13 6l6 6-6 6"></path>
                </svg>
              </span>
            </Link>
            <Link className="teaser" href="/chapters">
              <h3>Eight Chapters</h3>
              <p>
                From London to Dubai, each chapter is rooted in its own legal
                culture and answerable to a shared charter.
              </p>
              <span className="go">
                See the Chapters
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                >
                  <path d="M5 12h14M13 6l6 6-6 6"></path>
                </svg>
              </span>
            </Link>
            <Link className="teaser" href="/leadership">
              <h3>Governance</h3>
              <p>
                A Central Council, a bench of chapter presidents, and an
                advisory body of senior counsel.
              </p>
              <span className="go">
                Meet the Bench
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                >
                  <path d="M5 12h14M13 6l6 6-6 6"></path>
                </svg>
              </span>
            </Link>
            <Link className="teaser" href="/events">
              <h3>Convenings</h3>
              <p>
                The Global Legal Summit and regional roundtables where the Forum
                meets the profession in person.
              </p>
              <span className="go">
                View Events
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                >
                  <path d="M5 12h14M13 6l6 6-6 6"></path>
                </svg>
              </span>
            </Link>
          </div>
        </div>
      </section>

      <section className="sec founder" id="founder-teaser">
        <div className="wrap">
          <div className="grid">
            <div className="reveal">
              <div className="portrait">
                <img
                  className="portrait-img"
                  src="/founder.jpg"
                  alt="Barrister Muhammad Sohail Anjum, Founder and First President of the Global Lawyers Forum"
                  loading="lazy"
                  width="760"
                  height="950"
                />
                <div className="plate">
                  <div className="nm">Barrister Muhammad Sohail Anjum</div>
                  <div className="rl">Founder &amp; First President</div>
                </div>
              </div>
            </div>
            <div className="reveal d1">
              <p className="eyebrow">The Founding President</p>
              <blockquote className="quote" style={{ marginTop: "18px" }}>
                <span className="mark">&ldquo;</span>The law does not stop at a
                border, and neither should the lawyers who serve it. GLF was
                founded so that principle could have an institution behind it.
                <span className="mark">&rdquo;</span>
              </blockquote>
              <div className="by">
                Barrister Muhammad Sohail Anjum, Founder &amp; First President
              </div>
              <Link
                href="/founder"
                className="btn btn-ghost"
                style={{ marginTop: "26px" }}
              >
                Read the Founder's Story
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
        </div>
      </section>

      <JoinCta />
    </>
  );
}
