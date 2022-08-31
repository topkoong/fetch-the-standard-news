import { Link } from 'react-router-dom';

function CategoryHeader({ category, nonThaiCategoriesMapping }: any) {
  const categoryId = Object.keys(nonThaiCategoriesMapping).find(
    (nonThaiCategoryKey: string) =>
      nonThaiCategoriesMapping[nonThaiCategoryKey] === category,
  );
  return (
    <div className='flex justify-between'>
      <div className='category-title'>{category}</div>
      <div className='font-semibold text-lg md:text-xl text-white uppercase underline underline-offset-4'>
        <Link to={`/posts/categories/${categoryId}`} state={{ category }}>
          View all
        </Link>
        {/* TODO:
          Create another component and pass the category ID to the component
          Use React Query to fetch posts and implement pagination / infinite scroll 
           */}
      </div>
    </div>
  );
}

export default CategoryHeader;
