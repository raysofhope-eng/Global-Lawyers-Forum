import { PageBanner } from "./page-banner";
import { ApplicationForm } from "./application-form";
export function MembershipContent() {
  return (
    <>
      <PageBanner
        eyebrow={<>Membership</>}
        label="Membership"
        title={
          <>
            Take your place in the <em>global forum.</em>
          </>
        }
        description={
          <>
            Whether you are called in London, admitted in New York, enrolled in
            Karachi, licensed in Dubai or qualified in Brussels, there is a seat
            for you at GLF.
          </>
        }
        path="/membership"
      />

      <section className="sec work" id="benefits">
        <div className="wrap">
          <div className="sec-head reveal">
            <p className="eyebrow">What Membership Delivers</p>
            <h2>The standing of an institution, the reach of a network.</h2>
            <p>
              Practical benefits for the working lawyer, and a platform that
              carries the profession's voice further than any single firm can.
            </p>
          </div>
          <div className="benefits reveal d1">
            <article className="benefit">
              <svg
                className="ic"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <path d="M3 21h18M5 21V10l7-5 7 5v11M9 21v-6h6v6"></path>
              </svg>
              <h3>Global Referral Network</h3>
              <p>
                Verified counsel in eight jurisdictions, so you can refer or
                receive instructions with confidence anywhere the Forum reaches.
              </p>
            </article>
            <article className="benefit">
              <svg
                className="ic"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <path d="M12 3l9 4-9 4-9-4 9-4zM3 12l9 4 9-4M3 17l9 4 9-4"></path>
              </svg>
              <h3>Accredited Education</h3>
              <p>
                International seminars, CPD-eligible training and joint
                scholarship across common-law and civil-law systems.
              </p>
            </article>
            <article className="benefit">
              <svg
                className="ic"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <path d="M12 2l3 6 6 .9-4.5 4.4 1 6.2L12 17l-5.5 2.5 1-6.2L3 8.9 9 8z"></path>
              </svg>
              <h3>Recognition &amp; Standing</h3>
              <p>
                Membership certification, delegate invitation letters and the
                credibility of a chartered international body.
              </p>
            </article>
            <article className="benefit">
              <svg
                className="ic"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"></path>
              </svg>
              <h3>Advocacy Platform</h3>
              <p>
                A collective voice on judicial independence, access to justice
                and the pressures facing lawyers worldwide.
              </p>
            </article>
            <article className="benefit">
              <svg
                className="ic"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <circle cx="12" cy="12" r="9"></circle>
                <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"></path>
              </svg>
              <h3>Summits &amp; Convenings</h3>
              <p>
                An annual Global Legal Summit and regional roundtables that put
                you in the room with peers and the bench.
              </p>
            </article>
            <article className="benefit">
              <svg
                className="ic"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <path d="M20 7L9 18l-5-5"></path>
              </svg>
              <h3>Pro Bono &amp; Impact</h3>
              <p>
                Coordinated pro bono initiatives that widen access to justice
                and give members meaningful ways to serve.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="sec" id="tiers">
        <div className="wrap">
          <div className="sec-head reveal">
            <p className="eyebrow">Membership Tiers</p>
            <h2>Choose the level of standing you need.</h2>
          </div>
          <div className="tiers reveal d1" style={{ marginTop: "0" }}>
            <article className="membership-tier">
              <div className="tn">Associate</div>
              <div className="tp">
                Standard <span>/ annual</span>
              </div>
              <ul>
                <li>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                  >
                    <path d="M20 7L9 18l-5-5"></path>
                  </svg>
                  Directory listing &amp; digital certificate
                </li>
                <li>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                  >
                    <path d="M20 7L9 18l-5-5"></path>
                  </svg>
                  Access to the referral network
                </li>
                <li>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                  >
                    <path d="M20 7L9 18l-5-5"></path>
                  </svg>
                  Member-rate seminars &amp; CPD
                </li>
              </ul>
            </article>
            <article className="membership-tier feat">
              <div className="tn">Full Member</div>
              <div className="tp">
                Fellow <span>/ annual</span>
              </div>
              <ul>
                <li>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                  >
                    <path d="M20 7L9 18l-5-5"></path>
                  </svg>
                  Everything in Associate
                </li>
                <li>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                  >
                    <path d="M20 7L9 18l-5-5"></path>
                  </svg>
                  Delegate invitation letters
                </li>
                <li>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                  >
                    <path d="M20 7L9 18l-5-5"></path>
                  </svg>
                  Voting rights within your chapter
                </li>
                <li>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                  >
                    <path d="M20 7L9 18l-5-5"></path>
                  </svg>
                  Summit priority registration
                </li>
              </ul>
            </article>
            <article className="membership-tier">
              <div className="tn">Chambers</div>
              <div className="tp">
                Institutional <span>/ annual</span>
              </div>
              <ul>
                <li>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                  >
                    <path d="M20 7L9 18l-5-5"></path>
                  </svg>
                  Firm &amp; chambers-wide membership
                </li>
                <li>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                  >
                    <path d="M20 7L9 18l-5-5"></path>
                  </svg>
                  Featured directory placement
                </li>
                <li>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                  >
                    <path d="M20 7L9 18l-5-5"></path>
                  </svg>
                  Summit sponsorship pathway
                </li>
              </ul>
            </article>
          </div>
          <div
            className="hero-cta reveal d2"
            style={{ justifyContent: "center", marginTop: "44px" }}
          >
            <a href="#apply-form" className="btn btn-gold" id="ctaApply">
              Apply for Membership
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
            </a>
            <a href="#apply-form" className="btn btn-ghost" id="ctaRegistrar">
              Speak to the Registrar
            </a>
          </div>
        </div>
      </section>

      <section
        className="sec"
        id="apply-form"
        style={{ background: "var(--surface)" }}
      >
        <div className="wrap" style={{ maxWidth: "920px" }}>
          <div className="sec-head reveal">
            <p className="eyebrow">Office of the Registrar</p>
            <h2>Apply for membership, or send the Registrar an enquiry.</h2>
            <p className="lede">
              Complete the form below. Your application reference will appear
              after submission. The Registrar’s office will follow up using the
              email address you provide.
            </p>
          </div>

          <ApplicationForm />
        </div>
      </section>
    </>
  );
}
