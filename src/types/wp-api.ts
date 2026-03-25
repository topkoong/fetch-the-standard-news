/** Minimal WordPress REST shapes used by this app. */

export interface WpCategory {
  id: number;
  name: string;
  slug?: string;
}

export interface WpPost {
  id: number;
  date?: string;
  categories?: number[];
  featured_media?: number;
  title?: { rendered?: string };
  link?: string;
}
