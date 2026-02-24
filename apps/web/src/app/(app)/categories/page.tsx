'use client';

import { useCategories } from '@/hooks/use-categories';
import { CategoryCard } from '@/components/categories/category-card';
import { Skeleton } from '@/components/ui/skeleton';

export default function CategoriesPage() {
  const { data: categories = [], isLoading } = useCategories();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Browse by Category</h1>
        <p className="mt-1 text-gray-500">Explore ideas organized by industry and focus area</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(12)].map((_, i) => (
            <Skeleton key={i} className="h-36 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      )}
    </div>
  );
}
