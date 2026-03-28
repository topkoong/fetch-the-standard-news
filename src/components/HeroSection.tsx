import {
  HERO_BACKGROUND_IMAGE_CLASS,
  HERO_BADGE_CLASS,
  HERO_CONTENT_WRAPPER_CLASS,
  HERO_CTA_ROW_CLASS,
  HERO_GRADIENT_OVERLAY_CLASS,
  HERO_HEADLINE_ACCENT_CLASS,
  HERO_HEADLINE_CLASS,
  HERO_PRIMARY_CTA_CLASS,
  HERO_PRIMARY_CTA_EXTERNAL_REL,
  HERO_PRIMARY_CTA_LABEL,
  HERO_SECONDARY_CTA_CLASS,
  HERO_SECONDARY_CTA_LABEL,
  HERO_SECTION_ROOT_CLASS,
  HERO_SUBHEADLINE_CLASS,
  HERO_VALUE_HEADLINE_ACCENT,
  HERO_VALUE_HEADLINE_LINE_1,
  HERO_VALUE_SUBHEADLINE,
  THE_STANDARD_HOSTNAME,
} from '@constants/index';
import { handleNewsImageLoadError, resolveImageUrl } from '@utils/formatters';
import { Link } from 'react-router-dom';
import type { HeroSectionProps } from 'types/hero.types';

export function HeroSection({ featuredArticle }: HeroSectionProps) {
  return (
    <section className={HERO_SECTION_ROOT_CLASS} aria-label='Featured coverage'>
      <img
        src={resolveImageUrl(featuredArticle.image)}
        alt={featuredArticle.title}
        className={HERO_BACKGROUND_IMAGE_CLASS}
        onError={handleNewsImageLoadError}
      />
      <div className={HERO_GRADIENT_OVERLAY_CLASS} aria-hidden='true' />
      <div className={HERO_CONTENT_WRAPPER_CLASS}>
        <span className={HERO_BADGE_CLASS}>{featuredArticle.category}</span>
        <h1 className={HERO_HEADLINE_CLASS}>
          {HERO_VALUE_HEADLINE_LINE_1}
          <br />
          <span className={HERO_HEADLINE_ACCENT_CLASS}>{HERO_VALUE_HEADLINE_ACCENT}</span>
        </h1>
        <p className={HERO_SUBHEADLINE_CLASS}>{HERO_VALUE_SUBHEADLINE}</p>
        <div className={HERO_CTA_ROW_CLASS}>
          <Link
            to={`/read/${featuredArticle.id}`}
            className={`${HERO_PRIMARY_CTA_CLASS} no-underline`}
          >
            {HERO_PRIMARY_CTA_LABEL}
          </Link>
          <a
            href={THE_STANDARD_HOSTNAME}
            target='_blank'
            rel={HERO_PRIMARY_CTA_EXTERNAL_REL}
            className={HERO_SECONDARY_CTA_CLASS}
          >
            {HERO_SECONDARY_CTA_LABEL}
          </a>
        </div>
      </div>
    </section>
  );
}
