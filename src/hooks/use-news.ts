export interface Article {
  id: string | number;
  title: string;
  link: string;
  image: string;
  excerpt: string;
  category: string | string[];
  date: string;
}

export async function loadArticles(): Promise<Article[]> {
  try {
    const res = await fetch('/data/articles.json');
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.articles) && json.articles.length > 0) {
        return json.articles as Article[];
      }
    }
  } catch {
    /* fall through */
  }

  const res = await fetch('https://thestandard.co/homepage/');
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
