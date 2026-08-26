import React from 'react';
import { X } from 'lucide-react';
import type { IconRole, PortfolioDetail, PortfolioSectionKey, Project } from '../types';
import { fontStack, mergeTheme } from '../theme/portfolioTheme';
import GoogleFontLoader from './GoogleFontLoader';
import { IconOrCustom } from './IconifyIcon';
import P5Embed from './P5Embed';

type Props = { portfolio:PortfolioDetail; embedded?:boolean };

export default function PortfolioRenderer({ portfolio, embedded=false }: Props) {
  const theme=mergeTheme(portfolio.theme);
  const [menuOpen,setMenuOpen]=React.useState(false);
  const projects=portfolio.projects.filter(project=>project.published!==false);
  const headingTransform=theme.headingCase==='none'?'none':theme.headingCase;
  const heroMin=theme.heroHeight==='compact'?'420px':theme.heroHeight==='tall'?'760px':'580px';
  const aspect=theme.projectAspect==='wide'?'21/9':theme.projectAspect==='landscape'?'16/10':theme.projectAspect==='square'?'1/1':theme.projectAspect==='portrait'?'3/4':'auto';
  const shadow=theme.shadow==='soft'?'0 24px 70px rgba(0,0,0,.12)':theme.shadow==='hard'?'10px 10px 0 var(--pf-border)':'none';
  const style={
    ['--pf-bg' as string]:theme.background,['--pf-surface' as string]:theme.surface,['--pf-surface-alt' as string]:theme.surfaceAlt,['--pf-text' as string]:theme.text,['--pf-muted' as string]:theme.muted,['--pf-accent' as string]:theme.accent,['--pf-secondary' as string]:theme.secondary,['--pf-border' as string]:theme.border,
    ['--pf-heading-font' as string]:fontStack(theme.headingFont),['--pf-body-font' as string]:fontStack(theme.bodyFont),['--pf-mono-font' as string]:fontStack(theme.monoFont),['--pf-heading-weight' as string]:theme.headingWeight,['--pf-body-weight' as string]:theme.bodyWeight,['--pf-heading-transform' as string]:headingTransform,['--pf-heading-style' as string]:theme.headingStyle,['--pf-heading-tracking' as string]:`${theme.headingTracking/10}em`,['--pf-body-size' as string]:`${theme.bodySize}px`,['--pf-body-leading' as string]:theme.bodyLeading,
    ['--pf-width' as string]:`${theme.contentWidth}px`,['--pf-cols' as string]:theme.gridColumns,['--pf-cols-tablet' as string]:theme.gridColumnsTablet,['--pf-cols-mobile' as string]:theme.gridColumnsMobile,['--pf-gap' as string]:`${theme.gridGap}px`,['--pf-gallery-cols' as string]:theme.galleryColumns,['--pf-gallery-cols-mobile' as string]:Math.min(theme.galleryColumns,2),['--pf-section-gap' as string]:`${theme.sectionGap}px`,['--pf-pad' as string]:`${theme.sidePadding}px`,['--pf-radius' as string]:`${theme.cardRadius}px`,['--pf-btn-radius' as string]:`${theme.buttonRadius}px`,['--pf-border-width' as string]:`${theme.borderWidth}px`,['--pf-aspect' as string]:aspect,['--pf-fit' as string]:theme.imageFit,['--pf-hero-min' as string]:heroMin,['--pf-shadow' as string]:shadow,
  } as React.CSSProperties;
  const heroScaleClass=`pf-heading-${theme.headingScale}`,aspectClass=`pf-aspect-${theme.projectAspect}`,cardClass=`pf-card-${theme.cardStyle}`,buttonClass=`pf-button-${theme.buttonStyle}`,graphicClass=`pf-graphic-${theme.graphicStyle}`,animationClass=`pf-animation-${theme.animation}`,infoClass=`pf-info-${theme.projectInfo}`,layoutClass=`pf-layout-${theme.projectLayout}`,navClass=`pf-nav-${theme.navStyle}`,iconClass=`pf-icons-${theme.iconStyle}`,alignClass=`pf-align-${theme.textAlign}`;
  const navLinks:{id:PortfolioSectionKey;label:string;role:IconRole}[]=theme.sectionOrder.map(id=>({id,label:id==='projects'?theme.projectsLabel:id==='about'?theme.aboutLabel:theme.contactLabel,role:id==='projects'?'projects':id==='about'?'about':'contact'}));
  const glyph=(role:IconRole,size=18,alt='')=><IconOrCustom iconId={theme.iconAssignments[role]} customUrl={theme.customIconUrls?.[role]} size={size} alt={alt}/>;

  const Interactive = ({project,position}:{project:Project;position:string}) => {
    const interactive=project.interactive||{type:'none'};
    if(interactive.type==='none'||(interactive.position||'after-text')!==position)return null;
    if(interactive.type==='p5'&&interactive.p5Code)return <div className="pf-interactive"><P5Embed code={interactive.p5Code} height={interactive.height||520} title={interactive.title||`Sketch p5.js — ${project.title}`}/></div>;
    if(interactive.type==='iframe'&&interactive.url)return <div className="pf-interactive"><iframe className="pf-interactive-frame" src={interactive.url} title={interactive.title||`Conteúdo interativo — ${project.title}`} style={{height:`${interactive.height||520}px`}} sandbox="allow-scripts allow-forms allow-popups" loading="lazy"/></div>;
    return null;
  };

  function ProjectCopy({project}:{project:Project}){
    return <div className="pf-project-copy">
      {(theme.showCategory||theme.showYear)&&<div className="pf-meta">{theme.showCategory&&<span>{project.category||'Projeto'}</span>}{theme.showYear&&<span>{project.year}</span>}</div>}
      <h3>{project.title}</h3>{project.subtitle&&<p className="pf-project-subtitle">{project.subtitle}</p>}{theme.showProjectSummary&&project.summary&&<p className="pf-project-summary">{project.summary}</p>}
      {theme.showTags&&project.tags?.length>0&&<div className="pf-tags">{project.tags.map(tag=><span key={tag}>{tag}</span>)}</div>}
      <Interactive project={project} position="before-text"/>
      {project.body&&<div className="pf-project-body">{project.body}</div>}
      <Interactive project={project} position="after-text"/>
      {project.gallery?.length>0&&<div className="pf-gallery">{project.gallery.map((url,i)=><img src={url} alt={`Imagem ${i+1} do projeto ${project.title}`} key={`${url}-${i}`} loading="lazy"/>)}</div>}
      <Interactive project={project} position="after-gallery"/>
      {project.attachments?.length>0&&<div className="pf-attachments">{project.attachments.map(item=><a href={item.url} target="_blank" rel="noreferrer" key={item.id} className={`pf-attachment ${cardClass}`}><span>{item.type==='pdf'?'PDF':item.type==='link'?'LINK':'ARQUIVO'}</span><strong>{item.title}</strong>{glyph('external',16)}</a>)}</div>}
      {project.externalUrl&&<a className={`pf-button ${buttonClass}`} href={project.externalUrl} target="_blank" rel="noreferrer">Ver projeto {theme.iconStyle!=='none'&&glyph('external')}</a>}
    </div>;
  }

  const renderProject=(project:Project,index:number)=><article className={`pf-project ${cardClass} ${infoClass} ${project.featured&&theme.featuredSpan?'pf-project-featured':''}`} key={project.id} style={{animationDelay:`${Math.min(index,8)*70}ms`}}><div className="pf-project-media">{project.coverUrl?<img src={project.coverUrl} alt={`Capa do projeto ${project.title}`} loading="lazy"/>:<div className="pf-project-placeholder"/>}{theme.projectInfo==='overlay'&&<div className="pf-overlay-shade"/>}{theme.projectInfo==='overlay'&&<ProjectCopy project={project}/>}</div>{theme.projectInfo!=='overlay'&&<ProjectCopy project={project}/>}</article>;

  const AboutSection=()=> <section id="about" className="pf-section"><div className="pf-container"><div className="pf-section-heading"><span>{theme.iconStyle!=='none'&&glyph('about',16)} {theme.aboutLabel}</span><h2>{theme.aboutLabel}</h2></div><div className="pf-about-grid"><div>{theme.showAvatar&&<div className="pf-avatar">{portfolio.avatarUrl?<img src={portfolio.avatarUrl} alt={`Retrato de ${portfolio.displayName}`}/>:portfolio.displayName.slice(0,2).toUpperCase()}</div>}</div><div><p className="pf-about-text">{portfolio.about||portfolio.bio}</p></div></div></div></section>;
  const ContactSection=()=>{const contacts=[portfolio.publicEmail&&{role:'mail' as IconRole,label:'E-mail',href:`mailto:${portfolio.publicEmail}`},portfolio.instagramUrl&&{role:'instagram' as IconRole,label:'Instagram',href:portfolio.instagramUrl},portfolio.linkedinUrl&&{role:'linkedin' as IconRole,label:'LinkedIn',href:portfolio.linkedinUrl},portfolio.websiteUrl&&{role:'website' as IconRole,label:'Site',href:portfolio.websiteUrl}].filter(Boolean) as {role:IconRole;label:string;href:string}[];return <section id="contact" className="pf-section"><div className="pf-container"><div className="pf-section-heading"><span>{theme.iconStyle!=='none'&&glyph('contact',16)} {theme.contactLabel}</span><h2>{theme.contactLabel}</h2></div>{contacts.length?<div className="pf-contact-grid">{contacts.map(c=><a className={`pf-contact ${cardClass}`} href={c.href} target={c.href.startsWith('mailto:')?undefined:'_blank'} rel="noreferrer" key={c.label}>{theme.iconStyle!=='none'&&<span className="pf-icon-box">{glyph(c.role,18)}</span>}<strong>{c.label}</strong>{glyph('external',18)}</a>)}</div>:<p className="pf-muted">Canais de contato ainda não publicados.</p>}</div></section>};
  const ProjectsSection=()=> <section id="projects" className="pf-section"><div className="pf-container"><div className="pf-section-heading"><span>{theme.iconStyle!=='none'&&glyph('projects',16)} {theme.projectsLabel}</span><h2>{theme.projectsLabel}</h2></div>{projects.length?<div className={`pf-projects ${layoutClass}`}>{projects.map(renderProject)}</div>:<div className="pf-empty">Os projetos serão publicados aqui.</div>}</div></section>;
  const sections:Record<PortfolioSectionKey,React.ReactNode>={projects:<ProjectsSection/>,about:<AboutSection/>,contact:<ContactSection/>};

  return <div className={`portfolio-site ${graphicClass} ${animationClass} ${navClass} ${iconClass} ${heroScaleClass} ${aspectClass} ${alignClass}`} style={style}>
    <GoogleFontLoader fonts={[theme.headingFont,theme.bodyFont,theme.monoFont]}/><a className="pf-skip" href="#projects">Ir para o conteúdo</a>
    <nav className="pf-nav" aria-label="Navegação do portfólio"><a className="pf-brand" href="#top">{portfolio.displayName}</a><div className={`pf-nav-links ${menuOpen?'open':''}`}>{navLinks.map(link=><a key={link.id} href={`#${link.id}`} onClick={()=>setMenuOpen(false)}>{theme.iconStyle!=='none'&&glyph(link.role,15)}{link.label}</a>)}{!embedded&&<a href="/" className="pf-hub-link">Hub</a>}</div><button className="pf-menu-button" aria-label={menuOpen?'Fechar menu':'Abrir menu'} onClick={()=>setMenuOpen(!menuOpen)}>{menuOpen?<X size={20}/>:glyph('menu',20)}</button></nav>
    <header id="top" className={`pf-hero pf-hero-${theme.heroStyle}`}><div className="pf-container pf-hero-inner"><div className="pf-hero-copy"><span className="pf-eyebrow">{theme.heroEyebrow}</span><h1>{portfolio.displayName}</h1><p className="pf-headline">{portfolio.headline}</p>{theme.showBioInHero&&portfolio.bio&&<p className="pf-hero-bio">{portfolio.bio}</p>}<a className={`pf-button ${buttonClass}`} href="#projects">{theme.projectsLabel}{theme.iconStyle!=='none'&&glyph('down')}</a></div>{theme.heroStyle!=='text'&&<div className="pf-hero-media">{portfolio.heroImageUrl?<img src={portfolio.heroImageUrl} alt={`Imagem de abertura do portfólio de ${portfolio.displayName}`}/>:<div className="pf-hero-placeholder"><span style={{background:theme.accent}}/><span style={{background:theme.secondary}}/></div>}</div>}</div></header>
    <main>{theme.sectionOrder.map(section=><React.Fragment key={section}>{sections[section]}</React.Fragment>)}</main>
    <footer className="pf-footer"><div className="pf-container"><span>{theme.footerText||`${portfolio.displayName} — ${new Date().getFullYear()}`}</span>{!embedded&&<a href="/">Portfólios LabInterface</a>}</div></footer>
  </div>;
}
