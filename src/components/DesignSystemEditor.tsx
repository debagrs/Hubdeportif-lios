import React from 'react';
import { ArrowDown, ArrowUp, Check, RotateCcw } from 'lucide-react';
import type { PortfolioDetail, PortfolioSectionKey, PortfolioTheme } from '../types';
import { DEFAULT_PORTFOLIO_THEME, FONT_OPTIONS, THEME_PRESETS, mergeTheme } from '../theme/portfolioTheme';

type Props = {
  portfolio: PortfolioDetail;
  onChange: (portfolio: PortfolioDetail) => void;
};

const Section = ({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) => (
  <section className="ds-editor-section">
    <div className="ds-editor-head"><p className="lab-label">{eyebrow}</p><h3>{title}</h3></div>
    <div className="ds-editor-body">{children}</div>
  </section>
);

const Field = ({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) => (
  <div className="lab-field ds-field"><label>{label}</label>{children}{hint && <small>{hint}</small>}</div>
);

export default function DesignSystemEditor({ portfolio, onChange }: Props) {
  const theme = mergeTheme(portfolio.theme);
  const setTheme = (patch: Partial<PortfolioTheme>) => onChange({ ...portfolio, theme: { ...theme, ...patch } });
  const setNumber = (key: keyof PortfolioTheme, value: string, min: number, max: number) => {
    const n = Math.max(min, Math.min(max, Number(value)));
    setTheme({ [key]: n } as Partial<PortfolioTheme>);
  };

  const moveSection = (section: PortfolioSectionKey, direction: -1 | 1) => {
    const order = [...theme.sectionOrder];
    const index = order.indexOf(section);
    const next = index + direction;
    if (index < 0 || next < 0 || next >= order.length) return;
    [order[index], order[next]] = [order[next], order[index]];
    setTheme({ sectionOrder: order });
  };

  return (
    <div className="ds-editor">
      <div className="dashboard-card ds-intro-card">
        <p className="lab-label" style={{ color:'#00FFFF' }}>DESIGN SYSTEM DO PORTFÓLIO</p>
        <h2>Autoria visual completa</h2>
        <p className="dashboard-help">O Hub não impõe a aparência do LabInterface ao portfólio público. Cada estudante controla seus próprios tokens, tipografia, grid, hierarquia, imagens, formas, navegação, ícones e linguagem gráfica. O LabInterface será apenas o lugar onde esse site poderá ser incorporado depois.</p>
        <div className="ds-preset-grid">
          {THEME_PRESETS.map(preset => <button key={preset.name} type="button" className="ds-preset" onClick={() => setTheme(preset.patch)}><strong>{preset.name}</strong><span>{preset.description}</span></button>)}
          <button type="button" className="ds-preset reset" onClick={() => setTheme(DEFAULT_PORTFOLIO_THEME)}><RotateCcw size={18}/><strong>Recomeçar</strong><span>Voltar aos tokens neutros de base.</span></button>
        </div>
      </div>

      <Section eyebrow="01 • CORES" title="Paleta e superfícies">
        <div className="ds-color-grid">
          {([
            ['background','Fundo'],['surface','Superfície'],['surfaceAlt','Superfície 2'],['text','Texto'],['muted','Texto secundário'],['accent','Cor principal'],['secondary','Cor secundária'],['border','Bordas'],
          ] as [keyof PortfolioTheme,string][]).map(([key,label]) => <Field key={String(key)} label={label}><div className="ds-color-field"><input type="color" value={String(theme[key])} onChange={e=>setTheme({[key]:e.target.value} as Partial<PortfolioTheme>)}/><input value={String(theme[key])} onChange={e=>setTheme({[key]:e.target.value} as Partial<PortfolioTheme>)}/></div></Field>)}
        </div>
        <div className="ds-palette-preview" style={{background:theme.background,color:theme.text,borderColor:theme.border}}><div style={{background:theme.surface,borderColor:theme.border}}><span style={{background:theme.accent}}/><span style={{background:theme.secondary}}/><strong>Prévia da paleta</strong><small style={{color:theme.muted}}>Fundo, superfície, texto, acentos e bordas.</small></div></div>
      </Section>

      <Section eyebrow="02 • TIPOGRAFIA" title="Fontes e hierarquia tipográfica">
        <div className="theme-grid">
          <Field label="Fonte dos títulos"><select value={theme.headingFont} onChange={e=>setTheme({headingFont:e.target.value})}>{FONT_OPTIONS.map(font=><option key={font}>{font}</option>)}</select></Field>
          <Field label="Fonte dos textos"><select value={theme.bodyFont} onChange={e=>setTheme({bodyFont:e.target.value})}>{FONT_OPTIONS.map(font=><option key={font}>{font}</option>)}</select></Field>
          <Field label="Fonte técnica / etiquetas"><select value={theme.monoFont} onChange={e=>setTheme({monoFont:e.target.value})}>{FONT_OPTIONS.map(font=><option key={font}>{font}</option>)}</select></Field>
          <Field label={`Peso dos títulos — ${theme.headingWeight}`}><input type="range" min="300" max="900" step="100" value={theme.headingWeight} onChange={e=>setNumber('headingWeight',e.target.value,300,900)}/></Field>
          <Field label={`Peso do corpo — ${theme.bodyWeight}`}><input type="range" min="300" max="800" step="100" value={theme.bodyWeight} onChange={e=>setNumber('bodyWeight',e.target.value,300,800)}/></Field>
          <Field label="Caixa dos títulos"><select value={theme.headingCase} onChange={e=>setTheme({headingCase:e.target.value as PortfolioTheme['headingCase']})}><option value="none">Como digitado</option><option value="uppercase">CAIXA ALTA</option><option value="lowercase">caixa baixa</option></select></Field>
          <Field label="Estilo dos títulos"><select value={theme.headingStyle} onChange={e=>setTheme({headingStyle:e.target.value as PortfolioTheme['headingStyle']})}><option value="normal">Normal</option><option value="italic">Itálico</option></select></Field>
          <Field label={`Tracking dos títulos — ${theme.headingTracking / 10}em`}><input type="range" min="-8" max="12" step="1" value={theme.headingTracking} onChange={e=>setNumber('headingTracking',e.target.value,-8,12)}/></Field>
          <Field label={`Corpo do texto — ${theme.bodySize}px`}><input type="range" min="14" max="22" step="1" value={theme.bodySize} onChange={e=>setNumber('bodySize',e.target.value,14,22)}/></Field>
          <Field label={`Entrelinha — ${theme.bodyLeading.toFixed(2)}`}><input type="range" min="1.2" max="2" step="0.05" value={theme.bodyLeading} onChange={e=>setTheme({bodyLeading:Number(e.target.value)})}/></Field>
          <Field label="Escala da hierarquia"><select value={theme.headingScale} onChange={e=>setTheme({headingScale:e.target.value as PortfolioTheme['headingScale']})}><option value="compact">Compacta</option><option value="balanced">Equilibrada</option><option value="oversized">Oversized</option></select></Field>
          <Field label="Alinhamento editorial"><select value={theme.textAlign} onChange={e=>setTheme({textAlign:e.target.value as PortfolioTheme['textAlign']})}><option value="left">Esquerda</option><option value="center">Centralizado</option></select></Field>
        </div>
        <div className="ds-type-preview" style={{fontFamily:`"${theme.bodyFont}",sans-serif`,fontWeight:theme.bodyWeight,fontSize:theme.bodySize,lineHeight:theme.bodyLeading}}><h4 style={{fontFamily:`"${theme.headingFont}",sans-serif`,fontWeight:theme.headingWeight,fontStyle:theme.headingStyle,textTransform:theme.headingCase==='none'?'none':theme.headingCase,letterSpacing:`${theme.headingTracking/10}em`}}>Hierarquia autoral</h4><p>O estudante decide como o conteúdo é lido, visto e organizado.</p><code style={{fontFamily:`"${theme.monoFont}",monospace`}}>ETIQUETA / META / 2026</code></div>
      </Section>

      <Section eyebrow="03 • GRID" title="Malha, ritmo e composição">
        <div className="theme-grid">
          <Field label="Largura máxima"><select value={theme.contentWidth} onChange={e=>setTheme({contentWidth:Number(e.target.value) as PortfolioTheme['contentWidth']})}><option value="900">900 px — íntimo</option><option value="1100">1100 px — editorial</option><option value="1280">1280 px — amplo</option><option value="1440">1440 px — expansivo</option></select></Field>
          <Field label="Colunas dos projetos"><select value={theme.gridColumns} onChange={e=>setTheme({gridColumns:Number(e.target.value) as PortfolioTheme['gridColumns']})}>{[1,2,3,4].map(n=><option key={n} value={n}>{n} coluna{n>1?'s':''}</option>)}</select></Field>
          <Field label={`Gap do grid — ${theme.gridGap}px`}><input type="range" min="0" max="64" value={theme.gridGap} onChange={e=>setNumber('gridGap',e.target.value,0,64)}/></Field>
          <Field label={`Respiro entre seções — ${theme.sectionGap}px`}><input type="range" min="40" max="200" value={theme.sectionGap} onChange={e=>setNumber('sectionGap',e.target.value,40,200)}/></Field>
          <Field label={`Margem lateral — ${theme.sidePadding}px`}><input type="range" min="12" max="72" value={theme.sidePadding} onChange={e=>setNumber('sidePadding',e.target.value,12,72)}/></Field>
          <Field label="Composição dos projetos"><select value={theme.projectLayout} onChange={e=>setTheme({projectLayout:e.target.value as PortfolioTheme['projectLayout']})}><option value="grid">Grade</option><option value="editorial">Editorial alternado</option><option value="stack">Lista / pilha</option></select></Field>
          <Field label="Informação no card"><select value={theme.projectInfo} onChange={e=>setTheme({projectInfo:e.target.value as PortfolioTheme['projectInfo']})}><option value="below">Texto abaixo da imagem</option><option value="overlay">Texto sobre a imagem</option><option value="split">Imagem + texto lado a lado</option></select></Field>
        </div>
      </Section>

      <Section eyebrow="04 • FORMAS" title="Cards, bordas, botões e profundidade">
        <div className="theme-grid">
          <Field label={`Raio dos cards — ${theme.cardRadius}px`}><input type="range" min="0" max="64" value={theme.cardRadius} onChange={e=>setNumber('cardRadius',e.target.value,0,64)}/></Field>
          <Field label={`Raio dos botões — ${theme.buttonRadius}px`}><input type="range" min="0" max="999" value={theme.buttonRadius} onChange={e=>setNumber('buttonRadius',e.target.value,0,999)}/></Field>
          <Field label={`Espessura de borda — ${theme.borderWidth}px`}><input type="range" min="0" max="4" value={theme.borderWidth} onChange={e=>setNumber('borderWidth',e.target.value,0,4)}/></Field>
          <Field label="Estilo dos cards"><select value={theme.cardStyle} onChange={e=>setTheme({cardStyle:e.target.value as PortfolioTheme['cardStyle']})}><option value="surface">Superfície</option><option value="outline">Contorno</option><option value="minimal">Sem card</option></select></Field>
          <Field label="Sombras"><select value={theme.shadow} onChange={e=>setTheme({shadow:e.target.value as PortfolioTheme['shadow']})}><option value="none">Sem sombra</option><option value="soft">Suave</option><option value="hard">Dura</option></select></Field>
          <Field label="Botões"><select value={theme.buttonStyle} onChange={e=>setTheme({buttonStyle:e.target.value as PortfolioTheme['buttonStyle']})}><option value="solid">Sólido</option><option value="outline">Contorno</option><option value="text">Somente texto</option></select></Field>
        </div>
      </Section>

      <Section eyebrow="05 • IMAGENS" title="Direção de arte das imagens">
        <div className="theme-grid">
          <Field label="Proporção das capas"><select value={theme.projectAspect} onChange={e=>setTheme({projectAspect:e.target.value as PortfolioTheme['projectAspect']})}><option value="wide">21:9</option><option value="landscape">16:10</option><option value="square">1:1</option><option value="portrait">3:4</option><option value="auto">Livre</option></select></Field>
          <Field label="Encaixe"><select value={theme.imageFit} onChange={e=>setTheme({imageFit:e.target.value as PortfolioTheme['imageFit']})}><option value="cover">Preencher / cortar</option><option value="contain">Mostrar inteira</option></select></Field>
          <Field label="Hero / abertura"><select value={theme.heroStyle} onChange={e=>setTheme({heroStyle:e.target.value as PortfolioTheme['heroStyle']})}><option value="split">Texto + imagem</option><option value="full">Imagem cheia</option><option value="text">Tipográfico</option></select></Field>
          <Field label="Altura do hero"><select value={theme.heroHeight} onChange={e=>setTheme({heroHeight:e.target.value as PortfolioTheme['heroHeight']})}><option value="compact">Compacta</option><option value="medium">Média</option><option value="tall">Alta</option></select></Field>
        </div>
      </Section>

      <Section eyebrow="06 • LINGUAGEM GRÁFICA" title="Estilo, navegação, ícones e movimento">
        <div className="theme-grid">
          <Field label="Linguagem de fundo"><select value={theme.graphicStyle} onChange={e=>setTheme({graphicStyle:e.target.value as PortfolioTheme['graphicStyle']})}><option value="none">Limpa</option><option value="gradient">Gradientes</option><option value="grid">Grid técnico</option><option value="dots">Retícula / pontos</option><option value="geometric">Formas geométricas</option></select></Field>
          <Field label="Navegação"><select value={theme.navStyle} onChange={e=>setTheme({navStyle:e.target.value as PortfolioTheme['navStyle']})}><option value="minimal">Minimal</option><option value="floating">Flutuante</option><option value="bar">Barra</option></select></Field>
          <Field label="Ícones"><select value={theme.iconStyle} onChange={e=>setTheme({iconStyle:e.target.value as PortfolioTheme['iconStyle']})}><option value="outline">Linha</option><option value="bold">Linha forte</option><option value="boxed">Em caixas</option><option value="none">Sem ícones</option></select></Field>
          <Field label={`Espessura dos ícones — ${theme.iconStroke.toFixed(1)}`}><input type="range" min="1" max="3" step="0.2" value={theme.iconStroke} onChange={e=>setTheme({iconStroke:Number(e.target.value)})}/></Field>
          <Field label="Movimento"><select value={theme.animation} onChange={e=>setTheme({animation:e.target.value as PortfolioTheme['animation']})}><option value="none">Sem animação</option><option value="subtle">Sutil</option><option value="dynamic">Dinâmica</option></select></Field>
        </div>
      </Section>

      <Section eyebrow="07 • CONTEÚDO VISUAL" title="O que aparece e como é nomeado">
        <div className="ds-check-grid">
          {([
            ['showYear','Mostrar ano'],['showCategory','Mostrar categoria'],['showTags','Mostrar tags'],['showBioInHero','Bio no hero'],['showAvatar','Mostrar avatar'],['showProjectSummary','Resumo dos projetos'],
          ] as [keyof PortfolioTheme,string][]).map(([key,label])=><label className="ds-check" key={String(key)}><input type="checkbox" checked={Boolean(theme[key])} onChange={e=>setTheme({[key]:e.target.checked} as Partial<PortfolioTheme>)}/><span><Check size={14}/>{label}</span></label>)}
        </div>
        <div className="theme-grid" style={{marginTop:18}}>
          <Field label="Etiqueta da abertura"><input value={theme.heroEyebrow} onChange={e=>setTheme({heroEyebrow:e.target.value})}/></Field>
          <Field label="Título da seção projetos"><input value={theme.projectsLabel} onChange={e=>setTheme({projectsLabel:e.target.value})}/></Field>
          <Field label="Título da seção sobre"><input value={theme.aboutLabel} onChange={e=>setTheme({aboutLabel:e.target.value})}/></Field>
          <Field label="Título da seção contato"><input value={theme.contactLabel} onChange={e=>setTheme({contactLabel:e.target.value})}/></Field>
          <Field label="Texto de rodapé"><input value={theme.footerText} onChange={e=>setTheme({footerText:e.target.value})} placeholder="Opcional"/></Field>
        </div>
      </Section>

      <Section eyebrow="08 • ARQUITETURA" title="Ordem das seções">
        <div className="ds-order-list">
          {theme.sectionOrder.map((section,index)=><div className="ds-order-row" key={section}><span>{index+1}</span><strong>{section==='projects'?theme.projectsLabel:section==='about'?theme.aboutLabel:theme.contactLabel}</strong><div><button type="button" aria-label="Mover para cima" disabled={index===0} onClick={()=>moveSection(section,-1)}><ArrowUp size={16}/></button><button type="button" aria-label="Mover para baixo" disabled={index===theme.sectionOrder.length-1} onClick={()=>moveSection(section,1)}><ArrowDown size={16}/></button></div></div>)}
        </div>
      </Section>
    </div>
  );
}
