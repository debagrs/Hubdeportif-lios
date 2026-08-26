import type { PortfolioDetail, PortfolioSummary } from '../types';
import { DEFAULT_PORTFOLIO_THEME, THEME_PRESETS } from '../theme/portfolioTheme';

const themes = THEME_PRESETS.slice(0,5).map(item => ({ ...DEFAULT_PORTFOLIO_THEME, ...item.patch, version:3 as const }));

export const demoPortfolios: PortfolioSummary[] = Array.from({ length: 5 }, (_, index) => ({
  id: `demo-${index + 1}`,
  slug: `portfolio-${String(index + 1).padStart(2, '0')}`,
  displayName: `Portfólio ${String(index + 1).padStart(2, '0')}`,
  headline: 'Espaço autoral de projetos em Design',
  bio: 'Cada portfólio pode ter um design system independente, definido pelo próprio estudante.',
  theme: themes[index] || DEFAULT_PORTFOLIO_THEME,
  published: true,
  projectCount: 0,
}));

export const getDemoPortfolio = (slug: string): PortfolioDetail | null => {
  const base = demoPortfolios.find(item => item.slug === slug);
  if (!base) return null;
  return { ...base, about: 'Área reservada para apresentação, trajetória, interesses e abordagem projetual do estudante.', projects: [] };
};
