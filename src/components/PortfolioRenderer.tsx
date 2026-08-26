import React from 'react';
import { ArrowDown, ArrowUpRight, ExternalLink, Instagram, Linkedin, Mail, Menu, X } from 'lucide-react';
import type { PortfolioDetail, PortfolioSectionKey } from '../types';
import { fontStack, mergeTheme } from '../theme/portfolioTheme';

type Props = { portfolio: PortfolioDetail; embedded?: boolean };

const iconComponent = (kind: string) => kind === 'mail' ? Mail : kind === 'instagram' ? Instagram : kind === 'linkedin' ? Linkedin : ExternalLink;

export default function PortfolioRenderer({ portfolio, embedded = false }: Props) {
  const theme = mergeTheme(portfolio.theme);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const projects = portfolio.projects.filter(project => project.published !== false);
  const headingTransform = theme.headingCase === 'none' ? 'none' : theme.headingCase;
  const heroMin = theme.heroHeight === 'compact' ? '420px' : theme.heroHeight === 'tall' ? '760px' : '580px';
  const aspect = theme.projectAspect === 'wide' ? '21/9' : theme.projectAspect === 'landscape' ? '16/10' : theme.projectAspect === 'square' ? '1/1' : theme.projectAspect === 'portrait' ? '3/4' : 'auto';
  const shadow = theme.shadow === 'soft' ? '0 24px 70px rgba(0,0,0,.12)' : theme.shadow === 'hard' ? '10px 10px 0 var(--pf-border)' : 'none';

  const style = {
    ['--pf-bg' as string]: theme.background,
    ['--pf-surface' as string]: theme.surface,
    ['--pf-surface-alt' as string]: theme.surfaceAlt,
    ['--pf-text' as string]: theme.text,
    ['--pf-muted' as string]: theme.muted,
    ['--pf-accent' as string]: theme.accent,
    ['--pf-secondary' as string]: theme.secondary,
    ['--pf-border' as string]: theme.border,
    ['--pf-heading-font' as string]: fontStack(theme.headingFont),
    ['--pf-body-font' as string]: fontStack(theme.bodyFont),
    ['--pf-mono-font' as string]: fontStack(theme.monoFont),
    ['--pf-heading-weight' as string]: theme.headingWeight,
    ['--pf-body-weight' as string]: theme.bodyWeight,
    ['--pf-heading-transform' as string]: headingTransform,
    ['--pf-heading-style' as string]: theme.headingStyle,
    ['--pf-heading-tracking' as string]: `${theme.headingTracking / 10}em`,
    ['--pf-body-size' as string]: `${theme.bodySize}px`,
    ['--pf-body-leading' as string]: theme.bodyLeading,
    ['--pf-width' as string]: `${theme.contentWidth}px`,
    ['--pf-cols' as string]: theme.gridColumns,
    ['--pf-gap' as string]: `${theme.gridGap}px`,
    ['--pf-section-gap' as string]: `${theme.sectionGap}px`,
    ['--pf-pad' as string]: `${theme.sidePadding}px`,
    ['--pf-radius' as string]: `${theme.cardRadius}px`,
    ['--pf-btn-radius' as string]: `${theme.buttonRadius}px`,
    ['--pf-border-width' as string]: `${theme.borderWidth}px`,
    ['--pf-aspect' as string]: aspect,
    ['--pf-fit' as string]: theme.imageFit,
    ['--pf-hero-min' as string]: heroMin,
    ['--pf-shadow' as string]: shadow,
    textAlign: theme.textAlign,
  } as React.CSSProperties;

  const iconStroke = theme.iconStyle === 'bold' ? Math.max(2.4,theme.iconStroke) : theme.iconStroke;
  const iconProps = { size: 18, strokeWidth: iconStroke };
  const heroScaleClass = `pf-heading-${theme.headingScale}`;
  const cardClass = `pf-card-${theme.cardStyle}`;
  const buttonClass = `pf-button-${theme.buttonStyle}`;
  const graphicClass = `pf-graphic-${theme.graphicStyle}`;
  const animationClass = `pf-animation-${theme.animation}`;
  const infoClass = `pf-info-${theme.projectInfo}`;
  const layoutClass = `pf-layout-${theme.projectLayout}`;
  const navClass = `pf-nav-${theme.navStyle}`;
  const iconClass = `pf-icons-${theme.iconStyle}`;

  const navLinks: { id: PortfolioSectionKey; label: string }[] = theme.sectionOrder.map(id => ({ id, label:id==='projects'?theme.projectsLabel:id==='about'?theme.aboutLabel:theme.contactLabel }));

  const renderProject = (project: typeof projects[number], index: number) => (
    <article className={`pf-project ${cardClass} ${infoClass}`} key={project.id} style={{animationDelay:`${Math.min(index,8)*70}ms`}}>
      <div className="pf-project-media">
        {project.coverUrl ? <img src={project.coverUrl} alt={`Capa do projeto ${project.title}`} loading="lazy"/> : <div className="pf-project-placeholder"/>}
        {theme.projectInfo === 'overlay' && <div className="pf-overlay-shade"/>}
        {theme.projectInfo === 'overlay' && <ProjectCopy project={project}/>} 
      </div>
      {theme.projectInfo !== 'overlay' && <ProjectCopy project={project}/>} 
    </article>
  );

  function ProjectCopy({ project }: { project: typeof projects[number] }) {
    return <div className="pf-project-copy">
      {(theme.showCategory || theme.showYear) && <div className="pf-meta">{theme.showCategory && <span>{project.category || 'Projeto'}</span>}{theme.showYear && <span>{project.year}</span>}</div>}
      <h3>{project.title}</h3>
      {project.subtitle && <p className="pf-project-subtitle">{project.subtitle}</p>}
      {theme.showProjectSummary && project.summary && <p className="pf-project-summary">{project.summary}</p>}
      {theme.showTags && project.tags?.length > 0 && <div className="pf-tags">{project.tags.map(tag=><span key={tag}>{tag}</span>)}</div>}
      {project.body && <div className="pf-project-body">{project.body}</div>}
      {project.gallery?.length > 0 && <div className="pf-gallery">{project.gallery.map((url,i)=><img src={url} alt={`Imagem ${i+1} do projeto ${project.title}`} key={`${url}-${i}`} loading="lazy"/>)}</div>}
      {project.externalUrl && <a className={`pf-button ${buttonClass}`} href={project.externalUrl} target="_blank" rel="noreferrer">Ver projeto {theme.iconStyle!=='none'&&<ExternalLink {...iconProps}/>}</a>}
    </div>;
  }

  const AboutSection = () => <section id="about" className="pf-section"><div className="pf-container"><div className="pf-section-heading"><span>{theme.aboutLabel}</span><h2>{theme.aboutLabel}</h2></div><div className="pf-about-grid"><div>{theme.showAvatar && <div className="pf-avatar">{portfolio.avatarUrl?<img src={portfolio.avatarUrl} alt={`Retrato de ${portfolio.displayName}`}/>:portfolio.displayName.slice(0,2).toUpperCase()}</div>}</div><div><p className="pf-about-text">{portfolio.about || portfolio.bio}</p></div></div></div></section>;

  const ContactSection = () => {
    const contacts = [
      portfolio.publicEmail && {kind:'mail',label:'E-mail',href:`mailto:${portfolio.publicEmail}`},
      portfolio.instagramUrl && {kind:'instagram',label:'Instagram',href:portfolio.instagramUrl},
      portfolio.linkedinUrl && {kind:'linkedin',label:'LinkedIn',href:portfolio.linkedinUrl},
      portfolio.websiteUrl && {kind:'external',label:'Site',href:portfolio.websiteUrl},
    ].filter(Boolean) as {kind:string;label:string;href:string}[];
    return <section id="contact" className="pf-section"><div className="pf-container"><div className="pf-section-heading"><span>{theme.contactLabel}</span><h2>{theme.contactLabel}</h2></div>{contacts.length?<div className="pf-contact-grid">{contacts.map(contact=>{const Icon=iconComponent(contact.kind);return <a className={`pf-contact ${cardClass}`} href={contact.href} target={contact.href.startsWith('mailto:')?undefined:'_blank'} rel="noreferrer" key={contact.label}>{theme.iconStyle!=='none'&&<span className="pf-icon-box"><Icon {...iconProps}/></span>}<strong>{contact.label}</strong><ArrowUpRight {...iconProps}/></a>})}</div>:<p className="pf-muted">Canais de contato ainda não publicados.</p>}</div></section>;
  };

  const ProjectsSection = () => <section id="projects" className="pf-section"><div className="pf-container"><div className="pf-section-heading"><span>{theme.projectsLabel}</span><h2>{theme.projectsLabel}</h2></div>{projects.length?<div className={`pf-projects ${layoutClass}`}>{projects.map(renderProject)}</div>:<div className="pf-empty">Os projetos serão publicados aqui.</div>}</div></section>;

  const sections: Record<PortfolioSectionKey, React.ReactNode> = { projects:<ProjectsSection/>, about:<AboutSection/>, contact:<ContactSection/> };

  return (
    <div className={`portfolio-site ${graphicClass} ${animationClass} ${navClass} ${iconClass} ${heroScaleClass}`} style={style}>
      <a className="pf-skip" href="#projects">Ir para o conteúdo</a>
      <nav className="pf-nav" aria-label="Navegação do portfólio">
        <a className="pf-brand" href="#top">{portfolio.displayName}</a>
        <div className={`pf-nav-links ${menuOpen?'open':''}`}>{navLinks.map(link=><a key={link.id} href={`#${link.id}`} onClick={()=>setMenuOpen(false)}>{link.label}</a>)}{!embedded&&<a href="/" className="pf-hub-link">Hub</a>}</div>
        <button className="pf-menu-button" aria-label={menuOpen?'Fechar menu':'Abrir menu'} onClick={()=>setMenuOpen(!menuOpen)}>{menuOpen?<X {...iconProps}/>:<Menu {...iconProps}/>}</button>
      </nav>

      <header id="top" className={`pf-hero pf-hero-${theme.heroStyle}`}>
        <div className="pf-container pf-hero-inner">
          <div className="pf-hero-copy"><span className="pf-eyebrow">{theme.heroEyebrow}</span><h1>{portfolio.displayName}</h1><p className="pf-headline">{portfolio.headline}</p>{theme.showBioInHero&&portfolio.bio&&<p className="pf-hero-bio">{portfolio.bio}</p>}<a className={`pf-button ${buttonClass}`} href="#projects">{theme.projectsLabel}{theme.iconStyle!=='none'&&<ArrowDown {...iconProps}/>}</a></div>
          {theme.heroStyle!=='text' && <div className="pf-hero-media">{portfolio.heroImageUrl?<img src={portfolio.heroImageUrl} alt={`Imagem de abertura do portfólio de ${portfolio.displayName}`}/>:<div className="pf-hero-placeholder"><span style={{background:theme.accent}}/><span style={{background:theme.secondary}}/></div>}</div>}
        </div>
      </header>

      <main>{theme.sectionOrder.map(section=><React.Fragment key={section}>{sections[section]}</React.Fragment>)}</main>
      <footer className="pf-footer"><div className="pf-container"><span>{theme.footerText || `${portfolio.displayName} — ${new Date().getFullYear()}`}</span>{!embedded&&<a href="/">Portfólios LabInterface</a>}</div></footer>
    </div>
  );
}
