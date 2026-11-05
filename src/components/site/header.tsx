"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
const links = ["Mission", "Chapters", "Leadership", "Events", "Membership"];
export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, []);
  function toggleTheme() {
    const root = document.documentElement;
    const current =
      root.dataset.theme ||
      (matchMedia("(prefers-color-scheme:dark)").matches ? "dark" : "light");
    const next = current === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem("gla-theme", next);
    } catch {}
  }
  const nav = links.map((label) => (
    <Link
      key={label}
      href={`/${label.toLowerCase()}`}
      aria-current={pathname === `/${label.toLowerCase()}` ? "page" : undefined}
      onClick={() => setOpen(false)}
    >
      {label}
    </Link>
  ));
  return (
    <header className="nav">
      <div className="wrap nav-inner">
        <Link className="brand" href="/" aria-label="Global Lawyers Forum home">
          <img
            className="crest"
            src="/logo-badge-96.png"
            width="40"
            height="40"
            alt="Global Lawyers Forum crest"
          />
          <span>
            <span className="brand-name">Global Lawyers Forum</span>
            <span className="brand-sub" style={{ display: "block" }}>
              Justice Without Borders
            </span>
          </span>
        </Link>
        <nav className="links" aria-label="Primary">
          {nav}
        </nav>
        <button
          className="themebtn nav-cta"
          onClick={toggleTheme}
          aria-label="Toggle colour theme"
          title="Toggle theme"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <circle cx="12" cy="12" r="4.5" />
            <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19" />
          </svg>
        </button>
        <Link href="/membership#apply-form" className="btn btn-gold nav-cta">
          Join the Forum
        </Link>
        <Link href="/login" className="nav-login nav-cta">
          Member sign in
        </Link>
        <button
          className="menu-toggle"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobileMenu"
          onClick={() => setOpen((v) => !v)}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
      </div>
      <div className={`mobile-menu${open ? " open" : ""}`} id="mobileMenu">
        <nav aria-label="Mobile primary">{nav}</nav>
        <Link
          href="/membership#apply-form"
          className="btn btn-gold"
          onClick={() => setOpen(false)}
        >
          Join the Forum
        </Link>
        <Link href="/login" className="nav-login" onClick={() => setOpen(false)}>
          Member sign in
        </Link>
      </div>
    </header>
  );
}
