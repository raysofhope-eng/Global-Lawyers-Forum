import Link from "next/link";
export default function NotFound() {
  return (
    <main className="sec wrap">
      <h1>Page not found</h1>
      <p>The page you requested could not be found.</p>
      <Link className="btn btn-gold" href="/">
        Return home
      </Link>
    </main>
  );
}
