/** Minimal WordPress REST shapes used by this app. */

export interface WpRenderedText {
  rendered?: string;
}

export interface WpRenderedContent {
  rendered?: string;
}

export interface WpFeaturedMediaLink {
  href?: string;
}

export interface WpPostLinks {
  'wp:featuredmedia'?: WpFeaturedMediaLink[];
}

export interface WpCategory {
  id: number;
  name: string;
  slug?: string;
  count?: number;
}

export interface WpPost {
  id: number;
  date?: string;
  categories?: number[];
  featured_media?: number;
  title?: WpRenderedText;
  excerpt?: WpRenderedContent;
  content?: WpRenderedContent;
  link?: string;
  imageUrl?: string;
  _links?: WpPostLinks;
}

export interface StoryPage {
  id: number;
  title: string;
  excerpt: string;
  contentHtml: string;
  date?: string;
  categoryNames: string[];
  imageUrl?: string;
  sourceUrl?: string;
}
