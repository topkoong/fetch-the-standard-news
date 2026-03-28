import { NEWS_CARD_ARTICLE_CLASS } from '@constants/index';

/** Placeholder block for news card layout (pulse). */
function CardSkeleton() {
  return (
    <li
      className={`${NEWS_CARD_ARTICLE_CLASS} pointer-events-none h-full list-none select-none overflow-hidden`}
      aria-hidden='true'
    >
      <div className='flex h-full min-h-0 animate-pulse flex-col'>
        <div className='relative aspect-[16/10] w-full bg-neutral-200' />
        <div className='flex flex-1 flex-col gap-3 p-4 sm:p-5 md:p-6'>
          <div className='h-14 rounded-md bg-neutral-200' />
          <div className='h-12 rounded-md bg-neutral-200' />
          <div className='mx-auto mt-auto h-10 w-full max-w-xs rounded-lg bg-neutral-200' />
        </div>
      </div>
    </li>
  );
}

export default CardSkeleton;
