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

export type PortfolioProjectLayout = 'grid' | 'editorial' | 'stack';
export type PortfolioNavStyle = 'minimal' | 'floating' | 'bar';
export type PortfolioHeroStyle = 'split' | 'full' | 'text';
export type PortfolioCardStyle = 'surface' | 'outline' | 'minimal';
export type PortfolioShadow = 'none' | 'soft' | 'hard';
export type PortfolioGraphicStyle = 'none' | 'gradient' | 'grid' | 'dots' | 'geometric';
export type PortfolioProjectInfo = 'below' | 'overlay' | 'split';
export type PortfolioAnimation = 'none' | 'subtle' | 'dynamic';
export type PortfolioButtonStyle = 'solid' | 'outline' | 'text';
export type PortfolioTextAlign = 'left' | 'center';
export type PortfolioHeadingCase = 'none' | 'uppercase' | 'lowercase';
export type PortfolioHeadingStyle = 'normal' | 'italic';
export type PortfolioImageAspect = 'landscape' | 'square' | 'portrait' | 'wide' | 'auto';
export type PortfolioImageFit = 'cover' | 'contain';
export type PortfolioIconStyle = 'outline' | 'bold' | 'boxed' | 'none';
export type PortfolioSectionKey = 'projects' | 'about' | 'contact';

export interface PortfolioTheme {
  version: 2;
  background: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  muted: string;
  accent: string;
  secondary: string;
  border: string;
  headingFont: string;
  bodyFont: string;
  monoFont: string;
  headingWeight: number;
  bodyWeight: number;
  headingCase: PortfolioHeadingCase;
  headingStyle: PortfolioHeadingStyle;
  headingTracking: number;
  bodySize: number;
  bodyLeading: number;
  headingScale: 'compact' | 'balanced' | 'oversized';
  contentWidth: 900 | 1100 | 1280 | 1440;
  gridColumns: 1 | 2 | 3 | 4;
  gridGap: number;
  sectionGap: number;
  sidePadding: number;
  projectLayout: PortfolioProjectLayout;
  projectInfo: PortfolioProjectInfo;
  textAlign: PortfolioTextAlign;
  cardRadius: number;
  buttonRadius: number;
  borderWidth: number;
  cardStyle: PortfolioCardStyle;
  shadow: PortfolioShadow;
  buttonStyle: PortfolioButtonStyle;
  projectAspect: PortfolioImageAspect;
  imageFit: PortfolioImageFit;
  heroStyle: PortfolioHeroStyle;
  heroHeight: 'compact' | 'medium' | 'tall';
  navStyle: PortfolioNavStyle;
  graphicStyle: PortfolioGraphicStyle;
  animation: PortfolioAnimation;
  iconStyle: PortfolioIconStyle;
  iconStroke: number;
  showYear: boolean;
  showCategory: boolean;
  showTags: boolean;
  showBioInHero: boolean;
  showAvatar: boolean;
  showProjectSummary: boolean;
  sectionOrder: PortfolioSectionKey[];
  projectsLabel: string;
  aboutLabel: string;
  contactLabel: string;
  heroEyebrow: string;
  footerText: string;
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

export interface StudentInvite {
  id: string;
  email: string;
  suggestedName?: string;
  expiresAt: string;
  createdAt: string;
}
