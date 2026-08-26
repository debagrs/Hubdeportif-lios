import type { PortfolioDetail, PortfolioSummary } from '../types';

const themes = [
  { accent: '#00FFFF', secondary: '#D2A979', cardRadius: 'round', projectLayout: 'grid' },
  { accent: '#F48A79', secondary: '#86EFAC', cardRadius: 'soft', projectLayout: 'editorial' },
  { accent: '#86EFAC', secondary: '#00FFFF', cardRadius: 'round', projectLayout: 'grid' },
  { accent: '#D2A979', secondary: '#F48A79', cardRadius: 'soft', projectLayout: 'editorial' },
  { accent: '#B6A7FF', secondary: '#00FFFF', cardRadius: 'square', projectLayout: 'grid' },
] as const;

export const demoPortfolios: PortfolioSummary[] = Array.from({ length: 5 }, (_, index) => ({
  id: `demo-${index + 1}`,
  slug: `portfolio-${String(index + 1).padStart(2, '0')}`,
  displayName: `Portfólio ${String(index + 1).padStart(2, '0')}`,
  headline: 'Espaço autoral de projetos em Design',
  bio: 'Este espaço será abastecido pelo estudante no painel do Hub, com identidade, projetos, imagens e links próprios.',
  theme: themes[index],
  published: true,
  projectCount: 0,
}));

export const getDemoPortfolio = (slug: string): PortfolioDetail | null => {
  const base = demoPortfolios.find(item => item.slug === slug);
  if (!base) return null;
  return {
    ...base,
    about: 'Área reservada para apresentação, trajetória, interesses e abordagem projetual do estudante.',
    projects: [],
  };
};
