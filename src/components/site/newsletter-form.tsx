"use client";
import { useState } from "react";
import { api } from "@/lib/api";
export function NewsletterForm() {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  return (
    <>
      <form
        className="subscribe"
        onSubmit={async (event) => {
          event.preventDefault();
          if (pending) return;
          const form = event.currentTarget;
          const email = String(new FormData(form).get("email"));
          setPending(true);
          setMessage("");
          try {
            const result = await api<{ message: string }>("/newsletter", {
              method: "POST",
              body: JSON.stringify({ email }),
            });
            setMessage(result.message);
            form.reset();
          } catch (error) {
            setMessage(
              error instanceof Error ? error.message : "Please try again.",
            );
          } finally {
            setPending(false);
          }
        }}
      >
        <input
          name="email"
          type="email"
          required
          maxLength={254}
          placeholder="Your professional email"
          aria-label="Email address"
        />
        <button type="submit" aria-label="Subscribe" disabled={pending}>
          {pending ? "…" : "→"}
        </button>
      </form>
      <p role="status" style={{ fontSize: 13 }}>
        {message}
      </p>
    </>
  );
}
