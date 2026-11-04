import Link from "next/link";
import type { ReactNode } from "react";
import { siteUrl } from "@/lib/seo";
export function PageBanner({
  eyebrow,
  label,
  title,
  description,
  path,
}: {
  eyebrow: ReactNode;
  label: string;
  title: ReactNode;
  description: ReactNode;
  path: string;
}) {
  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl.toString(),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: label,
        item: new URL(path, siteUrl).toString(),
      },
    ],
  };
  return (
    <>
      <section className="page-banner">
        <div className="wrap">
          <p className="eyebrow reveal">{eyebrow}</p>
          <div className="crumbs reveal">
            <Link href="/">Home</Link> / {label}
          </div>
          <h1 className="reveal d1">{title}</h1>
          <p className="lede reveal d2">{description}</p>
        </div>
      </section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbs).replace(/</g, "\\u003c"),
        }}
      />
    </>
  );
}
