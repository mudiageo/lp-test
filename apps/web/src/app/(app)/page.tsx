'use client';

import { useState } from 'react';
import { useIdeas } from '@/hooks/use-ideas';
import { useCategories } from '@/hooks/use-categories';
import { IdeaCard } from '@/components/ideas/idea-card';
import { IdeaFilters } from '@/components/ideas/idea-filters';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePage() {
  const [categoryId, setCategoryId] = useState('');
  const [sort, setSort] = useState('newest');
  const [search] = useState('');

  const { data: categoriesData } = useCategories();
  const { data: ideasData, isLoading } = useIdeas({ categoryId, sort, search });

  const ideas = ideasData?.data ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Discover Ideas</h1>
        <IdeaFilters
          categories={categoriesData}
          categoryId={categoryId}
          sort={sort}
          onCategoryChange={setCategoryId}
          onSortChange={setSort}
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : ideas.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">No ideas found</p>
          <p className="text-sm mt-1">Be the first to share an idea!</p>
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
