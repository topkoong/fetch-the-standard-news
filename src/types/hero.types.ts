/**
 * Payload for the homepage hero (first post in the feed + resolved image/category).
 */
export interface HeroFeaturedArticle {
  readonly id: number;
  readonly title: string;
  /** Canonical URL on The Standard (e.g. secondary actions, metadata). */
  readonly link: string;
  readonly image: string;
  readonly category: string;
}

export interface HeroSectionProps {
  readonly featuredArticle: HeroFeaturedArticle;
}
