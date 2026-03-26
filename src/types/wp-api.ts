/** Minimal WordPress REST shapes used by this app. */

export interface WpRenderedText {
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
}

export interface WpPost {
  id: number;
  date?: string;
  categories?: number[];
  featured_media?: number;
  title?: WpRenderedText;
  link?: string;
  imageUrl?: string;
  _links?: WpPostLinks;
}
