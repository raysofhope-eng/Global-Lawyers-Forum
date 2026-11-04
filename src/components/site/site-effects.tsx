"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
export function SiteEffects() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  useEffect(() => {
    const update = () => {
      const el = document.documentElement;
      const bar = document.getElementById("scrollbar");
      if (bar)
        bar.style.width = `${Math.min(100, (el.scrollTop / (el.scrollHeight - el.clientHeight || 1)) * 100)}%`;
      setShow(scrollY > innerHeight * 0.6);
    };
    document.addEventListener("scroll", update, { passive: true });
    update();
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.14 },
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    const frames = new Set<number>();
    const stats = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          stats.unobserve(entry.target);
          if (matchMedia("(prefers-reduced-motion:reduce)").matches) return;
          entry.target
            .querySelectorAll<HTMLElement>("[data-count]")
            .forEach((el) => {
              const target = Number(el.dataset.count);
              const suffix = el.dataset.suffix || "";
              let started: number | undefined;
              const step = (timestamp: number) => {
                started ??= timestamp;
                const progress = Math.min((timestamp - started) / 1400, 1);
                el.textContent =
                  String(Math.round(target * (1 - Math.pow(1 - progress, 3)))) +
                  (progress === 1 ? suffix : "");
                if (progress < 1) {
                  const id = requestAnimationFrame((time) => {
                    frames.delete(id);
                    step(time);
                  });
                  frames.add(id);
                }
              };
              const id = requestAnimationFrame((time) => {
                frames.delete(id);
                step(time);
              });
              frames.add(id);
            });
        }),
      { threshold: 0.4 },
    );
    const statBlock = document.querySelector(".stats");
    if (statBlock) stats.observe(statBlock);
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    if (document.getElementById("globe"))
      import("@/lib/globe").then(({ mountGlobe }) => {
        if (!cancelled) cleanup = mountGlobe();
      });
    return () => {
      cancelled = true;
      cleanup?.();
      observer.disconnect();
      stats.disconnect();
      frames.forEach(cancelAnimationFrame);
      document.removeEventListener("scroll", update);
    };
  }, [pathname]);
  return (
    <button
      className={`totop${show ? " show" : ""}`}
      aria-label="Back to top"
      onClick={() =>
        window.scrollTo({
          top: 0,
          behavior: matchMedia("(prefers-reduced-motion:reduce)").matches
            ? "auto"
            : "smooth",
        })
      }
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}
