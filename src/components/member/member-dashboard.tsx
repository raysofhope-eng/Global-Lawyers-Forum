'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { profileSchema,passwordChangeSchema,type ApplicationDetail,type CertificateSummary } from '@/contracts';
import { api,ApiError } from '@/lib/api';
import { useSession,useSignOut } from '@/hooks/use-session';
import { LoginForm } from '@/components/auth/login-form';
import { Tabs } from '@/components/ui/tabs';
import { FormField,profileFields } from '@/components/ui/form-field';
import { PasswordInput } from '@/components/ui/password-input';
import { IssuedDocuments } from '@/components/documents/certificate-panel';
import { Dialog } from '@/components/ui/dialog';
import { MemberEventList } from './event-list';
export function MemberDashboard(){
 const session=useSession();const signOut=useSignOut();const [tab,setTab]=useState(()=>{if(typeof window!=='undefined'){const params=new URLSearchParams(window.location.search);if(params.has('event')||params.get('tab')==='events'||window.location.hash==='#events')return 'events';}return 'profile';});const [password,setPassword]=useState(false);
 const profile=useQuery({queryKey:['member','profile'],queryFn:()=>api<ApplicationDetail>('/member/profile'),enabled:session.data?.role==='member',gcTime:0});
 const documents=useQuery({queryKey:['member','certificates'],queryFn:()=>api<CertificateSummary[]>('/member/certificates'),enabled:session.data?.role==='member',gcTime:0});
 if(session.isPending)return <p role="status">Checking your session…</p>;
 if(session.error){if(session.error instanceof ApiError&&session.error.status===401)return <LoginForm/>;return <p role="alert">{session.error.message}</p>;}
 if(session.data?.role!=='member')return <div className="empty-state"><h1>Member portal</h1><p>Your account has administrator access.</p><Link className="btn btn-gold" href="/admin">Open admin portal</Link></div>;
 return <><div className="workspace-heading"><div><h1>My membership</h1><p>{session.data.email}</p></div><div className="row-actions"><button className="btn btn-ghost" onClick={()=>setPassword(true)}>Change password</button><button className="btn btn-ghost" disabled={signOut.isPending} onClick={()=>signOut.mutate()}>Sign out</button></div></div>{signOut.error&&<p role="alert">{signOut.error.message}</p>}
 <Tabs label="Member portal" items={[{id:'profile',label:'Profile'},{id:'membership',label:'Membership'},{id:'events',label:'Events'},{id:'documents',label:'Documents'}]} value={tab} onChange={setTab}/>
 <section id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} role="tabpanel" className="workspace-panel">
 {profile.isPending?<p role="status">Loading your profile…</p>:profile.error?<p className="field-error" role="alert">{profile.error.message}</p>:<>
 {tab==='profile'&&<ProfileForm profile={profile.data!}/>}
 {tab==='membership'&&<><div className="member-identity"><img src="/api/member/photo" alt="Your profile photo" width="80" height="80"/><div><h2>{profile.data!.name}</h2><p>{profile.data!.reference}</p></div></div><dl className="detail-grid"><div><dt>Account role</dt><dd>Member</dd></div><div><dt>Membership status</dt><dd><span className={`status-badge ${profile.data!.status}`}>{profile.data!.status}</span></dd></div><div><dt>Designation</dt><dd>{profile.data!.designation||'Not assigned yet'}</dd></div><div><dt>Effective date</dt><dd>{profile.data!.effectiveDate||'Not assigned yet'}</dd></div><div><dt>Joined</dt><dd>{new Date(profile.data!.createdAt).toLocaleDateString()}</dd></div></dl><p className="workspace-note">Your designation and appointment documents are managed by the Office of the Registrar.</p></>}
 {tab==='events'&&<MemberEventList/>}
 {tab==='documents'&&(documents.isPending?<p role="status">Loading documents…</p>:documents.error?<p role="alert">{documents.error.message}</p>:<IssuedDocuments documents={documents.data||[]}/>)}
 </>}
 </section>{password&&<PasswordDialog close={()=>setPassword(false)}/>}</>;
}
function ProfileForm({profile}:{profile:ApplicationDetail}){
 const client=useQueryClient();const [saved,setSaved]=useState(false);
 const {register,handleSubmit,formState:{errors,isDirty},reset}=useForm<z.input<typeof profileSchema>>({resolver:zodResolver(profileSchema),defaultValues:profile});
 useEffect(()=>{if(profile) reset(profile);},[profile,reset]);
 const mutation=useMutation({mutationFn:(values:z.input<typeof profileSchema>)=>api<ApplicationDetail>('/member/profile',{method:'PATCH',body:JSON.stringify(values)}),onSuccess:data=>{client.setQueryData(['member','profile'],data);reset(data);setSaved(true);}});
 return <><div className="member-identity"><img src="/api/member/photo" alt="Your profile photo" width="64" height="64"/><div><h2>Your profile</h2><p>Keep your membership information up to date.</p></div></div><form noValidate onSubmit={handleSubmit(values=>{setSaved(false);mutation.mutate(values);})}><div className="compact-grid">{profileFields.map(field=><FormField key={field.name} id={`profile-${field.name}`} label={field.label} error={errors[field.name]?.message}><input id={`profile-${field.name}`} type={field.type} autoComplete={field.autoComplete} readOnly={field.name==='email'} {...register(field.name)} aria-invalid={!!errors[field.name]}/></FormField>)}<FormField id="profile-message" label="Message" error={errors.message?.message} className="full"><textarea id="profile-message" {...register('message')}/></FormField></div><div className="panel-actions"><button className="btn btn-gold" disabled={!isDirty||mutation.isPending}>{mutation.isPending?'Saving…':'Save profile'}</button>{saved&&<span role="status" className="inline-success">Profile saved.</span>}{mutation.error&&<p className="field-error" role="alert">{mutation.error.message}</p>}</div></form></>;
}
function PasswordDialog({close}:{close:()=>void}){
 const client=useQueryClient();const [done,setDone]=useState(false);
 const {register,handleSubmit,formState:{errors}}=useForm<z.input<typeof passwordChangeSchema>>({resolver:zodResolver(passwordChangeSchema)});
 const mutation=useMutation({mutationFn:(data:z.input<typeof passwordChangeSchema>)=>api('/auth/password',{method:'POST',body:JSON.stringify(data)}),onSuccess:()=>{client.clear();setDone(true);}});
 return <Dialog title="Change password" onClose={close}><div className="dialog-body">{done?<p>Password changed. All sessions have been signed out. <Link href="/login">Sign in again</Link>.</p>:<form noValidate onSubmit={handleSubmit(data=>mutation.mutate(data))}>{[['currentPassword','Current password'],['password','New password'],['confirmPassword','Confirm new password']].map(([name,label])=><FormField key={name} id={name} label={label} error={errors[name as keyof typeof errors]?.message}><PasswordInput id={name} autoComplete={name==='currentPassword'?'current-password':'new-password'} {...register(name as 'password'|'confirmPassword'|'currentPassword')}/></FormField>)}{mutation.error&&<p role="alert" className="field-error">{mutation.error.message}</p>}<div className="panel-actions"><button className="btn btn-gold" disabled={mutation.isPending}>{mutation.isPending?'Saving…':'Change password'}</button></div></form>}</div></Dialog>;
}
