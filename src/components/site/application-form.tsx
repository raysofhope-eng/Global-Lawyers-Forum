"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { applicationSchema } from "@/contracts";
import { api } from "@/lib/api";
import { QueryProvider } from "@/components/query-provider";
const fields = [
  ["name", "Full Name", "text", "name", true],
  ["email", "Email", "email", "email", true],
  ["address", "Address", "text", "street-address", true],
  ["cell", "Cell No.", "tel", "tel", true],
  ["cnic", "CNIC / Identity No.", "text", "off", true],
  ["passport", "Passport No.", "text", "off", false],
  ["barLicense", "License of the Bar", "text", "off", true],
  ["parentBar", "Parent Bar Membership", "text", "off", true],
] as const;
export function ApplicationForm() {
  return (
    <QueryProvider>
      <Suspense fallback={<p role="status">Loading application form…</p>}>
        <Form />
      </Suspense>
    </QueryProvider>
  );
}
function Form() {
  const searchParams = useSearchParams();
  const [intent, setIntent] = useState("membership");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => {
    const value = searchParams.get("intent");
    if (value === "registrar" || value === "membership") setIntent(value);
  }, [searchParams]);
  useEffect(() => {
    const click = (event: MouseEvent) => {
      const target = (event.target as Element).closest("a");
      if (target?.id === "ctaRegistrar") setIntent("registrar");
      if (target?.id === "ctaApply") setIntent("membership");
    };
    document.addEventListener("click", click);
    return () => document.removeEventListener("click", click);
  }, []);
  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      api<{ reference: string }>("/applications", {
        method: "POST",
        body: data,
      }),
    onSuccess: (data) => {
      setReference(data.reference);
      form.current?.reset();
      setFile(null);
      setError("");
    },
  });
  function choose(selected?: File) {
    if (!selected) return;
    if (
      !["image/jpeg", "image/png"].includes(selected.type) ||
      selected.size > 12 * 1024 * 1024
    ) {
      setError("Please choose a JPG or PNG image up to 12 MB.");
      return;
    }
    setFile(selected);
    setError("");
  }
  return (
    <form
      ref={form}
      className="form-card reveal d1"
      id="applyForm"
      onSubmit={(event) => {
        event.preventDefault();
        if (mutation.isPending) return;
        setError("");
        setReference("");
        const data = new FormData(event.currentTarget);
        const result = applicationSchema.safeParse({
          ...Object.fromEntries(data),
          consent: data.get("consent") === "on",
        });
        if (!result.success) {
          setError(
            "Please complete all required fields and confirm your consent.",
          );
          return;
        }
        if (!file) {
          setError("Please add a passport-size picture before submitting.");
          return;
        }
        data.set("consent", "true");
        data.set("picture", file);
        mutation.mutate(data);
      }}
    >
      <div className="field full">
        <label>I am&hellip;</label>
        <div className="intent-toggle">
          {[
            ["membership", "Applying for Membership"],
            ["registrar", "Speaking to the Registrar"],
          ].map(([value, label]) => (
            <label key={value}>
              <input
                type="radio"
                name="intent"
                value={value}
                checked={intent === value}
                onChange={() => setIntent(value)}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="field full" style={{ marginTop: 26 }}>
        <label>
          Picture <span className="req">*</span>
        </label>
        <div
          className="upload"
          tabIndex={0}
          role="button"
          aria-label="Upload your picture"
          onClick={() => fileInput.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileInput.current?.click();
            }
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            choose(e.dataTransfer.files[0]);
          }}
        >
          <svg
            className="uicon"
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          >
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <circle cx="9" cy="11" r="2" />
            <path d="M21 17l-5.5-5.5L9 18" />
          </svg>
          <div className="utext">
            {file
              ? "Photo selected — click to change"
              : "Click to upload, or drag a photo here"}
          </div>
          <div className="uhint">
            Passport-size photo · JPG or PNG · up to 12MB
          </div>
          <input
            ref={fileInput}
            type="file"
            accept="image/jpeg,image/png"
            onChange={(e) => choose(e.target.files?.[0])}
          />
        </div>
        {file && (
          <div className="upload-preview show">
            <img src={preview || undefined} alt="Selected picture preview" />
            <span className="fname">{file.name}</span>
            <button
              type="button"
              onClick={() => {
                setFile(null);
                if (fileInput.current) fileInput.current.value = "";
              }}
            >
              Remove
            </button>
          </div>
        )}
      </div>
      <div className="form-grid">
        {fields.map(([name, label, type, autoComplete, required]) => (
          <div
            key={name}
            className={`field${["address", "parentBar"].includes(name) ? " full" : ""}`}
          >
            <label htmlFor={`f-${name}`}>
              {label} {required && <span className="req">*</span>}
            </label>
            <input
              id={`f-${name}`}
              name={name}
              type={type}
              autoComplete={autoComplete}
              required={required}
              maxLength={
                name === "address" ? 500 : name === "email" ? 254 : 200
              }
              placeholder={
                name === "barLicense"
                  ? "e.g. Punjab Bar Council, No. 20800"
                  : name === "parentBar"
                    ? "e.g. Lahore High Court Bar Association"
                    : undefined
              }
            />
          </div>
        ))}
        <div className="field full">
          <label htmlFor="f-message">
            Message{" "}
            <span style={{ color: "var(--muted)", fontWeight: 500 }}>
              (optional)
            </span>
          </label>
          <textarea
            id="f-message"
            name="message"
            maxLength={5000}
            placeholder="Anything else the Registrar should know"
          />
        </div>
      </div>
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <label className="consent" style={{ marginTop: 24 }}>
        <input type="checkbox" name="consent" required />
        <span>
          I confirm the information above is accurate and I consent to Global
          Lawyers Forum processing it, including my photo and identity details,
          for membership verification purposes.
        </span>
      </label>
      <div className="submit-row">
        <button
          type="submit"
          className={`btn btn-gold${mutation.isPending ? " loading" : ""}`}
          disabled={mutation.isPending}
        >
          <span className="spinner" />
          <span className="btn-label">
            {mutation.isPending ? "Submitting" : "Submit"}
          </span>
        </button>
        <span className="form-note" style={{ marginTop: 0 }}>
          or email us directly at{" "}
          <a href="mailto:globallawyersforum@gmail.com">
            globallawyersforum@gmail.com
          </a>
        </span>
      </div>
      <div
        role="status"
        aria-live="polite"
        className={`form-msg${error || mutation.error ? " show err" : reference ? " show ok" : ""}`}
      >
        {error ||
          mutation.error?.message ||
          (reference
            ? `Thank you. Your submission has been received. Reference: ${reference}. A confirmation email has been queued.`
            : "")}
      </div>
    </form>
  );
}
