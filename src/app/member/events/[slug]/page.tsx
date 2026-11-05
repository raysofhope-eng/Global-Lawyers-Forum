import type { Metadata } from 'next';
import { MemberEventDetail } from '@/components/member/event-detail';
export const metadata:Metadata={title:'Member event | Global Lawyers Forum',robots:{index:false,follow:false,nocache:true}};
export default async function Page({params}:{params:Promise<{slug:string}>}){return <MemberEventDetail slug={(await params).slug}/>;}
