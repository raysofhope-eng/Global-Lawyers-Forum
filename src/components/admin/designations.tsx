"use client";
import { useEffect, useId, useState } from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ApplicationSummary, Page } from "@/contracts";
import { useSession } from "@/hooks/use-session";
import { CertificatePanel } from "@/components/documents/certificate-panel";
import { Dialog } from "@/components/ui/dialog";

function authorityLabel(member: ApplicationSummary) {
  const authorities =
    member.appointmentAuthorities ||
    (member.designation && member.designationSigner
      ? [member.designationSigner]
      : []);
  return authorities.length > 1
    ? { label: "Assigned by both", style: "both" }
    : authorities[0] === "chairman"
      ? { label: "Assigned by Chairman", style: "chairman" }
      : authorities[0] === "secretary"
        ? { label: "Assigned by General Secretary", style: "secretary" }
        : null;
}
function blockedReason(
  member: ApplicationSummary,
  chairman: boolean,
  ownId: string | null | undefined,
) {
  if (!chairman && member.chairmanDocumentsAssigned)
    return "Certificates already appointed by Chairman.";
  if (ownId === member.id)
    return "Your own appointment is managed by the Chairman.";
  if (
    !chairman &&
    ["chairman", "general secretary"].includes(
      member.designation.toLowerCase().replace(/\s+/g, " ").trim(),
    )
  )
    return "This office is managed in the Chairman tab.";
  const today = new Date().toISOString().slice(0, 10);
  if (
    !member.membershipStartsOn ||
    !member.membershipEndsOn ||
    member.membershipStartsOn > today ||
    member.membershipEndsOn < today
  )
    return "Renew the membership before assigning an appointment.";
  return null;
}
export function AppointmentWorkspace({
  chairman = false,
  delegated = false,
}: {
  chairman?: boolean;
  delegated?: boolean;
}) {
  const session = useSession(),
    inputId = useId();
  const [search, setSearch] = useState(""),
    [debounced, setDebounced] = useState(""),
    [page, setPage] = useState(1),
    [selected, setSelected] = useState<ApplicationSummary | null>(null);
  const office = chairman ? "Chairman" : "General Secretary";
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);
  const list = useQuery({
    queryKey: ["designations", page, debounced],
    queryFn: ({ signal }) =>
      api<Page<ApplicationSummary>>(
        `/designations?page=${page}&search=${encodeURIComponent(debounced)}`,
        { signal },
      ),
    placeholderData: keepPreviousData,
  });
  return (
    <section
      className="appointment-workspace"
      aria-label={`${office} appointments`}
    >
      <div className="appointment-heading">
        <div>
          <p className="eyebrow">Appointments</p>
          <h2>{office}</h2>
          <p>
            Assign designations and issue certificates and notifications signed
            by the {office}.
          </p>
        </div>
        <span
          className={`appointment-office ${chairman ? "chairman" : "secretary"}`}
        >
          {office} office
        </span>
      </div>
      <div className="appointment-toolbar">
        <div className="appointment-search">
          <label htmlFor={inputId}>Find a member</label>
          <div className="appointment-search-control">
            <svg
              aria-hidden="true"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            >
              <circle cx="10.5" cy="10.5" r="6.5" />
              <path d="m16 16 4 4" />
            </svg>
            <input
              id={inputId}
              type="search"
              value={search}
              maxLength={180}
              placeholder="Name, reference, designation"
              onChange={(event) => setSearch(event.target.value)}
              autoComplete="off"
            />
            {search && (
              <button
                type="button"
                className="appointment-clear"
                aria-label="Clear member search"
                onClick={() => setSearch("")}
              >
                Clear
              </button>
            )}
          </div>
        </div>
        <p
          className="appointment-result-count"
          role="status"
          aria-live="polite"
        >
          {search.trim() !== debounced || list.isFetching
            ? "Searching..."
            : list.data
              ? `${list.data.total} approved member${list.data.total === 1 ? "" : "s"}`
              : "Loading members..."}
        </p>
      </div>
      <p className="appointment-history-hint">
        Assignment badges show appointment history. The latest assigning office
        is listed separately.
      </p>
      {list.error ? (
        <div role="alert" className="empty-state">
          <p>{list.error.message}</p>
          <button className="btn btn-ghost" onClick={() => void list.refetch()}>
            Try again
          </button>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table
            className="admin-table appointment-table"
            aria-busy={list.isFetching}
          >
            <thead>
              <tr>
                <th>Member</th>
                <th>Current designation</th>
                <th>Latest assigned by</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.isPending
                ? Array.from({ length: 4 }, (_, index) => (
                    <tr key={index} aria-hidden="true">
                      <td colSpan={4}>
                        <div className="appointment-skeleton" />
                      </td>
                    </tr>
                  ))
                : list.data?.items.map((member) => {
                    const tag = authorityLabel(member),
                      reason = blockedReason(
                        member,
                        chairman,
                        session.data?.applicationId,
                      );
                    return (
                      <tr key={member.id}>
                        <td>
                          <strong>{member.name}</strong>
                          <span className="table-secondary">
                            {member.reference}
                          </span>
                          {tag ? (
                            <span
                              className={`appointment-authority ${tag.style}`}
                              title="Based on recorded appointments and issued documents"
                            >
                              {tag.label}
                            </span>
                          ) : (
                            <span className="appointment-unassigned">
                              No appointment history
                            </span>
                          )}
                        </td>
                        <td data-label="Current designation">
                          {member.designation.trim() || "Member"}
                          {member.designationEndsOn &&
                            member.designationEndsOn <
                              new Date().toISOString().slice(0, 10) && (
                              <span className="status-badge rejected">
                                Term ended
                              </span>
                            )}
                        </td>
                        <td data-label="Latest assigned by">
                          {member.designationSigner === "chairman"
                            ? "Chairman"
                            : member.designationSigner === "secretary"
                              ? "General Secretary"
                              : "Not assigned"}
                        </td>
                        <td>
                          <button
                            className="btn btn-ghost"
                            disabled={!!reason}
                            aria-describedby={
                              reason
                                ? `appointment-lock-${member.id}`
                                : undefined
                            }
                            onClick={() => setSelected(member)}
                          >
                            Manage appointment
                          </button>
                          {reason && (
                            <span
                              id={`appointment-lock-${member.id}`}
                              className="appointment-lock-note"
                            >
                              {reason}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              {!list.isPending && !list.data?.items.length && (
                <tr>
                  <td colSpan={4}>
                    <div className="empty-state">
                      <p>
                        {debounced
                          ? "No members match your search."
                          : "No approved members are available yet."}
                      </p>
                      {debounced && (
                        <button
                          className="text-button"
                          onClick={() => setSearch("")}
                        >
                          Clear search
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {list.data && (
        <div className="admin-pagination appointment-pagination">
          <button
            disabled={page === 1 || list.isPlaceholderData}
            onClick={() => setPage((value) => value - 1)}
          >
            Previous
          </button>
          <span>
            Page {page} of{" "}
            {Math.max(1, Math.ceil(list.data.total / list.data.pageSize))}
          </span>
          <button
            disabled={
              page * list.data.pageSize >= list.data.total ||
              list.isPlaceholderData
            }
            onClick={() => setPage((value) => value + 1)}
          >
            Next
          </button>
        </div>
      )}
      {selected && (
        <Appointment
          key={selected.id}
          member={selected}
          chairman={chairman}
          delegated={delegated}
          close={() => setSelected(null)}
        />
      )}
    </section>
  );
}
function Appointment({
  member,
  chairman,
  delegated,
  close,
}: {
  member: ApplicationSummary;
  chairman: boolean;
  delegated: boolean;
  close: () => void;
}) {
  const client = useQueryClient(),
    id = useId(),
    authority = chairman ? "chairman" : "secretary",
    office = chairman ? "Chairman" : "General Secretary";
  const [designation, setDesignation] = useState(member.designation.trim()),
    [date, setDate] = useState(
      member.effectiveDate || new Date().toISOString().slice(0, 10),
    ),
    [saved, setSaved] = useState(false);
  const [snapshot, setSnapshot] = useState({
    designation: member.designation.trim(),
    date: member.designation.trim() ? member.effectiveDate || "" : "",
    signer: member.designationSigner,
  });
  const dirty =
    designation.trim() !== snapshot.designation ||
    (designation.trim() ? date : "") !== snapshot.date ||
    (!!designation.trim() && snapshot.signer !== authority);
  const mutation = useMutation({
    mutationFn: (values: {
      designation: string;
      effectiveDate: string | null;
    }) =>
      api(
        chairman
          ? `/admin/chairman/${member.id}`
          : `/designations/${member.id}`,
        { method: "PATCH", body: JSON.stringify(values) },
      ),
    onSuccess: async (_, values) => {
      setDesignation(values.designation);
      setSnapshot({
        designation: values.designation,
        date: values.effectiveDate || "",
        signer: values.designation ? authority : null,
      });
      setSaved(true);
      await Promise.all([
        client.invalidateQueries({ queryKey: ["designations"] }),
        client.invalidateQueries({ queryKey: ["applications"] }),
        client.invalidateQueries({ queryKey: ["certificates", member.id] }),
        client.invalidateQueries({ queryKey: ["issued-documents", member.id] }),
      ]);
    },
  });
  return (
    <Dialog
      title={`${office} appointment - ${member.name}`}
      onClose={() => {
        if (!mutation.isPending) close();
      }}
      wide
    >
      <div className="dialog-body appointment-dialog">
        <div className="appointment-member-summary">
          <span>{member.reference}</span>
          <span className={`appointment-office ${authority}`}>
            Signed by {office}
          </span>
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setSaved(false);
            mutation.mutate({
              designation: designation.trim(),
              effectiveDate: designation.trim() ? date : null,
            });
          }}
        >
          <div className="compact-grid">
            <label className="appointment-field" htmlFor={`${id}-designation`}>
              Designation
              <input
                id={`${id}-designation`}
                value={designation}
                maxLength={120}
                minLength={2}
                placeholder="Member"
                onChange={(event) => {
                  setDesignation(event.target.value);
                  setSaved(false);
                }}
              />
            </label>
            <label className="appointment-field" htmlFor={`${id}-date`}>
              {designation.trim()
                ? "Appointment date"
                : "Membership effective date"}
              <input
                id={`${id}-date`}
                type="date"
                required={!!designation.trim()}
                value={
                  designation.trim() ? date : member.membershipStartsOn || date
                }
                disabled={!designation.trim()}
                onChange={(event) => {
                  setDate(event.target.value);
                  setSaved(false);
                }}
              />
            </label>
          </div>
          <p className="workspace-note">
            Leave the designation blank to issue the same documents as Member. A
            designation has its own one-year term. Clearing it returns the
            person to Member without changing their membership term.
          </p>
          <div className="panel-actions">
            <button
              className="btn btn-gold"
              disabled={mutation.isPending || !dirty}
            >
              {mutation.isPending ? "Saving..." : "Save appointment"}
            </button>
            {saved && (
              <p role="status" className="inline-success">
                Appointment saved. Documents now use these details.
              </p>
            )}
            {mutation.error && (
              <p role="alert" className="field-error">
                {mutation.error.message}
              </p>
            )}
          </div>
        </form>
        <div className="appointment-documents">
          <h3>
            {designation.trim() ? "Appointment documents" : "Member documents"}
          </h3>
          <CertificatePanel
            applicationId={member.id}
            context={chairman ? "chairman" : "secretary"}
            delegated={delegated}
            disabled={dirty || mutation.isPending}
          />
        </div>
      </div>
    </Dialog>
  );
}
