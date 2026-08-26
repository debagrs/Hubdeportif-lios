import React from 'react';
import { ArrowDown, ArrowUp, Check, RotateCcw, Search, Upload, X } from 'lucide-react';
import type { GoogleFontItem, IconRole, PortfolioDetail, PortfolioSectionKey, PortfolioTheme } from '../types';
import { DEFAULT_PORTFOLIO_THEME, FALLBACK_FONT_OPTIONS, ICON_ROLES, THEME_PRESETS, mergeTheme } from '../theme/portfolioTheme';
import { hubApi } from '../lib/api';
import GoogleFontLoader from './GoogleFontLoader';
import IconifyIcon from './IconifyIcon';

type Props = {
  portfolio: PortfolioDetail;
  onChange: (portfolio: PortfolioDetail) => void;
  onUploadCustomIcon?: (file: File, role: IconRole) => Promise<void>;
};

const Section = ({ title, eyebrow, children }: { title:string; eyebrow:string; children:React.ReactNode }) => <section className="ds-editor-section"><div className="ds-editor-head"><p className="lab-label">{eyebrow}</p><h3>{title}</h3></div><div className="ds-editor-body">{children}</div></section>;
const Field = ({ label, hint, children }: { label:string; hint?:string; children:React.ReactNode }) => <div className="lab-field ds-field"><label>{label}</label>{children}{hint&&<small>{hint}</small>}</div>;

function FontPicker({ label, value, fonts, onChange }: { label:string; value:string; fonts:GoogleFontItem[]; onChange:(value:string)=>void }) {
  const [query,setQuery]=React.useState('');
  const source: GoogleFontItem[] = fonts.length ? fonts : FALLBACK_FONT_OPTIONS.map(f=>({family:f, category:''}));
  const filtered = React.useMemo(()=>{
    const q=query.trim().toLowerCase();
    const exact = source.find(f=>f.family===value);
    const list = q ? source.filter(f=>f.family.toLowerCase().includes(q)).slice(0,80) : source.slice(0,80);
    return exact && !list.some(f=>f.family===exact.family) ? [exact,...list] : list;
  },[source,query,value]);
  return <Field label={label} hint={fonts.length ? `${fonts.length} famílias do catálogo Google Fonts.` : 'Catálogo remoto indisponível: usando lista de segurança.'}>
    <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar fonte..."/>
    <select value={value} onChange={e=>onChange(e.target.value)}>
      <option value={value}>{value}</option>
      {filtered.filter(f=>f.family!==value).map(f=><option key={f.family} value={f.family}>{f.family}{f.category?` — ${f.category}`:''}</option>)}
    </select>
  </Field>;
}

export default function DesignSystemEditor({ portfolio, onChange, onUploadCustomIcon }: Props) {
  const theme = mergeTheme(portfolio.theme);
  const [fonts,setFonts]=React.useState<GoogleFontItem[]>([]);
  const [fontStatus,setFontStatus]=React.useState('Carregando catálogo Google Fonts…');
  const [iconQuery,setIconQuery]=React.useState('');
  const [iconResults,setIconResults]=React.useState<string[]>([]);
  const [iconRole,setIconRole]=React.useState<IconRole>('menu');
  const [iconBusy,setIconBusy]=React.useState(false);

  React.useEffect(()=>{ hubApi.listGoogleFonts().then(r=>{setFonts(r.fonts||[]);setFontStatus(r.fonts?.length?`${r.fonts.length} fontes disponíveis.`:'Catálogo remoto indisponível nesta tentativa.');}).catch(()=>setFontStatus('Catálogo remoto indisponível nesta tentativa.')); },[]);

  const setTheme = (patch:Partial<PortfolioTheme>) => onChange({...portfolio,theme:mergeTheme({...theme,...patch})});
  const setNumber = (key:keyof PortfolioTheme,value:string,min:number,max:number) => setTheme({[key]:Math.max(min,Math.min(max,Number(value)))} as Partial<PortfolioTheme>);
  const moveSection=(section:PortfolioSectionKey,delta:number)=>{const order=[...theme.sectionOrder];const index=order.indexOf(section);const next=index+delta;if(next<0||next>=order.length)return;[order[index],order[next]]=[order[next],order[index]];setTheme({sectionOrder:order});};
  const currentRole = ICON_ROLES.find(r=>r.key===iconRole)!;
  const currentCustom = theme.customIconUrls?.[iconRole] || '';
  const currentIcon = theme.iconAssignments?.[iconRole] || '';

  async function searchIcons(){
    if(iconQuery.trim().length<2)return;
    setIconBusy(true);
    try{setIconResults((await hubApi.searchIcons(iconQuery.trim())).icons||[]);}finally{setIconBusy(false);}
  }
  function chooseIcon(id:string){setTheme({iconAssignments:{...theme.iconAssignments,[iconRole]:id},customIconUrls:{...theme.customIconUrls,[iconRole]:''}});}
  function clearCustom(){setTheme({customIconUrls:{...theme.customIconUrls,[iconRole]:''}});}

  return <div className="ds-editor">
    <GoogleFontLoader fonts={[theme.headingFont,theme.bodyFont,theme.monoFont]}/>
    <Section eyebrow="00 • PRESETS" title="Pontos de partida, não templates fechados">
      <div className="ds-preset-grid">{THEME_PRESETS.map(p=><button type="button" className="ds-preset" key={p.name} onClick={()=>setTheme(p.patch)}><strong>{p.name}</strong><span>{p.description}</span></button>)}</div>
      <button type="button" className="lab-secondary" style={{marginTop:16}} onClick={()=>setTheme(DEFAULT_PORTFOLIO_THEME)}><RotateCcw size={15}/> Restaurar design inicial</button>
    </Section>

    <Section eyebrow="01 • CORES" title="Paleta e superfícies">
      <div className="ds-color-grid">{([
        ['background','Fundo'],['surface','Superfície'],['surfaceAlt','Superfície alternativa'],['text','Texto'],['muted','Texto secundário'],['accent','Acento'],['secondary','Cor secundária'],['border','Bordas'],
      ] as [keyof PortfolioTheme,string][]).map(([key,label])=><Field key={String(key)} label={label}><div className="color-input"><input type="color" value={String(theme[key])} onChange={e=>setTheme({[key]:e.target.value} as Partial<PortfolioTheme>)}/><input value={String(theme[key])} onChange={e=>setTheme({[key]:e.target.value} as Partial<PortfolioTheme>)}/></div></Field>)}</div>
    </Section>

    <Section eyebrow="02 • TIPOGRAFIA" title="Google Fonts + hierarquia tipográfica completa">
      <p className="dashboard-help" style={{marginBottom:16}}>{fontStatus} A fonte escolhida é carregada apenas no portfólio do estudante.</p>
      <div className="theme-grid">
        <FontPicker label="Fonte dos títulos" value={theme.headingFont} fonts={fonts} onChange={v=>setTheme({headingFont:v})}/>
        <FontPicker label="Fonte do corpo" value={theme.bodyFont} fonts={fonts} onChange={v=>setTheme({bodyFont:v})}/>
        <FontPicker label="Fonte de metadados / mono" value={theme.monoFont} fonts={fonts} onChange={v=>setTheme({monoFont:v})}/>
        <Field label="Peso dos títulos"><select value={theme.headingWeight} onChange={e=>setTheme({headingWeight:Number(e.target.value)})}>{[100,200,300,400,500,600,700,800,900].map(n=><option key={n}>{n}</option>)}</select></Field>
        <Field label="Peso do corpo"><select value={theme.bodyWeight} onChange={e=>setTheme({bodyWeight:Number(e.target.value)})}>{[100,200,300,400,500,600,700,800,900].map(n=><option key={n}>{n}</option>)}</select></Field>
        <Field label="Caixa dos títulos"><select value={theme.headingCase} onChange={e=>setTheme({headingCase:e.target.value as PortfolioTheme['headingCase']})}><option value="none">Como digitado</option><option value="uppercase">CAIXA ALTA</option><option value="lowercase">caixa baixa</option></select></Field>
        <Field label="Estilo dos títulos"><select value={theme.headingStyle} onChange={e=>setTheme({headingStyle:e.target.value as PortfolioTheme['headingStyle']})}><option value="normal">Normal</option><option value="italic">Itálico</option></select></Field>
        <Field label={`Tracking dos títulos — ${theme.headingTracking}`}><input type="range" min="-8" max="12" value={theme.headingTracking} onChange={e=>setNumber('headingTracking',e.target.value,-8,12)}/></Field>
        <Field label={`Corpo — ${theme.bodySize}px`}><input type="range" min="12" max="26" value={theme.bodySize} onChange={e=>setNumber('bodySize',e.target.value,12,26)}/></Field>
        <Field label={`Entrelinha — ${theme.bodyLeading.toFixed(2)}`}><input type="range" min="1.1" max="2.2" step=".05" value={theme.bodyLeading} onChange={e=>setTheme({bodyLeading:Number(e.target.value)})}/></Field>
        <Field label="Escala dos títulos"><select value={theme.headingScale} onChange={e=>setTheme({headingScale:e.target.value as PortfolioTheme['headingScale']})}><option value="compact">Compacta</option><option value="balanced">Equilibrada</option><option value="oversized">Oversized</option></select></Field>
        <Field label="Alinhamento editorial"><select value={theme.textAlign} onChange={e=>setTheme({textAlign:e.target.value as PortfolioTheme['textAlign']})}><option value="left">Esquerda</option><option value="center">Centralizado</option></select></Field>
      </div>
      <div className="ds-type-preview" style={{fontFamily:`"${theme.bodyFont}",sans-serif`,fontWeight:theme.bodyWeight,fontSize:theme.bodySize,lineHeight:theme.bodyLeading}}><h4 style={{fontFamily:`"${theme.headingFont}",sans-serif`,fontWeight:theme.headingWeight,fontStyle:theme.headingStyle,textTransform:theme.headingCase==='none'?'none':theme.headingCase,letterSpacing:`${theme.headingTracking/10}em`}}>Hierarquia autoral</h4><p>O estudante decide como o conteúdo é lido, visto e organizado.</p><code style={{fontFamily:`"${theme.monoFont}",monospace`}}>ETIQUETA / META / 2026</code></div>
    </Section>

    <Section eyebrow="03 • GRID" title="Malha responsiva que realmente controla o portfólio">
      <div className="theme-grid">
        <Field label="Largura máxima"><select value={theme.contentWidth} onChange={e=>setTheme({contentWidth:Number(e.target.value) as PortfolioTheme['contentWidth']})}><option value="900">900 px — íntimo</option><option value="1100">1100 px — editorial</option><option value="1280">1280 px — amplo</option><option value="1440">1440 px — expansivo</option></select></Field>
        <Field label={`Colunas desktop — ${theme.gridColumns}`} hint="Até 6 colunas."><input type="range" min="1" max="6" value={theme.gridColumns} onChange={e=>setNumber('gridColumns',e.target.value,1,6)}/></Field>
        <Field label={`Colunas tablet — ${theme.gridColumnsTablet}`}><input type="range" min="1" max="4" value={theme.gridColumnsTablet} onChange={e=>setNumber('gridColumnsTablet',e.target.value,1,4)}/></Field>
        <Field label={`Colunas mobile — ${theme.gridColumnsMobile}`}><input type="range" min="1" max="2" value={theme.gridColumnsMobile} onChange={e=>setNumber('gridColumnsMobile',e.target.value,1,2)}/></Field>
        <Field label={`Gap do grid — ${theme.gridGap}px`}><input type="range" min="0" max="80" value={theme.gridGap} onChange={e=>setNumber('gridGap',e.target.value,0,80)}/></Field>
        <Field label={`Colunas da galeria — ${theme.galleryColumns}`}><input type="range" min="1" max="6" value={theme.galleryColumns} onChange={e=>setNumber('galleryColumns',e.target.value,1,6)}/></Field>
        <Field label={`Respiro entre seções — ${theme.sectionGap}px`}><input type="range" min="30" max="240" value={theme.sectionGap} onChange={e=>setNumber('sectionGap',e.target.value,30,240)}/></Field>
        <Field label={`Margem lateral — ${theme.sidePadding}px`}><input type="range" min="8" max="96" value={theme.sidePadding} onChange={e=>setNumber('sidePadding',e.target.value,8,96)}/></Field>
        <Field label="Composição dos projetos"><select value={theme.projectLayout} onChange={e=>setTheme({projectLayout:e.target.value as PortfolioTheme['projectLayout']})}><option value="grid">Grade</option><option value="masonry">Masonry / mosaico vertical</option><option value="editorial">Editorial alternado</option><option value="stack">Lista / pilha</option></select></Field>
        <Field label="Informação no card"><select value={theme.projectInfo} onChange={e=>setTheme({projectInfo:e.target.value as PortfolioTheme['projectInfo']})}><option value="below">Texto abaixo da imagem</option><option value="overlay">Texto sobre a imagem</option><option value="split">Imagem + texto lado a lado</option></select></Field>
        <label className="lab-check"><input type="checkbox" checked={theme.featuredSpan} onChange={e=>setTheme({featuredSpan:e.target.checked})}/> Projetos destacados podem ocupar duas colunas</label>
      </div>
      <div className="ds-grid-demo" style={{gridTemplateColumns:`repeat(${theme.gridColumns},minmax(0,1fr))`,gap:theme.gridGap}}>{Array.from({length:Math.min(12,theme.gridColumns*2)}).map((_,i)=><span key={i}>{i+1}</span>)}</div>
    </Section>

    <Section eyebrow="04 • FORMAS" title="Cards, bordas, botões e profundidade">
      <div className="theme-grid">
        <Field label={`Raio dos cards — ${theme.cardRadius}px`}><input type="range" min="0" max="80" value={theme.cardRadius} onChange={e=>setNumber('cardRadius',e.target.value,0,80)}/></Field>
        <Field label={`Raio dos botões — ${theme.buttonRadius}px`}><input type="range" min="0" max="999" value={theme.buttonRadius} onChange={e=>setNumber('buttonRadius',e.target.value,0,999)}/></Field>
        <Field label={`Espessura de borda — ${theme.borderWidth}px`}><input type="range" min="0" max="5" value={theme.borderWidth} onChange={e=>setNumber('borderWidth',e.target.value,0,5)}/></Field>
        <Field label="Estilo dos cards"><select value={theme.cardStyle} onChange={e=>setTheme({cardStyle:e.target.value as PortfolioTheme['cardStyle']})}><option value="surface">Superfície</option><option value="outline">Contorno</option><option value="minimal">Sem card</option></select></Field>
        <Field label="Sombras"><select value={theme.shadow} onChange={e=>setTheme({shadow:e.target.value as PortfolioTheme['shadow']})}><option value="none">Sem sombra</option><option value="soft">Suave</option><option value="hard">Dura</option></select></Field>
        <Field label="Botões"><select value={theme.buttonStyle} onChange={e=>setTheme({buttonStyle:e.target.value as PortfolioTheme['buttonStyle']})}><option value="solid">Sólido</option><option value="outline">Contorno</option><option value="text">Somente texto</option></select></Field>
      </div>
    </Section>

    <Section eyebrow="05 • IMAGENS" title="Direção de arte das imagens">
      <div className="theme-grid">
        <Field label="Proporção das capas"><select value={theme.projectAspect} onChange={e=>setTheme({projectAspect:e.target.value as PortfolioTheme['projectAspect']})}><option value="wide">21:9</option><option value="landscape">16:10</option><option value="square">1:1</option><option value="portrait">3:4</option><option value="auto">Livre / altura original</option></select></Field>
        <Field label="Encaixe"><select value={theme.imageFit} onChange={e=>setTheme({imageFit:e.target.value as PortfolioTheme['imageFit']})}><option value="cover">Preencher / cortar</option><option value="contain">Mostrar inteira</option></select></Field>
        <Field label="Hero / abertura"><select value={theme.heroStyle} onChange={e=>setTheme({heroStyle:e.target.value as PortfolioTheme['heroStyle']})}><option value="split">Texto + imagem</option><option value="full">Imagem cheia</option><option value="text">Tipográfico</option></select></Field>
        <Field label="Altura do hero"><select value={theme.heroHeight} onChange={e=>setTheme({heroHeight:e.target.value as PortfolioTheme['heroHeight']})}><option value="compact">Compacta</option><option value="medium">Média</option><option value="tall">Alta</option></select></Field>
      </div>
    </Section>

    <Section eyebrow="06 • LINGUAGEM GRÁFICA" title="Estilo, navegação e movimento">
      <div className="theme-grid">
        <Field label="Linguagem de fundo"><select value={theme.graphicStyle} onChange={e=>setTheme({graphicStyle:e.target.value as PortfolioTheme['graphicStyle']})}><option value="none">Limpa</option><option value="gradient">Gradientes</option><option value="grid">Grid técnico</option><option value="dots">Retícula / pontos</option><option value="geometric">Formas geométricas</option><option value="stripes">Listras</option><option value="checker">Xadrez gráfico</option><option value="lines">Linhas editoriais</option></select></Field>
        <Field label="Navegação"><select value={theme.navStyle} onChange={e=>setTheme({navStyle:e.target.value as PortfolioTheme['navStyle']})}><option value="minimal">Minimal</option><option value="floating">Flutuante</option><option value="bar">Barra</option></select></Field>
        <Field label="Tratamento de ícones"><select value={theme.iconStyle} onChange={e=>setTheme({iconStyle:e.target.value as PortfolioTheme['iconStyle']})}><option value="outline">Linha</option><option value="bold">Linha forte</option><option value="boxed">Em caixas</option><option value="none">Sem ícones</option></select></Field>
        <Field label={`Espessura dos ícones — ${theme.iconStroke.toFixed(1)}`}><input type="range" min="1" max="3" step=".2" value={theme.iconStroke} onChange={e=>setTheme({iconStroke:Number(e.target.value)})}/></Field>
        <Field label="Movimento"><select value={theme.animation} onChange={e=>setTheme({animation:e.target.value as PortfolioTheme['animation']})}><option value="none">Sem animação</option><option value="subtle">Sutil</option><option value="dynamic">Dinâmica</option></select></Field>
      </div>
    </Section>

    <Section eyebrow="07 • ÍCONES" title="Biblioteca aberta + ícones próprios">
      <p className="dashboard-help">Pesquise em toda a biblioteca aberta do Iconify (centenas de coleções). Ou envie SVG, PNG ou WebP próprio para cada função.</p>
      <div className="theme-grid">
        <Field label="Função do ícone"><select value={iconRole} onChange={e=>setIconRole(e.target.value as IconRole)}>{ICON_ROLES.map(r=><option key={r.key} value={r.key}>{r.label}</option>)}</select></Field>
        <div className="ds-current-icon"><div className="ds-icon-preview">{currentCustom?<img src={currentCustom} alt="Ícone próprio"/>:<IconifyIcon id={currentIcon} size={36}/>}</div><div><strong>{currentRole.label}</strong><small>{currentRole.description}</small><code>{currentCustom?'ícone próprio':currentIcon}</code></div>{currentCustom&&<button type="button" className="lab-secondary" onClick={clearCustom}><X size={14}/> remover próprio</button>}</div>
      </div>
      <div className="ds-icon-search"><input value={iconQuery} onChange={e=>setIconQuery(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();searchIcons();}}} placeholder="Ex.: seta, casa, câmera, portfolio, estrela..."/><button type="button" className="lab-secondary" onClick={searchIcons} disabled={iconBusy}><Search size={15}/>{iconBusy?'Buscando…':'Buscar ícones'}</button></div>
      {iconResults.length>0&&<div className="ds-icon-results">{iconResults.map(id=><button type="button" key={id} className={id===currentIcon&&!currentCustom?'selected':''} onClick={()=>chooseIcon(id)}><img src={`https://api.iconify.design/${id.replace(':','/')}.svg`} alt=""/><span>{id.split(':')[1]}</span></button>)}</div>}
      {onUploadCustomIcon&&<Field label={`Enviar ícone próprio para “${currentRole.label}”`} hint="SVG recomendado. Também aceita PNG e WebP, até 2 MB."><label className="ds-upload-button"><Upload size={16}/> Escolher arquivo<input type="file" hidden accept="image/svg+xml,image/png,image/webp" onChange={async e=>{const f=e.target.files?.[0];if(f)await onUploadCustomIcon(f,iconRole);e.currentTarget.value='';}}/></label></Field>}
    </Section>

    <Section eyebrow="08 • CONTEÚDO VISUAL" title="O que aparece e como é nomeado">
      <div className="ds-check-grid">{([
        ['showYear','Mostrar ano'],['showCategory','Mostrar categoria'],['showTags','Mostrar tags'],['showBioInHero','Bio no hero'],['showAvatar','Mostrar avatar'],['showProjectSummary','Resumo dos projetos'],
      ] as [keyof PortfolioTheme,string][]).map(([key,label])=><label className="ds-check" key={String(key)}><input type="checkbox" checked={Boolean(theme[key])} onChange={e=>setTheme({[key]:e.target.checked} as Partial<PortfolioTheme>)}/><span><Check size={14}/>{label}</span></label>)}</div>
      <div className="theme-grid" style={{marginTop:18}}><Field label="Etiqueta da abertura"><input value={theme.heroEyebrow} onChange={e=>setTheme({heroEyebrow:e.target.value})}/></Field><Field label="Título da seção projetos"><input value={theme.projectsLabel} onChange={e=>setTheme({projectsLabel:e.target.value})}/></Field><Field label="Título da seção sobre"><input value={theme.aboutLabel} onChange={e=>setTheme({aboutLabel:e.target.value})}/></Field><Field label="Título da seção contato"><input value={theme.contactLabel} onChange={e=>setTheme({contactLabel:e.target.value})}/></Field><Field label="Texto de rodapé"><input value={theme.footerText} onChange={e=>setTheme({footerText:e.target.value})} placeholder="Opcional"/></Field></div>
    </Section>

    <Section eyebrow="09 • ARQUITETURA" title="Ordem das seções">
      <div className="ds-order-list">{theme.sectionOrder.map((section,index)=><div className="ds-order-row" key={section}><span>{index+1}</span><strong>{section==='projects'?theme.projectsLabel:section==='about'?theme.aboutLabel:theme.contactLabel}</strong><div><button type="button" aria-label="Mover para cima" disabled={index===0} onClick={()=>moveSection(section,-1)}><ArrowUp size={16}/></button><button type="button" aria-label="Mover para baixo" disabled={index===theme.sectionOrder.length-1} onClick={()=>moveSection(section,1)}><ArrowDown size={16}/></button></div></div>)}</div>
    </Section>
  </div>;
}
