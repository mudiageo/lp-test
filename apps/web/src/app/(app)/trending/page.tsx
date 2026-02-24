'use client';

import { useState } from 'react';
import { useTrendingIdeas } from '@/hooks/use-ideas';
import { useCategories } from '@/hooks/use-categories';
import { IdeaCard } from '@/components/ideas/idea-card';
import { TrendingRank } from '@/components/ideas/trending-rank';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { TRENDING_PERIODS } from '@lp/shared';

export default function TrendingPage() {
  const [period, setPeriod] = useState('week');
  const [categoryId, setCategoryId] = useState('');

  const { data: ideas = [], isLoading } = useTrendingIdeas(period, categoryId);
  const { data: categories = [] } = useCategories();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">🔥 Trending Ideas</h1>
        <p className="mt-1 text-gray-500">Most popular ideas gaining momentum right now</p>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <Select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="w-40"
        >
          {TRENDING_PERIODS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </Select>

        <Select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-44"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : ideas.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p>No trending ideas for this period.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {ideas.map((idea, index) => (
            <div key={idea.id} className="flex items-center gap-3">
              <TrendingRank rank={index + 1} />
              <div className="flex-1">
                <IdeaCard idea={idea} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
