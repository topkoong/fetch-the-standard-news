/**
 * Payload for the homepage hero (first post in the feed + resolved image/category).
 */
export interface HeroFeaturedArticle {
  readonly title: string;
  readonly link: string;
  readonly image: string;
  readonly category: string;
}

export interface HeroSectionProps {
  readonly featuredArticle: HeroFeaturedArticle;
}
