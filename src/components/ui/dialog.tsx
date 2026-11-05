'use client';
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
let openDialogs=0;let originalOverflow='';
export function Dialog({title,children,onClose,wide=false}:{title:string;children:ReactNode;onClose:()=>void;wide?:boolean}){
 const id=useId();const root=useRef<HTMLDivElement>(null);const close=useRef(onClose);close.current=onClose;
 useEffect(()=>{const previous=document.activeElement as HTMLElement|null;if(openDialogs++===0){originalOverflow=document.body.style.overflow;document.body.style.overflow='hidden';}root.current?.focus();return()=>{if(--openDialogs===0)document.body.style.overflow=originalOverflow;previous?.focus();};},[]);
 return createPortal(<div className="dialog-backdrop" onMouseDown={event=>{if(event.target===event.currentTarget)onClose();}}><div ref={root} className={`dialog-panel${wide?' dialog-wide':''}`} role="dialog" aria-modal="true" aria-labelledby={id} tabIndex={-1} onKeyDown={event=>{
  if(event.key==='Escape'){event.stopPropagation();onClose();}
  if(event.key==='Tab'){const items=Array.from(root.current!.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex="0"]')).filter(item=>item.getClientRects().length>0);const first=items[0],last=items.at(-1);if(!first){event.preventDefault();return;}if(event.shiftKey&&(document.activeElement===first||document.activeElement===root.current)){event.preventDefault();last?.focus();}else if(!event.shiftKey&&(document.activeElement===last||document.activeElement===root.current)){event.preventDefault();first.focus();}}
 }}><div className="dialog-heading"><h2 id={id}>{title}</h2><button type="button" className="icon-button" aria-label="Close dialog" onClick={onClose}>×</button></div>{children}</div></div>,document.body);
}
