import CardSkeleton from '@components/card-skeleton';

const GRID =
  'grid grid-cols-1 gap-8 md:gap-10 lg:gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-4 sm:px-6';

function PostsPageSkeleton() {
  return (
    <div aria-busy='true' aria-label='Loading posts'>
      <ul className={`${GRID} py-4`}>
        {Array.from({ length: 8 }, (_, i) => (
          <CardSkeleton key={i} />
        ))}
      </ul>
    </div>
  );
}

export default PostsPageSkeleton;
