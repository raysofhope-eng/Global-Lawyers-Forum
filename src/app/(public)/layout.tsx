import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { JurisdictionStrip } from "@/components/site/jurisdiction-strip";
import { SiteEffects } from "@/components/site/site-effects";
import { organization } from "@/lib/seo";
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="scrollbar" id="scrollbar" aria-hidden="true" />
      <Header />
      <JurisdictionStrip />
      <main id="main">{children}</main>
      <Footer />
      <SiteEffects />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organization).replace(/</g, "\\u003c"),
        }}
      />
    </>
  );
}
