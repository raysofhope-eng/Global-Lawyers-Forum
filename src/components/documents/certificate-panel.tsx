"use client";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { CertificateDraft, CertificateSummary } from "@/contracts";
import { Dialog } from "@/components/ui/dialog";
import { DocumentPreview } from "./document-preview";
export const documentTitle = (type: string) =>
  type === "membership"
    ? "Membership Certificate"
    : type === "membership-notice"
      ? "Membership Notification"
      : type.endsWith("notification")
        ? "Notification of Appointment"
        : "Certificate of Appointment";
export function CertificatePanel({
  applicationId,
  context = "secretary",
  delegated = false,
  disabled = false,
}: {
  applicationId: string;
  context?: "secretary" | "chairman";
  delegated?: boolean;
  disabled?: boolean;
}) {
  const client = useQueryClient();
  const [preview, setPreview] = useState<CertificateDraft | null>(null);
  const [message, setMessage] = useState("");
  const query = useQuery({
    queryKey: ["certificates", applicationId, context, delegated],
    queryFn: () =>
      api<{ drafts: CertificateDraft[]; issued: CertificateSummary[] }>(
        `/${delegated ? "designations" : "admin"}/applications/${applicationId}/certificates?context=${context}`,
      ),
    staleTime: 0,
    gcTime: 0,
  });
  const refresh = () =>
    Promise.all([
      client.invalidateQueries({ queryKey: ["designations"] }),
      client.invalidateQueries({ queryKey: ["certificates", applicationId] }),
      client.invalidateQueries({
        queryKey: ["issued-documents", applicationId],
      }),
    ]);
  if (query.isPending) return <p role="status">Loading documents…</p>;
  if (query.error)
    return (
      <p className="field-error" role="alert">
        {query.error.message}
      </p>
    );
  return (
    <>
      <p className="workspace-note">
        Preview both templates using this member’s photo and details. Issued
        documents keep the details captured at the time of issue.
      </p>
      {disabled && (
        <p className="appointment-save-note" role="status">
          Save the appointment details before previewing or issuing documents.
        </p>
      )}
      <div className="draft-grid">
        {query.data.drafts.map((draft) => (
          <article key={draft.type} className="draft-card">
            <span className="status-badge">Draft</span>
            <h3>{draft.title}</h3>
            <p>{draft.reason || "Ready to review and issue."}</p>
            <button
              className="btn btn-ghost"
              disabled={disabled || !draft.canIssue}
              onClick={() => setPreview(draft)}
            >
              Preview{" "}
              {["appointment", "membership", "chair-appointment"].includes(
                draft.type,
              )
                ? "certificate"
                : "notification"}
            </button>
          </article>
        ))}
      </div>
      {message && (
        <p role="status" className="inline-success">
          {message}
        </p>
      )}
      <h3 className="section-label">Issued documents</h3>
      <IssuedDocuments
        documents={query.data.issued}
        admin={!delegated}
        onChange={() => void refresh()}
      />
      {preview && (
        <IssuePreview
          draft={preview}
          applicationId={applicationId}
          delegated={delegated}
          close={() => setPreview(null)}
          onIssued={() => {
            setPreview(null);
            setMessage(
              "Document issued. The email attachment has been queued.",
            );
            void refresh();
          }}
        />
      )}
    </>
  );
}
function IssuePreview({
  draft,
  applicationId,
  close,
  onIssued,
  delegated,
}: {
  draft: CertificateDraft;
  applicationId: string;
  close: () => void;
  onIssued: () => void;
  delegated: boolean;
}) {
  const [hash, setHash] = useState("");
  const [requestId] = useState(() => crypto.randomUUID());
  const issue = useMutation({
    mutationFn: () =>
      api<CertificateSummary>(
        `/${delegated ? "designations" : "admin"}/applications/${applicationId}/certificates`,
        {
          method: "POST",
          body: JSON.stringify({
            type: draft.type,
            previewHash: hash,
            idempotencyKey: requestId,
          }),
        },
      ),
    onSuccess: onIssued,
  });
  return (
    <Dialog
      title={draft.title}
      onClose={() => {
        if (!issue.isPending) close();
      }}
      wide
    >
      <div className="dialog-body">
        <p className="workspace-note">
          <strong>Draft — not issued.</strong> Check the member’s name, photo,
          designation and dates before issuing.
        </p>
        <DocumentPreview url={draft.previewUrl} onReady={setHash} />
        {issue.error && (
          <p role="alert" className="field-error">
            {issue.error.message}
          </p>
        )}
        {draft.reason && <p className="workspace-note">{draft.reason}</p>}
      </div>
      <div className="dialog-footer">
        <button
          className="btn btn-ghost"
          disabled={issue.isPending}
          onClick={close}
        >
          Close preview
        </button>
        <button
          className="btn btn-gold"
          disabled={!draft.canIssue || !hash || issue.isPending}
          onClick={() => issue.mutate()}
        >
          {issue.isPending ? "Issuing…" : "Issue and email document"}
        </button>
      </div>
    </Dialog>
  );
}
export function IssuedDocuments({
  documents,
  admin = false,
  onChange,
}: {
  documents: CertificateSummary[];
  admin?: boolean;
  onChange?: () => void;
}) {
  const [preview, setPreview] = useState<CertificateSummary | null>(null);
  const [revoke, setRevoke] = useState<CertificateSummary | null>(null);
  const mutation = useMutation({
    mutationFn: (id: string) =>
      api(`/admin/certificates/${id}/revoke`, { method: "POST" }),
    onSuccess: () => {
      setRevoke(null);
      onChange?.();
    },
  });
  return (
    <>
      {!documents.length ? (
        <div className="empty-state">
          <p>No documents have been issued yet.</p>
          <small>
            They will appear here after an administrator issues them.
          </small>
        </div>
      ) : (
        <div className="issued-list">
          {documents.map((document) => (
            <article key={document.id} className="issued-row">
              <div>
                <strong>{documentTitle(document.type)}</strong>
                <p>
                  {document.designation} · Version {document.version} ·{" "}
                  {new Date(document.issuedAt).toLocaleDateString()}
                  {" · Signed by "}
                  {document.signer === "chairman"
                    ? "Chairman"
                    : "General Secretary"}
                </p>
                <span
                  className={`status-badge ${document.revokedAt ? "rejected" : "approved"}`}
                >
                  {document.revokedAt ? "Revoked" : "Issued"}
                </span>
              </div>
              <div className="row-actions">
                {!document.revokedAt && (
                  <>
                    <button
                      className="btn btn-ghost"
                      onClick={() => setPreview(document)}
                    >
                      Preview
                    </button>
                    <a className="btn btn-ghost" href={document.downloadUrl}>
                      Download DOCX
                    </a>
                    {admin && (
                      <button
                        className="text-button danger"
                        onClick={() => setRevoke(document)}
                      >
                        Revoke
                      </button>
                    )}
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
      {preview && (
        <Dialog
          title={documentTitle(preview.type)}
          onClose={() => setPreview(null)}
          wide
        >
          <div className="dialog-body">
            <DocumentPreview url={preview.downloadUrl} />
          </div>
          <div className="dialog-footer">
            <a className="btn btn-gold" href={preview.downloadUrl}>
              Download DOCX
            </a>
          </div>
        </Dialog>
      )}
      {revoke && (
        <Dialog
          title="Revoke document?"
          onClose={() => {
            if (!mutation.isPending) setRevoke(null);
          }}
        >
          <div className="dialog-body">
            <p>
              The member will no longer be able to download this version. The
              audit history will be retained.
            </p>
            {mutation.error && (
              <p role="alert" className="field-error">
                {mutation.error.message}
              </p>
            )}
          </div>
          <div className="dialog-footer">
            <button
              className="btn btn-ghost"
              onClick={() => setRevoke(null)}
              disabled={mutation.isPending}
            >
              Cancel
            </button>
            <button
              className="btn btn-gold"
              disabled={mutation.isPending}
              onClick={() => mutation.mutate(revoke.id)}
            >
              {mutation.isPending ? "Revoking…" : "Revoke document"}
            </button>
          </div>
        </Dialog>
      )}
    </>
  );
}

export function MemberIssuedDocuments({
  applicationId,
}: {
  applicationId: string;
}) {
  const query = useQuery({
    queryKey: ["issued-documents", applicationId],
    queryFn: () =>
      api<CertificateSummary[]>(
        `/admin/applications/${applicationId}/issued-documents`,
      ),
    staleTime: 0,
    gcTime: 0,
  });
  if (query.isPending) return <p role="status">Loading issued documents...</p>;
  if (query.error)
    return (
      <p role="alert" className="field-error">
        {query.error.message}
      </p>
    );
  return <IssuedDocuments documents={query.data} />;
}
