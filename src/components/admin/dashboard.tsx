"use client";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";
import { statuses, type ApplicationStatus } from "@/contracts";
import {
  useApplication,
  useApplications,
  useUpdateApplication,
} from "@/hooks/use-applications";
export function Dashboard() {
  const client = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState("");
  const session = useQuery({
    queryKey: ["session"],
    queryFn: () => api<{ id: string; email: string }>("/auth/me"),
    retry: false,
    staleTime: 60_000,
  });
  const list = useApplications(page, status, !!session.data);
  const logout = useMutation({
    mutationFn: () => api("/auth/logout", { method: "POST" }),
    onSuccess: () => {
      setSelected("");
      client.removeQueries({ queryKey: ["applications"] });
      client.setQueryData(["session"], null);
    },
  });
  if (session.isPending) return <p role="status">Checking your session…</p>;
  if (session.data === null) return <Login />;
  if (session.error) {
    if (session.error instanceof ApiError && session.error.status === 401)
      return <Login />;
    return (
      <div role="alert">
        <p>{session.error.message}</p>
        <button className="btn btn-gold" onClick={() => session.refetch()}>
          Retry
        </button>
      </div>
    );
  }
  if (list.error instanceof ApiError && list.error.status === 401) {
    return <Login />;
  }
  return (
    <>
      <div className="admin-heading">
        <div>
          <p className="eyebrow">Registrar workspace</p>
          <h1>Applications</h1>
          <p>{session.data?.email}</p>
        </div>
        <button
          className="btn btn-ghost"
          disabled={logout.isPending}
          onClick={() => logout.mutate()}
        >
          Sign out
        </button>
      </div>
      {logout.error && <p role="alert">{logout.error.message}</p>}
      <div className="admin-toolbar">
        <label htmlFor="status-filter">Status </label>
        <select
          id="status-filter"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
            setSelected("");
          }}
        >
          <option value="">All applications</option>
          {statuses.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
        <button
          className="btn btn-ghost"
          onClick={() => list.refetch()}
          disabled={list.isFetching}
        >
          Refresh
        </button>
      </div>
      <div className="admin-workspace">
        <section aria-label="Applications list">
          {list.isPending ? (
            <p role="status">Loading applications…</p>
          ) : list.error ? (
            <p role="alert">{list.error.message}</p>
          ) : (
            <>
              <p className="admin-count">
                {list.data.total} application{list.data.total === 1 ? "" : "s"}
              </p>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Applicant</th>
                      <th>Reference</th>
                      <th>Status</th>
                      <th>Received</th>
                      <th>
                        <span className="sr-only">Review</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.data.items.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <strong>{item.name}</strong>
                          <br />
                          <span>{item.email}</span>
                        </td>
                        <td>
                          {item.reference}
                          <br />
                          <small>{item.intent}</small>
                        </td>
                        <td>
                          <span className={`status-badge ${item.status}`}>
                            {item.status}
                          </span>
                        </td>
                        <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button
                            className="btn btn-ghost"
                            onClick={() => setSelected(item.id)}
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    ))}
                    {list.data.items.length === 0 && (
                      <tr>
                        <td colSpan={5}>No applications match this filter.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="admin-pagination">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </button>
                <span>
                  Page {page} of{" "}
                  {Math.max(1, Math.ceil(list.data.total / list.data.pageSize))}
                </span>
                <button
                  disabled={page * list.data.pageSize >= list.data.total}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </section>
        {selected && (
          <ApplicationReview
            key={selected}
            id={selected}
            close={() => setSelected("")}
          />
        )}
      </div>
    </>
  );
}
function Login() {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationFn: (values: { email: string; password: string }) =>
      api<{ id: string; email: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(values),
      }),
    onSuccess: (data) => {
      client.removeQueries({ queryKey: ["applications"] });
      client.setQueryData(["session"], data);
    },
  });
  return (
    <section className="admin-login form-card">
      <p className="eyebrow">Office of the Registrar</p>
      <h1>Admin sign in</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const values = new FormData(e.currentTarget);
          mutation.mutate({
            email: String(values.get("email")),
            password: String(values.get("password")),
          });
        }}
      >
        <div className="field">
          <label htmlFor="admin-email">Email</label>
          <input
            id="admin-email"
            name="email"
            type="email"
            required
            autoComplete="username"
          />
        </div>
        <div className="field">
          <label htmlFor="admin-password">Password</label>
          <input
            id="admin-password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
          />
        </div>
        <button className="btn btn-gold" disabled={mutation.isPending}>
          {mutation.isPending ? "Signing in…" : "Sign in"}
        </button>
        {mutation.error && <p role="alert">{mutation.error.message}</p>}
      </form>
    </section>
  );
}
function ApplicationReview({ id, close }: { id: string; close: () => void }) {
  const detail = useApplication(id);
  const update = useUpdateApplication(id);
  return (
    <aside className="admin-review form-card" aria-label="Application details">
      <div className="admin-heading">
        <h2>Application review</h2>
        <button type="button" className="btn btn-ghost" onClick={close}>
          Close
        </button>
      </div>
      {detail.isPending ? (
        <p role="status">Loading details…</p>
      ) : detail.error ? (
        <p role="alert">{detail.error.message}</p>
      ) : (
        <>
          <img
            className="applicant-photo"
            src={`/api/admin/applications/${id}/photo`}
            alt={`Application photo for ${detail.data.name}`}
            width="120"
            height="120"
          />
          <dl>
            {Object.entries(detail.data)
              .filter(
                ([key]) => !["id", "updatedAt", "consentAt"].includes(key),
              )
              .map(([key, value]) => (
                <div key={key}>
                  <dt>{key.replace(/([A-Z])/g, " $1")}</dt>
                  <dd>{String(value || "—")}</dd>
                </div>
              ))}
          </dl>
          <label htmlFor="review-status">Review status</label>
          <select
            id="review-status"
            value={detail.data.status}
            disabled={update.isPending}
            onChange={(e) => update.mutate(e.target.value as ApplicationStatus)}
          >
            {statuses.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
          {update.isPending && <p role="status">Saving…</p>}
          {update.error && <p role="alert">{update.error.message}</p>}
        </>
      )}
    </aside>
  );
}
