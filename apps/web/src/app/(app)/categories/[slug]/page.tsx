'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useCategory } from '@/hooks/use-categories';
import { useIdeas } from '@/hooks/use-ideas';
import { IdeaCard } from '@/components/ideas/idea-card';
import { Skeleton } from '@/components/ui/skeleton';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: category, isLoading: catLoading } = useCategory(slug);
  const { data: ideasData, isLoading: ideasLoading } = useIdeas({
    categoryId: category?.id,
  });

  const ideas = ideasData?.data ?? [];

  return (
    <div>
      <Link href="/categories" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to categories
      </Link>

      {catLoading ? (
        <Skeleton className="h-20 w-full mb-6" />
      ) : category ? (
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
          <p className="mt-1 text-gray-500">{category.description}</p>
          <p className="mt-1 text-sm text-gray-400">{category.ideaCount} ideas</p>
        </div>
      ) : null}

      {ideasLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : ideas.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p>No ideas in this category yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {ideas.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
        </div>
      )}
    </div>
  );
}
