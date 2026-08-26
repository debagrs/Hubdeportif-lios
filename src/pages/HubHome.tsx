import React, { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Image, Layers3, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import HubHeader from '../components/HubHeader';
import HubFooter from '../components/HubFooter';
import { demoPortfolios } from '../data/demo';
import { hubApi } from '../lib/api';
import type { PortfolioSummary } from '../types';

export default function HubHome() {
  const [portfolios, setPortfolios] = useState<PortfolioSummary[]>(demoPortfolios);
  const [configured, setConfigured] = useState(false);

  useEffect(() => {
    hubApi.getPublicPortfolios()
      .then(result => {
        setConfigured(result.configured);
        if (result.portfolios.length) setPortfolios(result.portfolios);
      })
      .catch(() => setConfigured(false));
  }, []);

  const totalProjects = useMemo(() => portfolios.reduce((sum, item) => sum + (item.projectCount || 0), 0), [portfolios]);

  return (
    <div className="lab-page">
      <HubHeader />
      <main className="lab-main">
        <section className="lab-hero">
          <div className="lab-container">
            <p className="lab-kicker">DESENHO INDUSTRIAL • INTERFACES • UFSM</p>
            <h1>Portfólios da turma</h1>
            <p className="lab-hero-copy">Um hub único para identidades autorais diferentes. Cada estudante abastece o próprio espaço, publica projetos, imagens e percursos de design sem precisar operar GitHub, Vercel ou banco de dados.</p>
            <div className="lab-accent-line" />
            <div className="hub-stats">
              <div className="hub-stat"><strong>05</strong><span>portfólios independentes</span></div>
              <div className="hub-stat"><strong>{String(totalProjects).padStart(2, '0')}</strong><span>projetos publicados</span></div>
              <div className="hub-stat"><strong>01</strong><span>infraestrutura compartilhada</span></div>
            </div>
          </div>
        </section>

        <section className="lab-section lab-divider">
          <div className="lab-container">
            <div className="section-head">
              <div>
                <p className="lab-label" style={{ color: '#D2A979' }}>PORTFÓLIOS • AUTORIA • PROCESSO</p>
                <h2>Explorar</h2>
              </div>
              <p>O Hub usa o design system do LabInterface somente como moldura institucional. Ao abrir um portfólio, cada estudante assume um site independente, com tipografia, cores, grid, ícones, hierarquia, imagens e linguagem gráfica próprias.</p>
            </div>

            <div className="portfolio-grid">
              {portfolios.slice(0, 5).map((portfolio, index) => (
                <Link
                  key={portfolio.id}
                  to={`/portfolio/${portfolio.slug}`}
                  className="portfolio-card"
                  style={{ ['--student-accent' as string]: portfolio.theme?.accent || '#00FFFF' }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 18 }}>
                      {portfolio.avatarUrl ? (
                        <img className="portfolio-avatar" src={portfolio.avatarUrl} alt={`Retrato de ${portfolio.displayName}`} />
                      ) : (
                        <div className="portfolio-avatar" aria-hidden="true">{portfolio.displayName.slice(0, 2).toUpperCase()}</div>
                      )}
                      <span className="portfolio-index">{String(index + 1).padStart(2, '0')} / 05</span>
                    </div>
                    <h3>{portfolio.displayName}</h3>
                    <p>{portfolio.headline || portfolio.bio}</p>
                  </div>
                  <div className="portfolio-card-foot">
                    <span>{portfolio.projectCount || 0} projeto{portfolio.projectCount === 1 ? '' : 's'}</span>
                    <span className="portfolio-card-arrow"><ArrowUpRight size={20} /></span>
                  </div>
                </Link>
              ))}
            </div>

            {!configured && (
              <div className="lab-message" style={{ marginTop: 24 }}>
                O Hub está exibindo cinco espaços-modelo. Eles serão substituídos pelos portfólios da turma conforme os estudantes forem cadastrados.
              </div>
            )}
          </div>
        </section>

        <section className="lab-section lab-divider">
          <div className="lab-container">
            <div className="section-head">
              <div><p className="lab-label" style={{ color: '#86EFAC' }}>SISTEMA COMPARTILHADO</p><h2>Uma base, cinco autorias</h2></div>
            </div>
            <div className="portfolio-grid">
              <article className="portfolio-card" style={{ ['--student-accent' as string]: '#00FFFF' }}>
                <div><UsersRound size={36} color="#00FFFF" /><h3>Acesso individual</h3><p>Cada estudante entra com e-mail e senha e só edita o próprio portfólio. A administração acompanha todos.</p></div>
                <div className="portfolio-card-foot"><span>5 estudantes + admin</span></div>
              </article>
              <article className="portfolio-card" style={{ ['--student-accent' as string]: '#F48A79' }}>
                <div><Image size={36} color="#F48A79" /><h3>Imagens sem GitHub</h3><p>Capas, imagem inicial e galerias são enviadas diretamente pelo painel para o armazenamento de mídia.</p></div>
                <div className="portfolio-card-foot"><span>upload direto</span></div>
              </article>
              <article className="portfolio-card" style={{ ['--student-accent' as string]: '#86EFAC' }}>
                <div><Layers3 size={36} color="#86EFAC" /><h3>Identidade própria</h3><p>A infraestrutura é comum, mas cada estudante controla um design system completo: paleta, tipografia, hierarquia, grid, cards, imagens, ícones, navegação, movimento e ordem das seções.</p></div>
                <div className="portfolio-card-foot"><span>design system autoral</span></div>
              </article>
            </div>
          </div>
        </section>
      </main>
      <HubFooter />
    </div>
  );
}
