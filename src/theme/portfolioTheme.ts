import type { PortfolioTheme } from '../types';

export const FONT_OPTIONS = [
  'Lexend',
  'Space Grotesk',
  'DM Sans',
  'Manrope',
  'Archivo',
  'IBM Plex Sans',
  'Syne',
  'Bricolage Grotesque',
  'Playfair Display',
  'Cormorant Garamond',
  'Lora',
  'Bebas Neue',
  'JetBrains Mono',
  'IBM Plex Mono',
] as const;

export const DEFAULT_PORTFOLIO_THEME: PortfolioTheme = {
  version: 2,
  background: '#F4F1EA',
  surface: '#FFFFFF',
  surfaceAlt: '#EAE5DB',
  text: '#161616',
  muted: '#69665F',
  accent: '#2C4BFF',
  secondary: '#FF6B4A',
  border: '#D8D2C7',
  headingFont: 'Space Grotesk',
  bodyFont: 'Lexend',
  monoFont: 'JetBrains Mono',
  headingWeight: 700,
  bodyWeight: 400,
  headingCase: 'none',
  headingStyle: 'normal',
  headingTracking: -2,
  bodySize: 16,
  bodyLeading: 1.65,
  headingScale: 'balanced',
  contentWidth: 1280,
  gridColumns: 2,
  gridGap: 24,
  sectionGap: 110,
  sidePadding: 28,
  projectLayout: 'grid',
  projectInfo: 'below',
  textAlign: 'left',
  cardRadius: 28,
  buttonRadius: 999,
  borderWidth: 1,
  cardStyle: 'surface',
  shadow: 'none',
  buttonStyle: 'outline',
  projectAspect: 'landscape',
  imageFit: 'cover',
  heroStyle: 'split',
  heroHeight: 'medium',
  navStyle: 'minimal',
  graphicStyle: 'none',
  animation: 'subtle',
  iconStyle: 'outline',
  iconStroke: 1.8,
  showYear: true,
  showCategory: true,
  showTags: true,
  showBioInHero: false,
  showAvatar: true,
  showProjectSummary: true,
  sectionOrder: ['projects', 'about', 'contact'],
  projectsLabel: 'Projetos',
  aboutLabel: 'Sobre',
  contactLabel: 'Contato',
  heroEyebrow: 'PORTFÓLIO',
  footerText: '',
};

export const THEME_PRESETS: { name: string; description: string; patch: Partial<PortfolioTheme> }[] = [
  { name: 'Editorial claro', description: 'Tipografia ampla, fundo quente e projetos em grade.', patch: { background:'#F4F1EA',surface:'#FFFFFF',surfaceAlt:'#EAE5DB',text:'#161616',muted:'#69665F',accent:'#2C4BFF',secondary:'#FF6B4A',border:'#D8D2C7',headingFont:'Space Grotesk',bodyFont:'Lexend',headingWeight:700,headingCase:'none',headingStyle:'normal',projectLayout:'grid',projectInfo:'below',graphicStyle:'none',cardRadius:28,shadow:'none' } },
  { name: 'Brutalista', description: 'Contraste forte, bordas retas e hierarquia compacta.', patch: { background:'#F6F3EA',surface:'#F6F3EA',surfaceAlt:'#E5FF00',text:'#0A0A0A',muted:'#383838',accent:'#0A0A0A',secondary:'#E5FF00',border:'#0A0A0A',headingFont:'Archivo',bodyFont:'IBM Plex Sans',headingWeight:900,headingCase:'uppercase',headingStyle:'normal',projectLayout:'grid',projectInfo:'below',graphicStyle:'grid',cardRadius:0,buttonRadius:0,borderWidth:2,shadow:'hard',cardStyle:'outline' } },
  { name: 'Dark tech', description: 'Fundo escuro, acento luminoso e composição digital.', patch: { background:'#090A10',surface:'#11131E',surfaceAlt:'#181B28',text:'#F4F6FF',muted:'#9BA3B5',accent:'#00E5FF',secondary:'#BEFF5C',border:'#2A3042',headingFont:'Syne',bodyFont:'DM Sans',headingWeight:800,headingCase:'uppercase',headingStyle:'normal',projectLayout:'editorial',projectInfo:'split',graphicStyle:'grid',cardRadius:20,shadow:'soft',cardStyle:'surface' } },
  { name: 'Poético', description: 'Serifa, respiro e imagens protagonistas.', patch: { background:'#FBF7F1',surface:'#FFFDFC',surfaceAlt:'#EFE8DE',text:'#2B2521',muted:'#766D66',accent:'#8B3E53',secondary:'#759A7D',border:'#DDD2C7',headingFont:'Cormorant Garamond',bodyFont:'Lora',headingWeight:600,headingCase:'none',headingStyle:'italic',projectLayout:'stack',projectInfo:'below',graphicStyle:'gradient',cardRadius:12,shadow:'none',contentWidth:1100,gridColumns:1 } },
  { name: 'Pop gráfico', description: 'Cores fortes, formas arredondadas e presença visual.', patch: { background:'#FFF4F8',surface:'#FFFFFF',surfaceAlt:'#FFE2ED',text:'#22121B',muted:'#6F5260',accent:'#FF2A7F',secondary:'#7C4DFF',border:'#FFB6D2',headingFont:'Bricolage Grotesque',bodyFont:'Manrope',headingWeight:800,headingCase:'none',headingStyle:'normal',projectLayout:'grid',projectInfo:'overlay',graphicStyle:'geometric',cardRadius:36,buttonRadius:18,shadow:'soft',cardStyle:'surface' } },
];

export function mergeTheme(theme?: Partial<PortfolioTheme> | null): PortfolioTheme {
  const raw = theme || {};
  const order = Array.isArray(raw.sectionOrder) ? raw.sectionOrder.filter((item): item is PortfolioTheme['sectionOrder'][number] => ['projects','about','contact'].includes(String(item))) : [];
  return {
    ...DEFAULT_PORTFOLIO_THEME,
    ...raw,
    version: 2,
    sectionOrder: order.length === 3 ? order : DEFAULT_PORTFOLIO_THEME.sectionOrder,
  };
}

export const fontStack = (name: string) => {
  const serif = ['Playfair Display','Cormorant Garamond','Lora'].includes(name);
  const mono = ['JetBrains Mono','IBM Plex Mono'].includes(name);
  return `"${name}", ${mono ? 'ui-monospace, SFMono-Regular, Menlo, monospace' : serif ? 'Georgia, serif' : 'ui-sans-serif, system-ui, sans-serif'}`;
};
