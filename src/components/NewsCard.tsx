import {
  NEWS_CARD_ARTICLE_CLASS,
  NEWS_CARD_BODY_PADDING_FEATURE_CLASS,
  NEWS_CARD_BODY_PADDING_STANDARD_CLASS,
  NEWS_CARD_CATEGORY_CLASS,
  NEWS_CARD_DISCOVER_LINK_LABEL,
  NEWS_CARD_EXCERPT_CLASS,
  NEWS_CARD_EXTERNAL_REL,
  NEWS_CARD_FEATURE_LI_CLASS,
  NEWS_CARD_FOOTER_CLASS,
  NEWS_CARD_IMAGE_CLASS,
  NEWS_CARD_IMAGE_WRAPPER_FEATURE_CLASS,
  NEWS_CARD_IMAGE_WRAPPER_STANDARD_CLASS,
  NEWS_CARD_PUBLISHER_LINK_LABEL,
  NEWS_CARD_READ_NOW_BUTTON_CLASS,
  NEWS_CARD_READ_NOW_LABEL,
  NEWS_CARD_SECONDARY_FOOTER_LINK_CLASS,
  NEWS_CARD_TITLE_FEATURE_CLASS,
  NEWS_CARD_TITLE_STANDARD_CLASS,
  ROUTE_PATH_NEWS_DESK_FALLBACK,
  ROUTE_PATH_READ_PREFIX,
  ROUTE_STATE_NEWS_DESK_CATEGORY,
} from '@constants/index';
import {
  handleNewsImageLoadError,
  isStandardPublisherImageUrl,
  placeholderNewsPublicPath,
  publisherImageReferrerProps,
} from '@utils/formatters';
import { useEffect, useMemo, useState } from 'preact/hooks';
import { Link } from 'react-router-dom';

export interface NewsCardProps {
  readonly title: string;
  readonly imageUrl: string;
  readonly categoryLabel: string;
  readonly postId: number;
  readonly excerpt?: string;
  readonly externalUrl?: string;
  readonly featuredMediaId?: number;
  readonly isFeature: boolean;
}

export function NewsCard({
  title,
  imageUrl,
  categoryLabel,
  postId,
  excerpt,
  externalUrl,
  featuredMediaId,
  isFeature,
}: NewsCardProps) {
  const [imageSrc, setImageSrc] = useState(imageUrl);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const baseUrl = import.meta.env.BASE_URL ?? '/';

  const localCandidates = useMemo(() => {
    if (!featuredMediaId) return [];
    /* With LOCALIZE_IMAGE_ASSETS=0, desks only use CDN URLs — skip missing public/cached-media/* retries. */
    if (isStandardPublisherImageUrl(imageUrl)) return [];
    const prefix = `${baseUrl}cached-media/${featuredMediaId}`;
    return [
      `${prefix}.jpg`,
      `${prefix}.jpeg`,
      `${prefix}.png`,
      `${prefix}.webp`,
      `${prefix}.avif`,
    ];
  }, [baseUrl, featuredMediaId, imageUrl]);

  useEffect(() => {
    setImageSrc(imageUrl);
    setCandidateIndex(0);
  }, [imageUrl, postId]);

  const readPath = `${ROUTE_PATH_READ_PREFIX}${postId}`;

  const imageWrapperClass = isFeature
    ? NEWS_CARD_IMAGE_WRAPPER_FEATURE_CLASS
    : NEWS_CARD_IMAGE_WRAPPER_STANDARD_CLASS;

  const bodyPaddingClass = isFeature
    ? NEWS_CARD_BODY_PADDING_FEATURE_CLASS
    : NEWS_CARD_BODY_PADDING_STANDARD_CLASS;

  const titleClass = isFeature
    ? NEWS_CARD_TITLE_FEATURE_CLASS
    : NEWS_CARD_TITLE_STANDARD_CLASS;

  const handleImageError = (event: { currentTarget: HTMLImageElement }): void => {
    if (candidateIndex < localCandidates.length) {
      const nextSrc = localCandidates[candidateIndex];
      setCandidateIndex((idx) => idx + 1);
      setImageSrc(nextSrc);
      return;
    }
    handleNewsImageLoadError(event);
    setImageSrc(placeholderNewsPublicPath());
  };

  return (
    <li className={isFeature ? NEWS_CARD_FEATURE_LI_CLASS : ''}>
      <article className={NEWS_CARD_ARTICLE_CLASS}>
        <Link
          to={readPath}
          className='block min-h-0 flex-1 text-inherit no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2'
          aria-label={`Read now: ${title}`}
        >
          <div className={imageWrapperClass}>
            <img
              src={imageSrc || placeholderNewsPublicPath()}
              alt={title}
              loading='lazy'
              decoding='async'
              className={NEWS_CARD_IMAGE_CLASS}
              onError={handleImageError}
              {...publisherImageReferrerProps}
            />
          </div>
          <div className={bodyPaddingClass}>
            <span className={NEWS_CARD_CATEGORY_CLASS}>{categoryLabel}</span>
            <h2 className={titleClass}>{title}</h2>
            <span className={`mt-3 ${NEWS_CARD_READ_NOW_BUTTON_CLASS}`}>
              {NEWS_CARD_READ_NOW_LABEL}
            </span>
          </div>
        </Link>
        {excerpt ? <p className={NEWS_CARD_EXCERPT_CLASS}>{excerpt}</p> : null}
        <div className={NEWS_CARD_FOOTER_CLASS}>
          {externalUrl ? (
            <a
              href={externalUrl}
              target='_blank'
              rel={NEWS_CARD_EXTERNAL_REL}
              className={NEWS_CARD_SECONDARY_FOOTER_LINK_CLASS}
              aria-label={`${NEWS_CARD_PUBLISHER_LINK_LABEL}: ${title}`}
            >
              {NEWS_CARD_PUBLISHER_LINK_LABEL}
            </a>
          ) : (
            <Link
              to={ROUTE_PATH_NEWS_DESK_FALLBACK}
              state={{ category: ROUTE_STATE_NEWS_DESK_CATEGORY }}
              className={NEWS_CARD_SECONDARY_FOOTER_LINK_CLASS}
            >
              {NEWS_CARD_DISCOVER_LINK_LABEL}
            </Link>
          )}
        </div>
      </article>
    </li>
  );
}

export default NewsCard;
