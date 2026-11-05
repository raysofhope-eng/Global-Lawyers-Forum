'use client';
import { useEffect, useRef, useState } from 'react';
export function DocumentPreview({url,onReady}:{url:string;onReady?:(hash:string)=>void}){
 const host=useRef<HTMLDivElement>(null);const callback=useRef(onReady);callback.current=onReady;
 const [error,setError]=useState('');const [loading,setLoading]=useState(true);const [retry,setRetry]=useState(0);
 useEffect(()=>{const controller=new AbortController();let active=true;let observer:ResizeObserver|undefined;
  setLoading(true);setError('');callback.current?.('');
  const render=async()=>{
   const response=await fetch(url,{credentials:'same-origin',cache:'no-store',signal:controller.signal});
   if(!response.ok){const data=await response.json().catch(()=>null);throw new Error(data?.error||'Unable to load document.');}
   const hash=response.headers.get('X-Preview-Hash')||'';const buffer=await response.arrayBuffer();const {renderAsync}=await import('docx-preview');
   if(!active||!host.current)return;const element=host.current;element.replaceChildren();
   await renderAsync(buffer,element,undefined,{inWrapper:true,breakPages:true,useBase64URL:true,ignoreLastRenderedPageBreak:true});
   if(!active)return;
   const fit=()=>{const wrapper=element.querySelector<HTMLElement>('.docx-wrapper');const page=element.querySelector<HTMLElement>('section.docx');if(!wrapper||!page)return;wrapper.style.padding='0';wrapper.style.background='transparent';const width=page.offsetWidth;const scale=Math.min(1,element.clientWidth/width);wrapper.style.transform=`scale(${scale})`;wrapper.style.transformOrigin='top left';element.style.height=`${wrapper.scrollHeight*scale}px`;};
   fit();observer=new ResizeObserver(fit);observer.observe(element);setLoading(false);callback.current?.(hash);
  };
  void render().catch(value=>{if(active){setError(value instanceof Error?value.message:'Unable to render document.');setLoading(false);}});
  return()=>{active=false;controller.abort();observer?.disconnect();};
 },[url,retry]);
 return <div className="document-preview">{loading&&<p role="status">Preparing document preview…</p>}{error&&<div role="alert"><p>{error}</p><button className="btn btn-ghost" onClick={()=>setRetry(v=>v+1)}>Retry preview</button></div>}<div ref={host} className="document-host" aria-label="Document preview"/></div>;
}
