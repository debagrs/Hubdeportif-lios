import React from 'react';

function escapeClosingScript(code:string){ return code.replace(/<\/script/gi,'<\\/script'); }

export default function P5Embed({ code, height=520, title='Sketch p5.js' }: { code:string; height?:number; title?:string }) {
  const srcDoc = React.useMemo(()=>`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;padding:0;overflow:hidden;background:transparent}canvas{display:block;max-width:100%}</style><script src="https://cdn.jsdelivr.net/npm/p5@1.11.10/lib/p5.min.js"></script></head><body><script>${escapeClosingScript(code||'function setup(){createCanvas(windowWidth,400)} function draw(){background(245);fill(30);noStroke();textAlign(CENTER,CENTER);text(\"Cole seu código p5.js no painel\",width/2,height/2)}')}</script></body></html>`,[code]);
  return <iframe className="pf-interactive-frame" title={title} srcDoc={srcDoc} style={{height:`${Math.max(240,Math.min(1000,height))}px`}} sandbox="allow-scripts" loading="lazy"/>;
}
