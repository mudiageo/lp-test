import Link from 'next/link';
import { FolderOpen, ArrowRight } from 'lucide-react';
import { type Category } from '@lp/shared';

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link href={`/categories/${category.slug}`}>
      <div className="bg-white rounded-lg border border-gray-200 p-5 hover:border-[#6366f1] hover:shadow-md transition-all group">
        <div className="flex items-start justify-between mb-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${category.color}20` }}
          >
            <FolderOpen className="h-5 w-5" style={{ color: category.color }} />
          </div>
          <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-[#6366f1] transition-colors" />
        </div>
        <h3 className="font-semibold text-gray-900">{category.name}</h3>
        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{category.description}</p>
        {category.ideaCount !== undefined && (
          <p className="mt-3 text-xs text-gray-400">{category.ideaCount} ideas</p>
        )}
      </div>
    </Link>
  );
}
