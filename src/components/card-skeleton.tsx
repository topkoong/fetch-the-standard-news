/** Placeholder block for news card layout (pulse). */
function CardSkeleton() {
  return (
    <li className='card-article pointer-events-none select-none' aria-hidden='true'>
      <div className='flex flex-col gap-4 h-full animate-pulse'>
        <div className='h-16 rounded-md bg-white/25' />
        <div className='relative w-full aspect-[16/10] rounded-md bg-white/20' />
        <div className='h-14 rounded-md bg-white/25 mx-auto w-3/4 max-w-[14rem]' />
      </div>
    </li>
  );
}

export default CardSkeleton;
