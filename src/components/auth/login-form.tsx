'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { loginSchema, type SessionUser } from '@/contracts';
import { api } from '@/lib/api';
import { FormField } from '@/components/ui/form-field';
import { PasswordInput } from '@/components/ui/password-input';
export function LoginForm({admin=false,onAuthenticated}:{admin?:boolean;onAuthenticated?:(user:SessionUser)=>void}){
 const router=useRouter();const client=useQueryClient();
 const {register,handleSubmit,formState:{errors}}=useForm<{email:string;password:string}>({resolver:zodResolver(loginSchema),mode:'onBlur'});
 const mutation=useMutation({mutationFn:(data:{email:string;password:string})=>api<SessionUser>('/auth/login',{method:'POST',body:JSON.stringify(data)}),onSuccess:user=>{client.removeQueries({queryKey:['applications']});client.setQueryData(['session'],user);if(onAuthenticated)onAuthenticated(user);else router.replace(user.role==='admin'?'/admin':'/member');}});
 return <section className="admin-login form-card"><p className="eyebrow">Global Lawyers Forum</p><h1>{admin?'Admin sign in':'Member sign in'}</h1><p className="field-hint">Use the email and password associated with your account.</p><form noValidate onSubmit={handleSubmit(data=>mutation.mutate(data))}>
 <FormField id="login-email" label="Email" error={errors.email?.message}><input id="login-email" type="email" autoComplete="username" {...register('email')} aria-invalid={!!errors.email}/></FormField>
 <FormField id="login-password" label="Password" error={errors.password?.message}><PasswordInput id="login-password" autoComplete="current-password" {...register('password')} aria-invalid={!!errors.password}/></FormField>
 <button className="btn btn-gold" disabled={mutation.isPending}>{mutation.isPending?'Signing in…':'Sign in'}</button>{mutation.error&&<p role="alert" className="field-error">{mutation.error.message}</p>}
 </form><p className="form-note">New to the Forum? <Link href="/membership#apply-form">Create a member account</Link></p></section>;
}
