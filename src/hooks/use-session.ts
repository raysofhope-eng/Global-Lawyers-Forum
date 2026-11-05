'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import type { SessionUser } from '@/contracts';
export function useSession(){return useQuery({queryKey:['session'],queryFn:()=>api<SessionUser>('/auth/me'),retry:false,staleTime:30_000});}
export function useSignOut(){const router=useRouter();const client=useQueryClient();return useMutation({mutationFn:()=>api('/auth/logout',{method:'POST'}),onSuccess:()=>{client.clear();router.replace('/login');}});}
