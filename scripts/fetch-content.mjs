// scripts/fetch-content.mjs
// Runs before `vite build`. Fetches articles from thestandard.co and writes
// them to public/data/articles.json so the app can load them without a
// runtime API call.

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '..', 'public', 'data');
const OUTPUT_FILE = join(OUTPUT_DIR, 'articles.json');
const SOURCE_URL = 'https://thestandard.co/homepage/';

async function main() {
  console.log('[fetch-content] Fetching from', SOURCE_URL);

  const res = await fetch(SOURCE_URL, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'fetch-the-standard-news/build-script',
    },
  });

  if (!res.ok) {
    throw new Error(`[fetch-content] HTTP ${res.status} — ${res.statusText}`);
  }

  let data;
  const text = await res.text();
  try {
    data = JSON.parse(text);
  } catch {
    console.warn('[fetch-content] Response is not JSON — storing raw fallback');
    data = { raw: text, fetchedAt: new Date().toISOString() };
  }

  mkdirSync(OUTPUT_DIR, { recursive: true });

  // Normalise: handle { posts:[...] }, { articles:[...] }, { data:[...] }, or bare array
  const articles = Array.isArray(data)
    ? data
    : data.posts ?? data.articles ?? data.data ?? [];

  const output = {
    fetchedAt: new Date().toISOString(),
    source: SOURCE_URL,
    count: articles.length,
    articles,
  };

  writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`[fetch-content] Wrote ${articles.length} articles → ${OUTPUT_FILE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
