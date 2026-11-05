import type { ReactNode } from 'react';
export function FormField({id,label,error,children,required=true,className=''}:{id:string;label:string;error?:string;children:ReactNode;required?:boolean;className?:string}){
  return <div className={`field ${className}`}><label htmlFor={id}>{label}{required&&<span className="req"> *</span>}</label>{children}{error&&<p id={`${id}-error`} className="field-error" role="alert">{error}</p>}</div>;
}
export const profileFields=[
  {name:'name',label:'Full Name',type:'text',autoComplete:'name'},
  {name:'email',label:'Email',type:'email',autoComplete:'email'},
  {name:'address',label:'Address',type:'text',autoComplete:'street-address'},
  {name:'cell',label:'Cell No.',type:'tel',autoComplete:'tel'},
  {name:'cnic',label:'CNIC / Identity No.',type:'text',autoComplete:'off'},
  {name:'passport',label:'Passport No.',type:'text',autoComplete:'off'},
  {name:'barLicense',label:'License of the Bar',type:'text',autoComplete:'off'},
  {name:'parentBar',label:'Parent Bar Membership',type:'text',autoComplete:'off'},
] as const;
