import type { Metadata } from "next";
import Link from "next/link";
import { QueryProvider } from "@/components/query-provider";
export const metadata: Metadata = {
  title: "Registrar Admin | Global Lawyers Forum",
  robots: { index: false, follow: false, nocache: true },
};
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <header className="admin-header">
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
        <span>Office of the Registrar</span>
      </header>
      <main className="wrap admin-main">{children}</main>
    </QueryProvider>
  );
}
