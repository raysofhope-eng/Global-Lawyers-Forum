import type { Metadata } from 'next';
import Link from 'next/link';
import { QueryProvider } from '@/components/query-provider';
export const metadata:Metadata={title:'Member portal | Global Lawyers Forum',robots:{index:false,follow:false,nocache:true}};
export default function MemberLayout({children}:{children:React.ReactNode}){return <QueryProvider><header className="admin-header"><Link className="brand" href="/"><img className="crest" src="/logo-badge-96.png" width="36" height="36" alt="Global Lawyers Forum crest"/><span className="brand-name">Global Lawyers Forum</span></Link><span>Member portal</span></header><main className="wrap portal-main">{children}</main></QueryProvider>;}
