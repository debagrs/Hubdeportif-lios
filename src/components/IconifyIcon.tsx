import React from 'react';

type IconData = { body: string; width: number; height: number };
const cache = new Map<string, IconData>();
const pending = new Map<string, Promise<IconData | null>>();

async function loadIcon(id: string): Promise<IconData | null> {
  if (cache.has(id)) return cache.get(id)!;
  if (pending.has(id)) return pending.get(id)!;
  const promise = fetch(`/api/backend?action=icon-data&id=${encodeURIComponent(id)}`)
    .then(async r => {
      if (!r.ok) return null;
      const data = await r.json();
      if (!data?.body) return null;
      const icon = { body:String(data.body), width:Number(data.width||24), height:Number(data.height||24) };
      cache.set(id,icon);
      return icon;
    })
    .catch(()=>null)
    .finally(()=>pending.delete(id));
  pending.set(id,promise);
  return promise;
}

export default function IconifyIcon({ id, size=18, className='', title }: { id?: string; size?: number; className?: string; title?: string }) {
  const [data,setData] = React.useState<IconData|null>(()=>id ? cache.get(id)||null : null);
  React.useEffect(()=>{
    let live=true;
    if (!id) { setData(null); return; }
    loadIcon(id).then(icon=>{ if(live) setData(icon); });
    return ()=>{live=false;};
  },[id]);
  if (!id) return null;
  if (!data) return <span className={`pf-icon-loading ${className}`} style={{width:size,height:size}} aria-hidden="true"/>;
  return <svg className={className} width={size} height={size} viewBox={`0 0 ${data.width} ${data.height}`} fill="currentColor" aria-hidden={title?undefined:true} aria-label={title||undefined} role={title?'img':undefined} dangerouslySetInnerHTML={{__html:data.body}}/>;
}

export function IconOrCustom({ iconId, customUrl, size=18, className='', alt='' }: { iconId?: string; customUrl?: string; size?: number; className?: string; alt?: string }) {
  if (customUrl) return <img className={`pf-custom-icon ${className}`} src={customUrl} alt={alt} style={{width:size,height:size}}/>;
  return <IconifyIcon id={iconId} size={size} className={className} title={alt||undefined}/>;
}
