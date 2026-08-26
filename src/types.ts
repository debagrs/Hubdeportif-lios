export type UserRole = 'admin' | 'student';

export interface SessionUser {
  id: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
  portfolioId?: string | null;
  portfolioSlug?: string | null;
  displayName?: string | null;
}

export interface PortfolioTheme {
  accent: string;
  secondary: string;
  cardRadius: 'soft' | 'round' | 'square';
  projectLayout: 'grid' | 'editorial';
}

export interface PortfolioSummary {
  id: string;
  slug: string;
  displayName: string;
  headline: string;
  bio: string;
  avatarUrl?: string;
  heroImageUrl?: string;
  theme: PortfolioTheme;
  published: boolean;
  projectCount: number;
}

export interface PortfolioDetail extends PortfolioSummary {
  about: string;
  publicEmail?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  projects: Project[];
}

export interface Project {
  id: string;
  portfolioId: string;
  slug: string;
  title: string;
  subtitle?: string;
  category: string;
  year: string;
  summary: string;
  body?: string;
  coverUrl?: string;
  gallery: string[];
  externalUrl?: string;
  tags: string[];
  featured: boolean;
  published: boolean;
  sortOrder: number;
}

export interface StudentAccount {
  id: string;
  email: string;
  displayName: string;
  slug: string;
  emailVerified: boolean;
  published: boolean;
  projectCount: number;
}
