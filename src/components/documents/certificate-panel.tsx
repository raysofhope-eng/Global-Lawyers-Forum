'use client';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { CertificateDraft, CertificateSummary } from '@/contracts';
import { Dialog } from '@/components/ui/dialog';
import { DocumentPreview } from './document-preview';
export const documentTitle=(type:string)=>type==='appointment'?'Certificate of Appointment':'Notification of Appointment';
export function CertificatePanel({applicationId}:{applicationId:string}){
 const client=useQueryClient();const [preview,setPreview]=useState<CertificateDraft|null>(null);const [message,setMessage]=useState('');
 const query=useQuery({queryKey:['certificates',applicationId],queryFn:()=>api<{drafts:CertificateDraft[];issued:CertificateSummary[]}>(`/admin/applications/${applicationId}/certificates`),staleTime:0,gcTime:0});
 const refresh=()=>client.invalidateQueries({queryKey:['certificates',applicationId]});
 if(query.isPending)return <p role="status">Loading documents…</p>;
 if(query.error)return <p className="field-error" role="alert">{query.error.message}</p>;
 return <><p className="workspace-note">Preview both templates using this member’s photo and details. Issued documents keep the details captured at the time of issue.</p><div className="draft-grid">{query.data.drafts.map(draft=><article key={draft.type} className="draft-card"><span className="status-badge">Draft</span><h3>{draft.title}</h3><p>{draft.reason||'Ready to review and issue.'}</p><button className="btn btn-ghost" onClick={()=>setPreview(draft)}>Preview {draft.type==='appointment'?'certificate':'notification'}</button></article>)}</div>
 {message&&<p role="status" className="inline-success">{message}</p>}
 <h3 className="section-label">Issued documents</h3><IssuedDocuments documents={query.data.issued} admin onChange={()=>void refresh()}/>
 {preview&&<IssuePreview draft={preview} applicationId={applicationId} close={()=>setPreview(null)} onIssued={()=>{setPreview(null);setMessage('Document issued. The email attachment has been queued.');void refresh();}}/>}
 </>;
}
function IssuePreview({draft,applicationId,close,onIssued}:{draft:CertificateDraft;applicationId:string;close:()=>void;onIssued:()=>void}){
 const [hash,setHash]=useState('');const [requestId]=useState(()=>crypto.randomUUID());
 const issue=useMutation({mutationFn:()=>api<CertificateSummary>(`/admin/applications/${applicationId}/certificates`,{method:'POST',body:JSON.stringify({type:draft.type,previewHash:hash,idempotencyKey:requestId})}),onSuccess:onIssued});
 return <Dialog title={draft.title} onClose={()=>{if(!issue.isPending)close();}} wide><div className="dialog-body"><p className="workspace-note"><strong>Draft — not issued.</strong> Check the member’s name, photo, designation and dates before issuing.</p><DocumentPreview url={draft.previewUrl} onReady={setHash}/>{issue.error&&<p role="alert" className="field-error">{issue.error.message}</p>}{draft.reason&&<p className="workspace-note">{draft.reason}</p>}</div><div className="dialog-footer"><button className="btn btn-ghost" disabled={issue.isPending} onClick={close}>Close preview</button><button className="btn btn-gold" disabled={!draft.canIssue||!hash||issue.isPending} onClick={()=>issue.mutate()}>{issue.isPending?'Issuing…':'Issue and email document'}</button></div></Dialog>;
}
export function IssuedDocuments({documents,admin=false,onChange}:{documents:CertificateSummary[];admin?:boolean;onChange?:()=>void}){
 const [preview,setPreview]=useState<CertificateSummary|null>(null);const [revoke,setRevoke]=useState<CertificateSummary|null>(null);
 const mutation=useMutation({mutationFn:(id:string)=>api(`/admin/certificates/${id}/revoke`,{method:'POST'}),onSuccess:()=>{setRevoke(null);onChange?.();}});
 return <>{!documents.length?<div className="empty-state"><p>No documents have been issued yet.</p><small>They will appear here after an administrator issues them.</small></div>:<div className="issued-list">{documents.map(document=><article key={document.id} className="issued-row"><div><strong>{documentTitle(document.type)}</strong><p>{document.designation} · Version {document.version} · {new Date(document.issuedAt).toLocaleDateString()}</p><span className={`status-badge ${document.revokedAt?'rejected':'approved'}`}>{document.revokedAt?'Revoked':'Issued'}</span></div><div className="row-actions">{!document.revokedAt&&<><button className="btn btn-ghost" onClick={()=>setPreview(document)}>Preview</button><a className="btn btn-ghost" href={document.downloadUrl}>Download DOCX</a>{admin&&<button className="text-button danger" onClick={()=>setRevoke(document)}>Revoke</button>}</>}</div></article>)}</div>}
 {preview&&<Dialog title={documentTitle(preview.type)} onClose={()=>setPreview(null)} wide><div className="dialog-body"><DocumentPreview url={preview.downloadUrl}/></div><div className="dialog-footer"><a className="btn btn-gold" href={preview.downloadUrl}>Download DOCX</a></div></Dialog>}
 {revoke&&<Dialog title="Revoke document?" onClose={()=>{if(!mutation.isPending)setRevoke(null);}}><div className="dialog-body"><p>The member will no longer be able to download this version. The audit history will be retained.</p>{mutation.error&&<p role="alert" className="field-error">{mutation.error.message}</p>}</div><div className="dialog-footer"><button className="btn btn-ghost" onClick={()=>setRevoke(null)} disabled={mutation.isPending}>Cancel</button><button className="btn btn-gold" disabled={mutation.isPending} onClick={()=>mutation.mutate(revoke.id)}>{mutation.isPending?'Revoking…':'Revoke document'}</button></div></Dialog>}
 </>;
}
