import { Link } from 'react-router-dom';

function CategoryHeader({ category, nonThaiCategoriesMapping }: any) {
  const categoryId = Object.keys(nonThaiCategoriesMapping).find(
    (nonThaiCategoryKey: string) =>
      nonThaiCategoriesMapping[nonThaiCategoryKey] === category,
  );
  return (
    <div className='flex justify-between'>
      <div className='category-title'>{category}</div>
      <div className='font-semibold text-base md:text-lg text-white uppercase'>
        <Link
          to={`/posts/categories/${categoryId}`}
          state={{ category }}
          className='inline-flex items-center gap-1 underline underline-offset-4 decoration-2 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-bright-blue rounded-sm px-1 -mx-1'
        >
          View all
        </Link>
      </div>
    </div>
  );
}

export default CategoryHeader;
