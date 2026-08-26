import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowUpRight, ExternalLink, Mail } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import HubHeader from '../components/HubHeader';
import HubFooter from '../components/HubFooter';
import { getDemoPortfolio } from '../data/demo';
import { hubApi } from '../lib/api';
import type { PortfolioDetail } from '../types';

export default function PortfolioPage() {
  const { slug = '' } = useParams();
  const [portfolio, setPortfolio] = useState<PortfolioDetail | null>(getDemoPortfolio(slug));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    hubApi.getPublicPortfolio(slug)
      .then(result => {
        if (result.portfolio) setPortfolio(result.portfolio);
        else setPortfolio(getDemoPortfolio(slug));
      })
      .catch(() => setPortfolio(getDemoPortfolio(slug)))
      .finally(() => setLoading(false));
  }, [slug]);

  if (!portfolio && !loading) {
    return (
      <div className="lab-page">
        <HubHeader />
        <main className="lab-main"><div className="lab-container lab-section"><div className="lab-empty"><h1>Portfólio não encontrado</h1><Link className="lab-secondary" to="/">Voltar ao Hub</Link></div></div></main>
      </div>
    );
  }

  if (!portfolio) {
    return <div className="lab-page"><HubHeader /><main className="lab-main"><div className="lab-container lab-section">Carregando…</div></main></div>;
  }

  const accent = portfolio.theme?.accent || '#00FFFF';
  const secondary = portfolio.theme?.secondary || '#D2A979';
  const radius = portfolio.theme?.cardRadius || 'round';
  const layout = portfolio.theme?.projectLayout || 'grid';
  const publishedProjects = portfolio.projects.filter(project => project.published !== false);

  return (
    <div
      className={`lab-page student-portfolio radius-${radius} projects-${layout}`}
      style={{
        ['--student-accent' as string]: accent,
        ['--student-secondary' as string]: secondary,
      }}
    >
      <HubHeader />
      <main className="lab-main">
        <section className="lab-section">
          <div className="lab-container">
            <Link to="/" className="lab-secondary portfolio-back"><ArrowLeft size={17} /> Hub</Link>
            <div className="portfolio-cover" style={{ borderColor: `color-mix(in srgb, ${accent} 26%, transparent)` }}>
              {portfolio.heroImageUrl && <img src={portfolio.heroImageUrl} alt={`Imagem de abertura do portfólio de ${portfolio.displayName}`} />}
              <div className="portfolio-cover-content">
                <p className="lab-kicker" style={{ color: accent }}>PORTFÓLIO • DESIGN • PROCESSO</p>
                <h1>{portfolio.displayName}</h1>
                <p>{portfolio.headline}</p>
                <div className="lab-accent-line" style={{ background: accent }} />
              </div>
            </div>
          </div>
        </section>

        <section className="lab-section lab-divider">
          <div className="lab-container">
            <div className="section-head">
              <div><p className="lab-label" style={{ color: accent }}>PROJETOS SELECIONADOS</p><h2>Projetos</h2></div>
              <p>{portfolio.bio}</p>
            </div>

            {publishedProjects.length ? (
              <div className="project-grid">
                {publishedProjects.map(project => (
                  <article className="project-card" key={project.id}>
                    <div className="project-media">
                      {project.coverUrl
                        ? <img src={project.coverUrl} alt={`Capa do projeto ${project.title}`} />
                        : <div className="project-placeholder" aria-hidden="true" />}
                    </div>
                    <div className="project-copy">
                      <div className="project-meta"><span>{project.category || 'Projeto'}</span><span>{project.year}</span></div>
                      <h3>{project.title}</h3>
                      {project.subtitle && <p className="project-subtitle">{project.subtitle}</p>}
                      <p>{project.summary}</p>
                      {project.tags?.length > 0 && <div className="project-tags">{project.tags.map(tag => <span className="project-tag" key={tag}>{tag}</span>)}</div>}
                      {project.body && <div className="project-body">{project.body}</div>}
                      {project.gallery?.length > 0 && (
                        <div className="public-gallery" aria-label={`Galeria do projeto ${project.title}`}>
                          {project.gallery.map((url, index) => <img key={`${url}-${index}`} src={url} alt={`Imagem ${index + 1} do projeto ${project.title}`} loading="lazy" />)}
                        </div>
                      )}
                      {project.externalUrl && <a className="lab-secondary" style={{ marginTop: 18 }} href={project.externalUrl} target="_blank" rel="noreferrer"><ExternalLink size={16} /> Ver projeto</a>}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="lab-empty">Os projetos deste portfólio serão publicados aqui.</div>
            )}
          </div>
        </section>

        <section className="lab-section lab-divider">
          <div className="lab-container">
            <div className="section-head"><div><p className="lab-label" style={{ color: secondary }}>SOBRE</p><h2>Perfil</h2></div></div>
            <div className="portfolio-grid profile-grid">
              <article className="portfolio-card" style={{ ['--student-accent' as string]: accent }}>
                <div>
                  {portfolio.avatarUrl
                    ? <img className="portfolio-avatar" src={portfolio.avatarUrl} alt={`Retrato de ${portfolio.displayName}`} />
                    : <div className="portfolio-avatar">{portfolio.displayName.slice(0, 2).toUpperCase()}</div>}
                  <h3>{portfolio.displayName}</h3>
                  <p>{portfolio.about || portfolio.bio}</p>
                </div>
              </article>
              <article className="portfolio-card" style={{ ['--student-accent' as string]: secondary }}>
                <div><Mail size={34} color={secondary} /><h3>Contato</h3><p>Links e canais definidos pelo estudante.</p></div>
                <div className="dashboard-actions">
                  {portfolio.publicEmail && <a className="lab-secondary" href={`mailto:${portfolio.publicEmail}`}>E-mail</a>}
                  {portfolio.instagramUrl && <a className="lab-secondary" href={portfolio.instagramUrl} target="_blank" rel="noreferrer">Instagram</a>}
                  {portfolio.linkedinUrl && <a className="lab-secondary" href={portfolio.linkedinUrl} target="_blank" rel="noreferrer">LinkedIn</a>}
                  {portfolio.websiteUrl && <a className="lab-secondary" href={portfolio.websiteUrl} target="_blank" rel="noreferrer">Site <ArrowUpRight size={15} /></a>}
                </div>
              </article>
            </div>
          </div>
        </section>
      </main>
      <HubFooter />
    </div>
  );
}
