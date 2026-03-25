import CardSkeleton from '@components/card-skeleton';

const DEFAULT_GRID =
  'grid grid-cols-1 gap-8 md:gap-10 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 my-8';

/** Mirrors home category sections while cached JSON / queries bootstrap. */
function HomeSkeleton() {
  return (
    <div
      className='px-4 sm:px-6 max-w-[1600px] mx-auto py-2'
      aria-busy='true'
      aria-label='Loading news sections'
    >
      {[0, 1].map((section) => (
        <div key={section} className='w-full my-12'>
          <div className='flex justify-between items-center gap-4 mb-6 animate-pulse'>
            <div className='h-10 w-48 rounded-md bg-white/25 md:h-12 md:w-64' />
            <div className='h-6 w-24 rounded-md bg-white/20' />
          </div>
          <div className='h-px w-full bg-white/20 mb-8' />
          <ul className={DEFAULT_GRID}>
            {Array.from({ length: 4 }, (_, i) => (
              <CardSkeleton key={i} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default HomeSkeleton;
