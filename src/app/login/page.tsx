import type { Metadata } from 'next';
import Link from 'next/link';
import { QueryProvider } from '@/components/query-provider';
import { LoginForm } from '@/components/auth/login-form';
export const metadata:Metadata={title:'Sign in | Global Lawyers Forum',robots:{index:false,follow:false}};
export default function LoginPage(){return <QueryProvider><main className="wrap admin-main"><Link className="portal-back" href="/">← Global Lawyers Forum</Link><LoginForm/></main></QueryProvider>;}
