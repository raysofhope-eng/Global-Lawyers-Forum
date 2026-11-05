'use client';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { registrationSchema, type SessionUser } from '@/contracts';
import { api, ApiError } from '@/lib/api';
import { QueryProvider } from '@/components/query-provider';
import { FormField, profileFields } from '@/components/ui/form-field';
import { PasswordInput } from '@/components/ui/password-input';
const schema=registrationSchema.extend({
 picture:z.custom<File>(value=>typeof File!=='undefined' && value instanceof File,'Please add a passport-size picture before submitting.')
  .refine(file=>!file || ['image/jpeg','image/png'].includes(file.type),'Choose a JPG or PNG image.')
  .refine(file=>!file || file.size<=12*1024*1024,'Choose an image up to 12 MB.')
});
type Values=z.input<typeof schema>;
export function ApplicationForm(){return <QueryProvider><Suspense fallback={<p role="status">Loading application form…</p>}><Form/></Suspense></QueryProvider>;}
function Form(){
 const router=useRouter();const search=useSearchParams();const input=useRef<HTMLInputElement>(null);const uploadButton=useRef<HTMLDivElement>(null);
 const [preview,setPreview]=useState('');const [fileName,setFileName]=useState('');const [serverError,setServerError]=useState('');
 const {register,handleSubmit,setValue,watch,setError,formState:{errors}}=useForm<Values>({resolver:zodResolver(schema),mode:'onBlur',defaultValues:{intent:'membership',consent:false,website:''} as any});
 const intent=watch('intent');const picture=watch('picture');
 useEffect(()=>{const value=search.get('intent');if(value==='membership'||value==='registrar')setValue('intent',value);},[search,setValue]);
 useEffect(()=>{const click=(event:MouseEvent)=>{const link=(event.target as Element).closest('a');if(link?.id==='ctaRegistrar')setValue('intent','registrar');if(link?.id==='ctaApply')setValue('intent','membership');};document.addEventListener('click',click);return()=>document.removeEventListener('click',click);},[setValue]);
 useEffect(()=>{if(!(picture instanceof File)){setPreview('');return;}const url=URL.createObjectURL(picture);setPreview(url);return()=>URL.revokeObjectURL(url);},[picture]);
 const mutation=useMutation({mutationFn:(data:FormData)=>api<{reference:string;user:SessionUser}>('/auth/register',{method:'POST',body:data}),onSuccess:()=>router.push('/member'),onError:(error)=>{
  setServerError(error.message);if(error instanceof ApiError && error.fields)for(const [key,messages]of Object.entries(error.fields))if(messages?.[0])setError(key as keyof Values,{message:messages[0]});
 }});
 function choose(file?:File){if(!file)return;setFileName(file.name);setValue('picture',file,{shouldValidate:true,shouldDirty:true});}
 const pictureRegistration=register('picture');
 return <form className="form-card reveal d1" id="applyForm" noValidate onSubmit={handleSubmit(values=>{
  if(mutation.isPending)return;setServerError('');const form=new FormData();for(const [key,value]of Object.entries(values))if(key!=='picture')form.set(key,String(value));form.set('picture',values.picture);mutation.mutate(form);
 },invalid=>{if(invalid.picture)uploadButton.current?.focus();})}>
  <div className="field full"><label>I am…</label><div className="intent-toggle">{[['membership','Applying for Membership'],['registrar','Speaking to the Registrar']].map(([value,label])=><label key={value}><input type="radio" value={value} {...register('intent')}/><span>{label}</span></label>)}</div></div>
  <div className="field full" style={{marginTop:24}}><label>Picture <span className="req">*</span></label><div ref={uploadButton} className="upload" role="button" tabIndex={0} aria-label="Upload your picture" aria-invalid={!!errors.picture} aria-describedby={errors.picture?'picture-error':undefined} onClick={()=>input.current?.click()} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();input.current?.click();}}} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();choose(e.dataTransfer.files[0]);}}>
   <svg className="uicon" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M21 17l-5.5-5.5L9 18"/></svg>
   <div className="utext">{picture?'Photo selected — click to change':'Click to upload, or drag a photo here'}</div><div className="uhint">Passport-size photo · JPG or PNG · up to 12MB</div>
   <input type="file" accept="image/jpeg,image/png" name={pictureRegistration.name} ref={element=>{input.current=element;pictureRegistration.ref(element);}} onBlur={pictureRegistration.onBlur} onChange={e=>choose(e.target.files?.[0])}/>
  </div>{errors.picture&&<p id="picture-error" className="field-error" role="alert">{errors.picture.message}</p>}{preview&&<div className="upload-preview show"><img src={preview} alt="Selected picture preview"/><span className="fname">{fileName}</span><button type="button" onClick={()=>{setValue('picture',undefined as unknown as File,{shouldValidate:true});if(input.current)input.current.value='';}}>Remove</button></div>}</div>
  <div className="form-grid">{profileFields.map(field=><FormField key={field.name} id={`f-${field.name}`} label={field.label} error={errors[field.name]?.message} className={['address','parentBar'].includes(field.name)?'full':''}><input id={`f-${field.name}`} type={field.type} autoComplete={field.autoComplete} {...register(field.name)} aria-invalid={!!errors[field.name]} aria-describedby={errors[field.name]?`f-${field.name}-error`:undefined}/></FormField>)}
  <FormField id="f-message" label="Message" error={errors.message?.message} className="full"><textarea id="f-message" {...register('message')} aria-invalid={!!errors.message} aria-describedby={errors.message?'f-message-error':undefined} placeholder="Anything the Registrar should know"/></FormField>
  <FormField id="f-password" label="Password" error={errors.password?.message}><PasswordInput id="f-password" autoComplete="new-password" {...register('password')} aria-invalid={!!errors.password} aria-describedby="password-help f-password-error"/><p id="password-help" className="field-hint">At least 12 characters, including a letter and a number.</p></FormField>
  <FormField id="f-confirmPassword" label="Confirm Password" error={errors.confirmPassword?.message}><PasswordInput id="f-confirmPassword" autoComplete="new-password" {...register('confirmPassword')} aria-invalid={!!errors.confirmPassword} aria-describedby={errors.confirmPassword?'f-confirmPassword-error':undefined}/></FormField></div>
  <div className="honeypot" aria-hidden="true"><label htmlFor="website">Website</label><input id="website" tabIndex={-1} autoComplete="off" {...register('website')}/></div>
  <label className="consent" style={{marginTop:24}}><input type="checkbox" {...register('consent')} aria-invalid={!!errors.consent}/><span>I confirm the information above is accurate and consent to Global Lawyers Forum processing my photo and identity details for membership verification.</span></label>{errors.consent&&<p className="field-error" role="alert">{errors.consent.message}</p>}
  <p className="form-note">Submitting creates your member account. You can sign in to track your membership and view issued documents.</p>
  <div className="submit-row"><button type="submit" className={`btn btn-gold${mutation.isPending?' loading':''}`} disabled={mutation.isPending}><span className="spinner"/><span className="btn-label">{mutation.isPending?'Creating account':'Create member account'}</span></button><a className="form-note" href="/login">Already registered? Sign in</a></div>
  {serverError&&<div className="form-msg show err" role="alert">{serverError}</div>}
 </form>;
}
