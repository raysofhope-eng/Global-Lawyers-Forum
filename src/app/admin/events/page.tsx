import type { Metadata } from 'next';
import { AdminEvents } from '@/components/admin/events';
export const metadata:Metadata={title:'Events | GLF Admin',robots:{index:false,follow:false}};
export default function Page(){return <AdminEvents/>;}
