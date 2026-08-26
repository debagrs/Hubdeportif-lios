import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PortfolioRenderer from '../components/PortfolioRenderer';
import { getDemoPortfolio } from '../data/demo';
import { hubApi } from '../lib/api';
import type { PortfolioDetail } from '../types';

export default function PortfolioPage({ embedded = false }: { embedded?: boolean }) {
  const { slug = '' } = useParams();
  const [portfolio, setPortfolio] = useState<PortfolioDetail | null>(getDemoPortfolio(slug));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    hubApi.getPublicPortfolio(slug)
      .then(result => setPortfolio(result.portfolio || getDemoPortfolio(slug)))
      .catch(() => setPortfolio(getDemoPortfolio(slug)))
      .finally(() => setLoading(false));
  }, [slug]);

  if (!portfolio && !loading) return <div className="portfolio-not-found"><h1>Portfólio não encontrado</h1><Link to="/">Voltar ao Hub</Link></div>;
  if (!portfolio) return <div className="portfolio-not-found">Carregando…</div>;
  return <PortfolioRenderer portfolio={portfolio} embedded={embedded}/>;
}
