function CategoryHeader({ category, nonThaiCategoriesMapping }: any) {
  return (
    <div className="flex justify-between">
      <div className="font-semibold text-4xl text-white uppercase">{category}</div>
      <div className="font-semibold text-xl text-white uppercase underline underline-offset-4">
        View all - Category ID:
        {/* TODO:
          Create another component and pass the category ID to the component
          Use React Query to fetch posts and implement pagination / infinite scroll 
           */}
        {Object.keys(nonThaiCategoriesMapping).find(
          (nonThaiCategoryKey: string) =>
            nonThaiCategoriesMapping[nonThaiCategoryKey] === category,
        )}
      </div>
    </div>
  );
}

export default CategoryHeader;
