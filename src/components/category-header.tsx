import { Link } from 'react-router-dom';

interface CategoryHeaderProps {
  category: string;
  /** WordPress category id (string key) → display name for ASCII-only categories. */
  categoryIdToName: Record<string, string>;
}

function CategoryHeader({ category, categoryIdToName }: CategoryHeaderProps) {
  const categoryId = Object.keys(categoryIdToName).find(
    (id) => categoryIdToName[id] === category,
  );
  return (
    <div className='flex justify-between'>
      <div className='category-title'>{category}</div>
      <div className='font-semibold text-base md:text-lg text-white uppercase'>
        {categoryId ? (
          <Link
            to={`/posts/categories/${categoryId}`}
            state={{ category }}
            className='inline-flex items-center gap-1 underline underline-offset-4 decoration-2 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-bright-blue rounded-sm px-1 -mx-1'
          >
            View all
          </Link>
        ) : (
          <span className='opacity-60 cursor-not-allowed' aria-disabled='true'>
            View all
          </span>
        )}
      </div>
    </div>
  );
}

export default CategoryHeader;
