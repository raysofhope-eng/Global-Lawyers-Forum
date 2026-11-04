import Link from "next/link";
import { PageBanner } from "./page-banner";
export function FounderContent() {
  return (
    <>
      <PageBanner
        eyebrow={<>The Founding President</>}
        label="Founding President"
        title={<>The law does not stop at a border.</>}
        description={
          <>
            A message from Barrister Muhammad Sohail Anjum, Founder and First
            President of the Global Lawyers Forum.
          </>
        }
        path="/founder"
      />

      <section className="sec founder" id="founder">
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
              <p className="bio">
                As Founder and First President, Barrister Muhammad Sohail Anjum
                brought together practitioners from many legal traditions under
                a single charter. His vision for GLF is a forum that is
                genuinely global in reach yet uncompromising in standard. It is
                meant to be a professional home for lawyers wherever their work
                takes them, and a credible voice for the profession in the
                forums that shape it.
              </p>
              <Link
                href="/leadership"
                className="btn btn-ghost"
                style={{ marginTop: "26px" }}
              >
                Meet the Council
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
    </>
  );
}
