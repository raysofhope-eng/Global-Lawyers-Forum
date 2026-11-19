"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";
import {
  statuses,
  type ApplicationStatus,
  type ApplicationDetail,
  type ApplicationSummary,
  type Page,
} from "@/contracts";
import { useSession, useSignOut } from "@/hooks/use-session";
import { LoginForm } from "@/components/auth/login-form";
import { Dialog } from "@/components/ui/dialog";
import { Tabs } from "@/components/ui/tabs";
import { profileFields } from "@/components/ui/form-field";
import { AppointmentWorkspace } from "./designations";
import { MemberIssuedDocuments } from "@/components/documents/certificate-panel";
export function Dashboard() {
  const client = useQueryClient();
  const session = useSession();
  const logout = useSignOut();
  const [workspace, setWorkspace] = useState("members");
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [intent, setIntent] = useState("");
  const [login, setLogin] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selected, setSelected] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);
  const list = useQuery({
    queryKey: [
      "applications",
      "list",
      page,
      status,
      debounced,
      intent,
      login,
      from,
      to,
    ],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page) });
      for (const [key, value] of Object.entries({
        status,
        search: debounced,
        intent,
        login,
        joinedFrom: from,
        joinedTo: to,
      }))
        if (value) params.set(key, value);
      return api<Page<ApplicationSummary>>("/admin/applications?" + params);
    },
    enabled: session.data?.role === "admin",
  });
  if (session.isPending) return <p role="status">Checking your session…</p>;
  if (session.error) {
    if (session.error instanceof ApiError && session.error.status === 401)
      return (
        <LoginForm
          admin
          onAuthenticated={(user) => client.setQueryData(["session"], user)}
        />
      );
    return <p role="alert">{session.error.message}</p>;
  }
  if (session.data?.role !== "admin")
    return (
      <div className="empty-state">
        <h1>Admin access required</h1>
        <p>Your member account can access its own portal.</p>
        <Link className="btn btn-gold" href="/member">
          Open member portal
        </Link>
      </div>
    );
  const reset = () => {
    setSearch("");
    setStatus("");
    setIntent("");
    setLogin("");
    setFrom("");
    setTo("");
    setPage(1);
  };
  return (
    <>
      <div className="workspace-heading">
        <div>
          <h1>Members & applications</h1>
          <p>Approve memberships and manage separate appointments.</p>
        </div>
        <div className="row-actions">
          <Link className="btn btn-ghost" href="/admin/gallery">
            Gallery
          </Link>
          <Link className="btn btn-ghost" href="/admin/events">
            Events
          </Link>
          <span className="workspace-email">{session.data.email}</span>
          <button
            className="btn btn-ghost"
            disabled={logout.isPending}
            onClick={() => logout.mutate()}
          >
            Sign out
          </button>
        </div>
      </div>
      {logout.error && (
        <p className="field-error" role="alert">
          {logout.error.message}
        </p>
      )}
      <Tabs
        label="Administration"
        value={workspace}
        onChange={setWorkspace}
        items={[
          { id: "members", label: "Memberships" },
          { id: "chairman", label: "Chairman" },
          { id: "secretary", label: "General Secretary" },
        ]}
      />
      <section
        id={`panel-${workspace}`}
        role="tabpanel"
        aria-labelledby={`tab-${workspace}`}
      >
        {workspace !== "members" ? (
          <AppointmentWorkspace
            key={workspace}
            chairman={workspace === "chairman"}
          />
        ) : (
          <>
            <div className="member-filters">
              <label className="filter-search">
                Search
                <input
                  type="search"
                  placeholder="Name, email, reference or designation"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>
              <label>
                Status
                <select
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">All statuses</option>
                  {statuses.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Type
                <select
                  value={intent}
                  onChange={(e) => {
                    setIntent(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">All registrations</option>
                  <option value="membership">Membership</option>
                  <option value="registrar">Registrar enquiry</option>
                </select>
              </label>
              <label>
                Sign in
                <select
                  value={login}
                  onChange={(e) => {
                    setLogin(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">Any activity</option>
                  <option value="signed-in">Has signed in</option>
                  <option value="never">Never signed in</option>
                </select>
              </label>
              <label>
                Joined from
                <input
                  type="date"
                  value={from}
                  max={to || undefined}
                  onChange={(e) => {
                    setFrom(e.target.value);
                    setPage(1);
                  }}
                />
              </label>
              <label>
                Joined to
                <input
                  type="date"
                  value={to}
                  min={from || undefined}
                  onChange={(e) => {
                    setTo(e.target.value);
                    setPage(1);
                  }}
                />
              </label>
              <button className="text-button" onClick={reset}>
                Clear filters
              </button>
            </div>
            <div className="list-heading">
              <p>
                {list.data
                  ? `${list.data.total} result${list.data.total === 1 ? "" : "s"}`
                  : "Members"}
                {list.isFetching && " · Updating…"}
              </p>
              <button
                className="text-button"
                disabled={list.isFetching}
                onClick={() => list.refetch()}
              >
                Refresh
              </button>
            </div>
            {list.isPending ? (
              <p role="status">Loading applications…</p>
            ) : list.error ? (
              <div role="alert" className="empty-state">
                <p>{list.error.message}</p>
                <button
                  className="btn btn-ghost"
                  onClick={() => list.refetch()}
                >
                  Retry
                </button>
              </div>
            ) : (
              <>
                <div className="admin-table-wrap">
                  <table className="admin-table compact-table">
                    <thead>
                      <tr>
                        <th>Member</th>
                        <th>Reference / type</th>
                        <th>Status</th>
                        <th>Designation</th>
                        <th>Joined</th>
                        <th>Last sign in</th>
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
                            <span className="table-secondary">
                              {item.email}
                            </span>
                          </td>
                          <td>
                            {item.reference}
                            <span className="table-secondary">
                              {item.intent}
                              {item.hasAccount === false
                                ? " · legacy application"
                                : ""}
                            </span>
                          </td>
                          <td>
                            <MembershipStatus member={item} />
                          </td>
                          <td>{item.designation || "Not assigned"}</td>
                          <td>
                            {new Date(item.createdAt).toLocaleDateString()}
                          </td>
                          <td>
                            {item.lastLoginAt
                              ? new Date(item.lastLoginAt).toLocaleString()
                              : "Never"}
                          </td>
                          <td>
                            <button
                              className="btn btn-ghost"
                              onClick={() => setSelected(item.id)}
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                      {!list.data.items.length && (
                        <tr>
                          <td colSpan={7}>
                            <div className="empty-state">
                              <p>No members match these filters.</p>
                              <button className="text-button" onClick={reset}>
                                Clear filters
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="admin-pagination">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((v) => v - 1)}
                  >
                    Previous
                  </button>
                  <span>
                    Page {page} of{" "}
                    {Math.max(
                      1,
                      Math.ceil(list.data.total / list.data.pageSize),
                    )}
                  </span>
                  <button
                    disabled={page * list.data.pageSize >= list.data.total}
                    onClick={() => setPage((v) => v + 1)}
                  >
                    Next
                  </button>
                </div>
              </>
            )}
            {selected && (
              <MemberReview id={selected} close={() => setSelected("")} />
            )}
          </>
        )}
      </section>
    </>
  );
}
function MemberReview({ id, close }: { id: string; close: () => void }) {
  const detail = useQuery({
    queryKey: ["applications", "detail", id],
    queryFn: () => api<ApplicationDetail>(`/admin/applications/${id}`),
    staleTime: 0,
    gcTime: 0,
  });
  return (
    <Dialog title={detail.data?.name || "Member profile"} onClose={close} wide>
      <div className="dialog-member-bar">
        <img
          src={`/api/admin/applications/${id}/photo`}
          width="48"
          height="48"
          alt="Member photo"
        />
        <div>
          <strong>{detail.data?.reference || "Loading..."}</strong>
          <span>{detail.data?.email}</span>
        </div>
        {detail.data && (
          <span className={`status-badge ${detail.data.status}`}>
            {detail.data.status}
          </span>
        )}
      </div>
      <div className="dialog-body member-view">
        {detail.isPending ? (
          <p role="status">Loading profile...</p>
        ) : detail.error ? (
          <p role="alert" className="field-error">
            {detail.error.message}
          </p>
        ) : (
          <>
            <h3>Profile</h3>
            <dl className="detail-grid">
              {profileFields.map((field) => (
                <div key={field.name}>
                  <dt>{field.label}</dt>
                  <dd>{detail.data[field.name] || "Not provided"}</dd>
                </div>
              ))}
              <div>
                <dt>Current designation</dt>
                <dd>{detail.data.designation || "No designation"}</dd>
              </div>
              <div>
                <dt>Latest assigning office</dt>
                <dd>
                  {detail.data.designationSigner === "chairman"
                    ? "Chairman"
                    : detail.data.designationSigner === "secretary"
                      ? "General Secretary"
                      : "Not assigned"}
                </dd>
              </div>
              <div className="full">
                <dt>Message</dt>
                <dd>{detail.data.message || "Not provided"}</dd>
              </div>
            </dl>
            <section
              className="member-view-documents"
              aria-label="Issued documents"
            >
              <h3>Issued documents</h3>
              <MemberIssuedDocuments applicationId={id} />
            </section>
          </>
        )}
      </div>
    </Dialog>
  );
}
function MembershipStatus({ member }: { member: ApplicationSummary }) {
  const client = useQueryClient();
  const refresh = async () => {
    await Promise.all([
      client.invalidateQueries({ queryKey: ["applications"] }),
      client.invalidateQueries({ queryKey: ["designations"] }),
      client.invalidateQueries({ queryKey: ["certificates", member.id] }),
    ]);
  };
  const update = useMutation({
    mutationFn: (status: ApplicationStatus) =>
      api(`/admin/applications/${member.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: refresh,
  });
  const renew = useMutation({
    mutationFn: () =>
      api(`/admin/applications/${member.id}/renew`, { method: "POST" }),
    onSuccess: refresh,
  });
  return (
    <div className="membership-status-control">
      <select
        aria-label={`Membership status for ${member.name}`}
        className={`membership-status-select ${member.status}`}
        value={member.status}
        disabled={update.isPending || renew.isPending}
        onChange={(event) =>
          update.mutate(event.target.value as ApplicationStatus)
        }
      >
        {statuses.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
      {(update.isPending || renew.isPending) && (
        <span role="status" className="table-secondary">
          Saving...
        </span>
      )}
      {member.status === "approved" &&
        member.membershipEndsOn &&
        member.membershipEndsOn < new Date().toISOString().slice(0, 10) && (
          <button
            className="text-button"
            disabled={renew.isPending || update.isPending}
            onClick={() => renew.mutate()}
          >
            Renew for one year
          </button>
        )}
      {(update.error || renew.error) && (
        <p role="alert" className="field-error">
          {(update.error || renew.error)?.message}
        </p>
      )}
    </div>
  );
}
