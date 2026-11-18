"use client";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ApplicationSummary, Page } from "@/contracts";
import { CertificatePanel } from "@/components/documents/certificate-panel";
import { Dialog } from "@/components/ui/dialog";

export function Designations({
  chairman = false,
  delegated = false,
}: {
  chairman?: boolean;
  delegated?: boolean;
}) {
  const [search, setSearch] = useState(""),
    [page, setPage] = useState(1),
    [selected, setSelected] = useState<ApplicationSummary | null>(null);
  const list = useQuery({
    queryKey: ["designations", page, search],
    queryFn: () =>
      api<Page<ApplicationSummary>>(
        `/designations?page=${page}&search=${encodeURIComponent(search)}`,
      ),
  });
  return (
    <>
      <div className="workspace-heading">
        <div>
          <h2>{chairman ? "Chairman’s appointments" : "Designations"}</h2>
          <p>
            {chairman
              ? "Assign senior offices and issue chairman-signed documents. Appointing a General Secretary delegates authority for other appointments."
              : "Give approved members an optional designation and issue General Secretary-signed documents."}
          </p>
        </div>
      </div>
      <label className="field">
        Find a member
        <input
          type="search"
          placeholder="Name or reference"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </label>
      {list.isPending ? (
        <p role="status">Loading members…</p>
      ) : list.error ? (
        <p role="alert">{list.error.message}</p>
      ) : (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Designation</th>
                  <th>Appointed by</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.data.items.map((member) => (
                  <tr key={member.id}>
                    <td>
                      <strong>{member.name}</strong>
                      <span className="table-secondary">
                        {member.reference}
                      </span>
                    </td>
                    <td>
                      {member.designation || "No designation"}
                      {member.designationEndsOn &&
                        member.designationEndsOn <
                          new Date().toISOString().slice(0, 10) && (
                          <span className="status-badge rejected">
                            Term ended
                          </span>
                        )}
                    </td>
                    <td>
                      {member.designationSigner === "chairman"
                        ? "Chairman"
                        : member.designationSigner === "secretary"
                          ? "General Secretary"
                          : "—"}
                    </td>
                    <td>
                      <button
                        className="btn btn-ghost"
                        onClick={() => setSelected(member)}
                        disabled={
                          !chairman && member.designationSigner === "chairman"
                        }
                      >
                        Manage appointment
                      </button>
                    </td>
                  </tr>
                ))}
                {!list.data.items.length && (
                  <tr>
                    <td colSpan={4}>No approved members found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="admin-pagination">
            <button disabled={page === 1} onClick={() => setPage((v) => v - 1)}>
              Previous
            </button>
            <span>Page {page}</span>
            <button
              disabled={page * 20 >= list.data.total}
              onClick={() => setPage((v) => v + 1)}
            >
              Next
            </button>
          </div>
        </>
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
    </>
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
    [designation, setDesignation] = useState(member.designation),
    [date, setDate] = useState(
      member.effectiveDate || new Date().toISOString().slice(0, 10),
    ),
    [saved, setSaved] = useState(false);
  const mutation = useMutation({
    mutationFn: () =>
      api(
        chairman
          ? `/admin/chairman/${member.id}`
          : `/designations/${member.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            designation,
            effectiveDate: designation ? date : null,
          }),
        },
      ),
    onSuccess: () => {
      setSaved(true);
      void client.invalidateQueries({ queryKey: ["designations"] });
      void client.invalidateQueries({ queryKey: ["applications"] });
      void client.invalidateQueries({ queryKey: ["certificates", member.id] });
    },
  });
  return (
    <Dialog
      title={`${chairman ? "Chairman appointment" : "Designation"} · ${member.name}`}
      onClose={close}
      wide
    >
      <div className="dialog-body">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSaved(false);
            mutation.mutate();
          }}
        >
          <div className="compact-grid">
            <label className="field">
              Designation
              <input
                value={designation}
                maxLength={120}
                placeholder={
                  chairman
                    ? "e.g. General Secretary"
                    : "e.g. Chapter Coordinator"
                }
                onChange={(e) => {
                  setDesignation(e.target.value);
                  setSaved(false);
                }}
              />
            </label>
            <label className="field">
              Appointment date
              <input
                type="date"
                required={!!designation}
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setSaved(false);
                }}
              />
            </label>
          </div>
          <p className="workspace-note">
            Membership remains Member. This appointment has its own one-year
            term. Clear the designation to remove the appointment.
          </p>
          <div className="panel-actions">
            <button className="btn btn-gold" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving…" : "Save appointment"}
            </button>
            {saved && <p role="status">Appointment saved.</p>}
            {mutation.error && (
              <p role="alert" className="field-error">
                {mutation.error.message}
              </p>
            )}
          </div>
        </form>
        <hr />
        <CertificatePanel
          applicationId={member.id}
          context={chairman ? "chairman" : "designation"}
          delegated={delegated}
        />
      </div>
    </Dialog>
  );
}
