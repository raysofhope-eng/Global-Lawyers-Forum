import Link from "next/link";
export function JoinCta() {
  return (
    <section className="join" id="membership-cta">
      <div className="wrap">
        <p className="eyebrow reveal">Membership</p>
        <h2 className="reveal d1">
          Take your place in the <em>global forum.</em>
        </h2>
        <p className="reveal d2">
          Whether you are called in London, admitted in New York, enrolled in
          Karachi, licensed in Dubai or qualified in Brussels, there is a seat
          for you at GLF.
        </p>
        <div className="hero-cta reveal d3">
          <Link
            href="/membership?intent=membership#apply-form"
            className="btn btn-gold"
          >
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
          </Link>
          <Link
            href="/membership?intent=registrar#apply-form"
            className="btn btn-ghost"
          >
            Speak to the Registrar
          </Link>
        </div>
      </div>
    </section>
  );
}
