import fetchCategories from '@apis/categories';
import fetchPosts from '@apis/posts';
import placeholderImage from '@assets/images/placeholder.png';
import { HeroSection } from '@components/HeroSection';
import HomeSkeleton from '@components/home-skeleton';
import Spinner from '@components/spinner';
import {
  HERO_FALLBACK_ARTICLE_TITLE,
  HERO_FALLBACK_CATEGORY_LABEL,
  NEWS_CARD_FALLBACK_CATEGORY_LABEL,
  REFETCH_INTERVAL,
  THE_STANDARD_HOSTNAME,
} from '@constants/index';
import { TOPIC_DEFINITIONS } from '@constants/topics';
import useBreakpoints from '@hooks/use-breakpoints';
import { useCachedFeedBootstrap } from '@hooks/use-cached-feed-bootstrap';
import { useCategoryData } from '@hooks/use-category-data';
import { usePageSeo } from '@hooks/use-page-seo';
import { lazy } from 'preact/compat';
import { useMemo } from 'preact/hooks';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import type { HeroFeaturedArticle } from 'types/hero.types';
import type { WpPost } from 'types/wp-api';

const PageBreak = lazy(() => import('@components/page-break'));
const PageHeader = lazy(() => import('@components/page-header'));
const NewsCard = lazy(() => import('@components/NewsCard'));
const CategoryHeader = lazy(() => import('@components/category-header'));

interface PostWithCategoryLabels extends Omit<WpPost, 'categories'> {
  categories: string[];
}

interface CategorySection {
  categoryName: string;
  posts: PostWithCategoryLabels[];
}

interface StatCard {
  label: string;
  value: string;
}

function stripRenderedMarkup(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim();
}

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'object' && err !== null && 'message' in err) {
    const m = (err as { message?: unknown }).message;
    return typeof m === 'string' ? m : 'Unknown error';
  }
  return 'Unknown error';
}

function Home() {
  usePageSeo({
    title: 'The Standard Feed | High-signal daily reading dashboard',
    description:
      'High-signal daily reading dashboard with topic desks, internal story pages, and fast category navigation.',
    url: 'https://topkoong.github.io/fetch-the-standard-news',
  });

  const { isXs, isSm, isMd, isLg, isXl } = useBreakpoints();
  const isMobile = isXs || isSm;
  const { cacheReady, imageUrlById } = useCachedFeedBootstrap(isMobile);
  const { nonThaiCategoryIdToName } = useCategoryData();

  const {
    data: postData,
    error: postError,
    status: postStatus,
    refetch: refetchPosts,
  } = useQuery('allposts', fetchPosts, {
    refetchInterval: REFETCH_INTERVAL * 3,
    staleTime: REFETCH_INTERVAL * 3,
  });
  const {
    error: categoryError,
    status: categoryStatus,
    refetch: refetchCategories,
  } = useQuery('allcategories', fetchCategories, {
    refetchInterval: REFETCH_INTERVAL * 3,
    staleTime: REFETCH_INTERVAL * 3,
  });

  const asciiCategoryNames = useMemo(
    () => Object.values(nonThaiCategoryIdToName),
    [nonThaiCategoryIdToName],
  );

  const postsWithCategoryLabels = useMemo((): PostWithCategoryLabels[] => {
    const idKeys = new Set(Object.keys(nonThaiCategoryIdToName));
    return (
      postData
        ?.map((fetchedPost) => ({
          ...fetchedPost,
          categories:
            fetchedPost.categories
              ?.map((categoryId) =>
                idKeys.has(String(categoryId))
                  ? nonThaiCategoryIdToName[String(categoryId)]
                  : null,
              )
              ?.filter((label): label is string => Boolean(label)) ?? [],
        }))
        ?.filter((p) => p.categories.length > 0) ?? []
    );
  }, [nonThaiCategoryIdToName, postData]);

  const categorySections = useMemo((): CategorySection[] => {
    const postsByCategory = new Map<string, PostWithCategoryLabels[]>();
    for (const name of asciiCategoryNames) {
      postsByCategory.set(name, []);
    }
    for (const post of postsWithCategoryLabels) {
      for (const catName of post.categories) {
        const bucket = postsByCategory.get(catName);
        if (bucket) {
          bucket.push(post);
        }
      }
    }
    return asciiCategoryNames
      .map((categoryName) => ({
        categoryName,
        posts: postsByCategory.get(categoryName) ?? [],
      }))
      .filter((section) => section.posts.length > 0);
  }, [asciiCategoryNames, postsWithCategoryLabels]);

  const numberOfElementsToBeRendered = useMemo(() => {
    if (isXs) return 2;
    if (isSm) return 2;
    if (isMd) return 3;
    if (isLg) return 4;
    if (isXl) return 4;
    return 8;
  }, [isLg, isMd, isSm, isXl, isXs]);

  const sectionsWithImages = useMemo(
    () =>
      categorySections.map((section) => ({
        ...section,
        posts: section.posts.map((post) => ({
          ...post,
          imageUrl: imageUrlById.get(post.featured_media ?? 0),
        })),
      })),
    [categorySections, imageUrlById],
  );

  const totalStoriesInFeed = postData?.length ?? 0;
  const storiesRenderedNow = useMemo(
    () =>
      sectionsWithImages.reduce(
        (sum, section) =>
          sum + section.posts.slice(0, numberOfElementsToBeRendered).length,
        0,
      ),
    [numberOfElementsToBeRendered, sectionsWithImages],
  );

  const successIndicators = useMemo(
    (): StatCard[] => [
      { label: 'Tracked categories', value: String(sectionsWithImages.length) },
      { label: 'Stories in current sync', value: String(totalStoriesInFeed) },
      { label: 'Cards ready on this screen', value: String(storiesRenderedNow) },
    ],
    [sectionsWithImages.length, storiesRenderedNow, totalStoriesInFeed],
  );

  const featureBullets = [
    'Fast load with locally cached JSON and media.',
    'Category-first navigation for direct discovery.',
    'Accessible, mobile-friendly reading experience.',
  ];

  const heroFeaturedArticle = useMemo((): HeroFeaturedArticle | null => {
    if (!cacheReady || !postData?.[0]) {
      return null;
    }
    const post = postData[0];
    const titlePlain = stripRenderedMarkup(post.title?.rendered ?? '');
    const link = post.link ?? THE_STANDARD_HOSTNAME;
    const resolvedImage =
      post.imageUrl ??
      (post.featured_media !== undefined && post.featured_media !== null
        ? imageUrlById.get(post.featured_media)
        : undefined) ??
      placeholderImage;
    const firstCategoryId = post.categories?.[0];
    const categoryLabel =
      firstCategoryId !== undefined
        ? nonThaiCategoryIdToName[String(firstCategoryId)] ?? HERO_FALLBACK_CATEGORY_LABEL
        : HERO_FALLBACK_CATEGORY_LABEL;
    return {
      title: titlePlain || HERO_FALLBACK_ARTICLE_TITLE,
      link,
      image: resolvedImage,
      category: categoryLabel,
    };
  }, [cacheReady, imageUrlById, nonThaiCategoryIdToName, postData]);

  const showInitialShell = !cacheReady;
  const showQuerySpinner =
    cacheReady && (postStatus === 'loading' || categoryStatus === 'loading');

  return (
    <article className='w-full min-h-[60vh] pb-10'>
      {heroFeaturedArticle ? <HeroSection featuredArticle={heroFeaturedArticle} /> : null}
      <PageHeader
        title='Toppy × The Standard News'
        isPrimaryHeading={heroFeaturedArticle === null}
      />
      <section className='max-w-6xl mx-auto px-4 sm:px-6'>
        <h2 className='sr-only'>Your daily trusted briefing</h2>
        <div className='surface-panel p-5 sm:p-6 md:p-8'>
          <h2 className='text-center text-white text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight'>
            Your high-signal reading dashboard for a day magazine.
          </h2>
          <p className='mt-3 text-white/90 text-center max-w-3xl mx-auto text-sm sm:text-base leading-relaxed'>
            Editorially selected headlines with context-first summaries, optimized for
            fast scanning and deeper follow-up when a story matters.
          </p>
          <div className='mt-5 flex flex-col sm:flex-row items-center justify-center gap-3'>
            <Link
              to='/posts/categories/39'
              state={{ category: 'News' }}
              className='btn-primary no-underline inline-flex items-center justify-center'
              aria-label='Start reading now'
            >
              <span className='btn-secondary'>Start reading now</span>
            </Link>
            <Link
              to='/posts/categories/11'
              state={{ category: 'World' }}
              className='inline-flex items-center justify-center rounded-xl border-2 border-white/60 bg-white/10 px-5 py-3 text-white font-semibold uppercase tracking-wide text-sm no-underline hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-bright-blue'
              aria-label='Browse world coverage from our source'
            >
              Explore world coverage
            </Link>
          </div>
        </div>
        <ul
          className='mt-4 flex flex-wrap justify-center gap-2 text-xs sm:text-sm text-white/95'
          aria-label='Trust signals'
        >
          <li className='rounded-full border border-white/35 px-3 py-1'>
            Source: The Standard newsroom
          </li>
          <li className='rounded-full border border-white/35 px-3 py-1'>
            Updated throughout the day
          </li>
          <li className='rounded-full border border-white/35 px-3 py-1'>
            Mobile-first reading experience
          </li>
        </ul>
        <div className='mt-5'>
          <h3 className='text-center text-white font-bold uppercase tracking-wide text-xs sm:text-sm'>
            Quick navigation
          </h3>
          <div className='mt-2 flex flex-wrap justify-center gap-2'>
            <Link
              to='/posts/categories/13'
              state={{ category: 'Business' }}
              className='rounded-full border border-white/40 px-3 py-1 text-white text-xs sm:text-sm no-underline hover:bg-white/20'
            >
              Business
            </Link>
            <Link
              to='/posts/categories/12'
              state={{ category: 'Thailand' }}
              className='rounded-full border border-white/40 px-3 py-1 text-white text-xs sm:text-sm no-underline hover:bg-white/20'
            >
              Thailand
            </Link>
            <Link
              to='/posts/categories/27'
              state={{ category: 'Music' }}
              className='rounded-full border border-white/40 px-3 py-1 text-white text-xs sm:text-sm no-underline hover:bg-white/20'
            >
              Music
            </Link>
            <Link
              to='/posts/categories/33'
              state={{ category: 'Travel' }}
              className='rounded-full border border-white/40 px-3 py-1 text-white text-xs sm:text-sm no-underline hover:bg-white/20'
            >
              Travel
            </Link>
          </div>
        </div>
        <section className='mt-5 surface-panel p-4 sm:p-5'>
          <h3 className='text-white text-lg sm:text-xl font-extrabold'>
            Editorial pages
          </h3>
          <p className='mt-2 text-white/90 text-sm sm:text-base'>
            Understand the product, how syncing works, and which desks map to each hub.
          </p>
          <div className='mt-3 flex flex-wrap gap-2'>
            <Link
              to='/about'
              className='rounded-full border border-white/40 px-3 py-1 text-white text-xs sm:text-sm no-underline hover:bg-white/20'
            >
              About this feed
            </Link>
            <Link
              to='/methodology'
              className='rounded-full border border-white/40 px-3 py-1 text-white text-xs sm:text-sm no-underline hover:bg-white/20'
            >
              Methodology
            </Link>
            <Link
              to='/coverage'
              className='rounded-full border border-white/40 px-3 py-1 text-white text-xs sm:text-sm no-underline hover:bg-white/20'
            >
              Coverage map
            </Link>
          </div>
        </section>
        <section className='mt-5 surface-panel p-4 sm:p-5'>
          <h3 className='text-white text-lg sm:text-xl font-extrabold'>
            Topic landing pages
          </h3>
          <p className='mt-2 text-white/90 text-sm sm:text-base'>
            Choose a curated topic page for focused context and guided navigation.
          </p>
          <div className='mt-3 flex flex-wrap gap-2'>
            <Link
              to='/topics'
              className='rounded-full border border-white/60 bg-white/10 px-3 py-1 text-white text-xs sm:text-sm font-semibold no-underline hover:bg-white/20'
            >
              All topic hubs
            </Link>
            {TOPIC_DEFINITIONS.map((topic) => (
              <Link
                key={topic.slug}
                to={`/topics/${topic.slug}`}
                className='rounded-full border border-white/40 px-3 py-1 text-white text-xs sm:text-sm no-underline hover:bg-white/20'
              >
                {topic.title}
              </Link>
            ))}
          </div>
        </section>
        <section className='mt-6 surface-panel p-4 sm:p-5'>
          <h3 className='text-white text-lg sm:text-xl font-extrabold'>
            Why this feed works
          </h3>
          <ul className='mt-3 grid grid-cols-1 md:grid-cols-3 gap-3'>
            {featureBullets.map((feature) => (
              <li
                key={feature}
                className='rounded-lg border border-white/20 bg-black/10 px-3 py-3 text-white/95 text-sm'
              >
                {feature}
              </li>
            ))}
          </ul>
        </section>
        <section className='mt-5' aria-label='Success indicators'>
          <h3 className='text-center text-white font-bold uppercase tracking-wide text-xs sm:text-sm'>
            Success indicators
          </h3>
          <div className='mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3'>
            {successIndicators.map((indicator) => (
              <div
                key={indicator.label}
                className='rounded-lg border border-white/25 bg-white/10 px-4 py-3 text-center'
              >
                <p className='text-white text-2xl font-extrabold'>{indicator.value}</p>
                <p className='text-white/85 text-xs sm:text-sm uppercase tracking-wide'>
                  {indicator.label}
                </p>
              </div>
            ))}
          </div>
        </section>
        <section className='mt-5 surface-panel p-4 sm:p-5'>
          <h3 className='text-white text-lg sm:text-xl font-extrabold'>
            Content offer: Daily decision brief
          </h3>
          <p className='mt-2 text-white/90 text-sm sm:text-base'>
            Use this feed as your first 10-minute scan: open one lead story, one market
            story, and one culture signal before your next planning block.
          </p>
          <div className='mt-4 flex flex-col sm:flex-row gap-3'>
            <Link
              to='/posts/categories/39'
              state={{ category: 'News' }}
              className='btn-primary no-underline inline-flex items-center justify-center'
            >
              <span className='btn-secondary'>Open the daily brief</span>
            </Link>
            <Link
              to='/posts/categories/13'
              state={{ category: 'Business' }}
              className='inline-flex items-center justify-center rounded-xl border-2 border-white/60 bg-white/10 px-5 py-3 text-white font-semibold uppercase tracking-wide text-sm no-underline hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-bright-blue'
            >
              Browse the business desk
            </Link>
          </div>
        </section>
      </section>
      {showInitialShell ? (
        <HomeSkeleton />
      ) : showQuerySpinner ? (
        <div
          className='spinner-container py-24'
          aria-busy='true'
          aria-label='Refreshing news'
        >
          <Spinner />
        </div>
      ) : postError || categoryError ? (
        <div
          className='mx-6 my-8 rounded-xl border-2 border-white/30 bg-white/10 px-6 py-5 text-white shadow-md'
          role='alert'
        >
          <p className='font-semibold uppercase tracking-wide text-sm opacity-90'>
            Something went wrong
          </p>
          <p className='mt-2 text-lg'>
            {[postError, categoryError]
              .filter(Boolean)
              .map((e) => errorMessage(e))
              .join(' · ')}
          </p>
          <div className='mt-4'>
            <button
              type='button'
              className='btn-primary'
              onClick={() => {
                void refetchPosts();
                void refetchCategories();
              }}
            >
              <span className='btn-secondary'>Retry sync</span>
            </button>
          </div>
        </div>
      ) : (
        <ul className='px-3 sm:px-6 h-full max-w-[1600px] mx-auto'>
          {sectionsWithImages.length === 0 ? (
            <li className='my-10 rounded-xl border-2 border-white/30 bg-white/10 p-6 text-center text-white'>
              <h3 className='text-xl font-extrabold uppercase tracking-wide'>
                No stories available yet
              </h3>
              <p className='mt-2 text-white/90'>
                We are syncing updates from the source. Try again shortly or jump to a
                desk directly.
              </p>
              <div className='mt-4 flex justify-center gap-3 flex-wrap'>
                <Link
                  to='/posts/categories/39'
                  state={{ category: 'News' }}
                  className='btn-primary no-underline inline-flex items-center justify-center'
                >
                  <span className='btn-secondary'>Go to news desk</span>
                </Link>
                <Link
                  to='/posts/categories/11'
                  state={{ category: 'World' }}
                  className='inline-flex items-center justify-center rounded-xl border-2 border-white/60 bg-white/10 px-5 py-3 text-white font-semibold uppercase tracking-wide text-sm no-underline hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-bright-blue'
                >
                  Open world desk
                </Link>
              </div>
            </li>
          ) : (
            sectionsWithImages.map(({ categoryName, posts }, idx) => (
              <li className='w-full my-12 md:my-16 h-full' key={categoryName}>
                <CategoryHeader
                  category={categoryName}
                  categoryIdToName={nonThaiCategoryIdToName}
                />
                <PageBreak />
                <ul className='my-6 grid grid-cols-1 gap-4 md:my-8 md:grid-cols-3 md:gap-6'>
                  {posts.slice(0, numberOfElementsToBeRendered).map((post, postIndex) => {
                    const titlePlain =
                      stripRenderedMarkup(post.title?.rendered ?? '') ||
                      HERO_FALLBACK_ARTICLE_TITLE;
                    const excerptPlain = stripRenderedMarkup(
                      post.excerpt?.rendered ?? '',
                    ).trim();
                    const primaryCategory =
                      post.categories[0] ?? NEWS_CARD_FALLBACK_CATEGORY_LABEL;
                    return (
                      <NewsCard
                        key={post.id}
                        title={titlePlain}
                        imageUrl={post.imageUrl ?? placeholderImage}
                        categoryLabel={primaryCategory}
                        postId={post.id}
                        excerpt={excerptPlain || undefined}
                        externalUrl={post.link}
                        featuredMediaId={post.featured_media}
                        isFeature={postIndex === 0}
                      />
                    );
                  })}
                </ul>
              </li>
            ))
          )}
        </ul>
      )}
    </article>
  );
}

export default Home;
