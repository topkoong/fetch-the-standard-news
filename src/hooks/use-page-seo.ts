import { useEffect } from 'preact/hooks';

interface PageSeoConfig {
  title: string;
  description: string;
  url?: string;
}

function setMeta(selector: string, attr: 'content', value: string) {
  const el = document.querySelector(selector);
  if (el) el.setAttribute(attr, value);
}

export function usePageSeo({ title, description, url }: PageSeoConfig) {
  useEffect(() => {
    document.title = title;
    setMeta('meta[name="description"]', 'content', description);
    setMeta('meta[property="og:title"]', 'content', title);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[name="twitter:title"]', 'content', title);
    setMeta('meta[name="twitter:description"]', 'content', description);
    if (url) setMeta('meta[property="og:url"]', 'content', url);
  }, [description, title, url]);
}
