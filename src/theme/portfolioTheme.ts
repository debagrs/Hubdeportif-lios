import type { IconRole, PortfolioTheme } from '../types';

export const FALLBACK_FONT_OPTIONS = [
  'Lexend','Space Grotesk','DM Sans','Manrope','Archivo','IBM Plex Sans','Syne','Bricolage Grotesque',
  'Playfair Display','Cormorant Garamond','Lora','Bebas Neue','JetBrains Mono','IBM Plex Mono','Roboto','Open Sans','Montserrat','Poppins','Inter','Oswald','Raleway','Merriweather','Nunito','Ubuntu'
] as const;

export const ICON_ROLES: { key: IconRole; label: string; description: string }[] = [
  { key:'menu', label:'Menu', description:'Ícone do menu em telas pequenas.' },
  { key:'projects', label:'Projetos', description:'Ícone associado à seção de projetos.' },
  { key:'about', label:'Sobre', description:'Ícone da seção sobre.' },
  { key:'contact', label:'Contato', description:'Ícone da seção contato.' },
  { key:'external', label:'Link externo', description:'Abrir projeto ou arquivo em outra página.' },
  { key:'down', label:'Descer', description:'Ação do hero para ir aos projetos.' },
  { key:'mail', label:'E-mail', description:'Contato por e-mail.' },
  { key:'instagram', label:'Instagram', description:'Contato Instagram.' },
  { key:'linkedin', label:'LinkedIn', description:'Contato LinkedIn.' },
  { key:'website', label:'Site', description:'Contato/site externo.' },
];

export const DEFAULT_ICON_ASSIGNMENTS: Record<IconRole,string> = {
  menu:'lucide:menu', projects:'lucide:layout-grid', about:'lucide:user-round', contact:'lucide:send', external:'lucide:external-link', down:'lucide:arrow-down', mail:'lucide:mail', instagram:'lucide:instagram', linkedin:'lucide:linkedin', website:'lucide:globe-2',
};

export const DEFAULT_PORTFOLIO_THEME: PortfolioTheme = {
  version: 3,
  background: '#F4F1EA', surface: '#FFFFFF', surfaceAlt: '#EAE5DB', text: '#161616', muted: '#69665F', accent: '#2C4BFF', secondary: '#FF6B4A', border: '#D8D2C7',
  headingFont: 'Space Grotesk', bodyFont: 'Lexend', monoFont: 'JetBrains Mono', headingWeight: 700, bodyWeight: 400, headingCase: 'none', headingStyle: 'normal', headingTracking: -2, bodySize: 16, bodyLeading: 1.65, headingScale: 'balanced',
  contentWidth: 1280, gridColumns: 2, gridColumnsTablet: 2, gridColumnsMobile: 1, gridGap: 24, galleryColumns: 3, sectionGap: 110, sidePadding: 28,
  projectLayout: 'grid', projectInfo: 'below', featuredSpan: false, textAlign: 'left',
  cardRadius: 28, buttonRadius: 999, borderWidth: 1, cardStyle: 'surface', shadow: 'none', buttonStyle: 'outline',
  projectAspect: 'landscape', imageFit: 'cover', heroStyle: 'split', heroHeight: 'medium', navStyle: 'minimal', graphicStyle: 'none', animation: 'subtle', iconStyle: 'outline', iconStroke: 1.8,
  iconAssignments: { ...DEFAULT_ICON_ASSIGNMENTS }, customIconUrls: {},
  showYear: true, showCategory: true, showTags: true, showBioInHero: false, showAvatar: true, showProjectSummary: true,
  sectionOrder: ['projects', 'about', 'contact'], projectsLabel: 'Projetos', aboutLabel: 'Sobre', contactLabel: 'Contato', heroEyebrow: 'PORTFÓLIO', footerText: '',
};

export const THEME_PRESETS: { name: string; description: string; patch: Partial<PortfolioTheme> }[] = [
  { name: 'Editorial claro', description: 'Tipografia ampla, fundo quente e projetos em grade.', patch: { background:'#F4F1EA',surface:'#FFFFFF',surfaceAlt:'#EAE5DB',text:'#161616',muted:'#69665F',accent:'#2C4BFF',secondary:'#FF6B4A',border:'#D8D2C7',headingFont:'Space Grotesk',bodyFont:'Lexend',headingWeight:700,headingCase:'none',headingStyle:'normal',projectLayout:'grid',projectInfo:'below',graphicStyle:'none',cardRadius:28,shadow:'none',gridColumns:2,gridColumnsTablet:2,gridColumnsMobile:1 } },
  { name: 'Brutalista', description: 'Contraste forte, bordas retas e hierarquia compacta.', patch: { background:'#F6F3EA',surface:'#F6F3EA',surfaceAlt:'#E5FF00',text:'#0A0A0A',muted:'#383838',accent:'#0A0A0A',secondary:'#E5FF00',border:'#0A0A0A',headingFont:'Archivo',bodyFont:'IBM Plex Sans',headingWeight:900,headingCase:'uppercase',headingStyle:'normal',projectLayout:'grid',projectInfo:'below',graphicStyle:'grid',cardRadius:0,buttonRadius:0,borderWidth:2,shadow:'hard',cardStyle:'outline',gridColumns:3,gridColumnsTablet:2,gridColumnsMobile:1 } },
  { name: 'Dark tech', description: 'Fundo escuro, acento luminoso e composição digital.', patch: { background:'#090A10',surface:'#11131E',surfaceAlt:'#181B28',text:'#F4F6FF',muted:'#9BA3B5',accent:'#00E5FF',secondary:'#BEFF5C',border:'#2A3042',headingFont:'Syne',bodyFont:'DM Sans',headingWeight:800,headingCase:'uppercase',headingStyle:'normal',projectLayout:'editorial',projectInfo:'split',graphicStyle:'grid',cardRadius:20,shadow:'soft',cardStyle:'surface' } },
  { name: 'Poético', description: 'Serifa, respiro e imagens protagonistas.', patch: { background:'#FBF7F1',surface:'#FFFDFC',surfaceAlt:'#EFE8DE',text:'#2B2521',muted:'#766D66',accent:'#8B3E53',secondary:'#759A7D',border:'#DDD2C7',headingFont:'Cormorant Garamond',bodyFont:'Lora',headingWeight:600,headingCase:'none',headingStyle:'italic',projectLayout:'stack',projectInfo:'below',graphicStyle:'gradient',cardRadius:12,shadow:'none',contentWidth:1100,gridColumns:1,gridColumnsTablet:1,gridColumnsMobile:1 } },
  { name: 'Pop gráfico', description: 'Cores fortes, formas arredondadas e presença visual.', patch: { background:'#FFF4F8',surface:'#FFFFFF',surfaceAlt:'#FFE2ED',text:'#22121B',muted:'#6F5260',accent:'#FF2A7F',secondary:'#7C4DFF',border:'#FFB6D2',headingFont:'Bricolage Grotesque',bodyFont:'Manrope',headingWeight:800,headingCase:'none',headingStyle:'normal',projectLayout:'grid',projectInfo:'overlay',graphicStyle:'geometric',cardRadius:36,buttonRadius:18,shadow:'soft',cardStyle:'surface',gridColumns:3,gridColumnsTablet:2,gridColumnsMobile:1 } },
  { name: 'Masonry visual', description: 'Mosaico vertical para portfólios muito imagéticos.', patch: { projectLayout:'masonry',projectInfo:'below',gridColumns:3,gridColumnsTablet:2,gridColumnsMobile:1,gridGap:18,projectAspect:'auto',cardStyle:'minimal',graphicStyle:'none' } },
];

export function mergeTheme(theme?: Partial<PortfolioTheme> | null): PortfolioTheme {
  const raw = theme || {};
  const order = Array.isArray(raw.sectionOrder) ? raw.sectionOrder.filter((item): item is PortfolioTheme['sectionOrder'][number] => ['projects','about','contact'].includes(String(item))) : [];
  return {
    ...DEFAULT_PORTFOLIO_THEME,
    ...raw,
    version: 3,
    gridColumns: Number(raw.gridColumns || DEFAULT_PORTFOLIO_THEME.gridColumns),
    gridColumnsTablet: Number(raw.gridColumnsTablet || Math.min(Number(raw.gridColumns || 2),2)),
    gridColumnsMobile: Number(raw.gridColumnsMobile || 1),
    galleryColumns: Number(raw.galleryColumns || 3),
    iconAssignments: { ...DEFAULT_ICON_ASSIGNMENTS, ...(raw.iconAssignments || {}) },
    customIconUrls: { ...(raw.customIconUrls || {}) },
    sectionOrder: order.length === 3 ? order : DEFAULT_PORTFOLIO_THEME.sectionOrder,
  };
}

export const fontStack = (name: string) => `"${name}", ui-sans-serif, system-ui, sans-serif`;

export function googleFontsCssUrl(fonts: string[]) {
  const unique = [...new Set(fonts.map(v=>String(v||'').trim()).filter(Boolean))];
  const query = unique.map(name => `family=${encodeURIComponent(name).replace(/%20/g,'+')}`).join('&');
  return query ? `https://fonts.googleapis.com/css2?${query}&display=swap` : '';
}
