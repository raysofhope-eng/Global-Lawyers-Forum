import Link from "next/link";
import { NewsletterForm } from "./newsletter-form";
export function Footer() {
  return (
    <footer>
      <div className="wrap foot-top">
        <div className="foot-brand">
          <Link className="brand" href="/">
            <img
              className="crest"
              src="/logo-badge-96.png"
              width="40"
              height="40"
              alt="Global Lawyers Forum crest"
            />
            <span className="brand-name">Global Lawyers Forum</span>
          </Link>
          <p>
            A federation of legal professionals across the UK, USA, Pakistan,
            Saudi Arabia, Canada, Turkey, the EU and the UAE, founded to advance
            the rule of law and give the profession one principled voice.
          </p>
          <a className="foot-mail" href="mailto:globallawyersforumuk@gmail.com">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
            >
              <rect x="3" y="5" width="18" height="14" rx="1.5"></rect>
              <path d="M3 7l9 6 9-6"></path>
            </svg>
            globallawyersforumuk@gmail.com
          </a>

          <div
            className="foot-social"
            aria-label="Global Lawyers Forum on social media"
          >
            <a href="#" aria-label="LinkedIn" title="LinkedIn">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM10 9h3.8v1.7h.05c.53-1 1.83-2.05 3.76-2.05 4.02 0 4.76 2.65 4.76 6.1V21H18v-5.6c0-1.34-.02-3.06-1.87-3.06-1.87 0-2.16 1.46-2.16 2.96V21H10z"></path>
              </svg>
            </a>
            <a href="#" aria-label="X (Twitter)" title="X (Twitter)">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M18.9 2H22l-7.6 8.7L23.3 22h-6.9l-5.4-6.6L4.8 22H1.6l8.1-9.3L1 2h7l4.9 6.1zM17.6 20h1.9L7.5 3.9H5.4z"></path>
              </svg>
            </a>
          </div>
        </div>
        <div className="foot-col">
          <h4>Forum</h4>
          <Link href="/mission">Our Charter</Link>
          <Link href="/chairman">Chairman</Link>
          <Link href="/leadership">Governance</Link>
          <Link href="/chapters">Chapters</Link>
        </div>
        <div className="foot-col">
          <h4>Engage</h4>
          <Link href="/membership">Membership</Link>
          <Link href="/events">Events &amp; Summits</Link>
          <Link href="/membership#benefits">Find a Lawyer</Link>
          <Link href="/membership?intent=registrar#apply-form">
            Contact the Registrar
          </Link>
        </div>
        <div className="foot-col">
          <h4>Newsletter</h4>
          <p style={{ color: "var(--text-soft)", fontSize: "14px" }}>
            The Forum's dispatch on the rule of law and cross-border practice.
          </p>
          <NewsletterForm />
        </div>
      </div>
      <div className="wrap foot-bot">
        <span>
          &copy; 2010&ndash;2026 Global Lawyers Forum. All rights reserved.
        </span>
        <span className="dom">globallawyersforum.com</span>
        <span>
          London &middot; New York &middot; Islamabad &middot; Riyadh &middot;
          Toronto &middot; Istanbul &middot; Brussels &middot; Dubai
        </span>
      </div>
    </footer>
  );
}
