import React from 'react';
import { googleFontsCssUrl } from '../theme/portfolioTheme';

export default function GoogleFontLoader({ fonts }: { fonts: string[] }) {
  const href = React.useMemo(() => googleFontsCssUrl(fonts), [fonts.join('|')]);
  React.useEffect(() => {
    if (!href) return;
    const id = `portfolio-google-fonts-${btoa(unescape(encodeURIComponent(href))).replace(/[^a-z0-9]/gi,'').slice(0,24)}`;
    let link = document.getElementById(id) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    }
  }, [href]);
  return null;
}
