'use client';

import Link from 'next/link';
import { ChevronUp, MessageSquare } from 'lucide-react';
import { type Idea } from '@lp/shared';
import { Badge } from '@/components/ui/badge';
import { timeAgo, formatCount } from '@/lib/utils';

interface IdeaCardProps {
  idea: Idea;
}

export function IdeaCard({ idea }: IdeaCardProps) {
  return (
    <Link href={`/ideas/${idea.id}`}>
      <div className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow flex overflow-hidden">
        {/* Vote box */}
        <div className="flex flex-col items-center justify-center bg-[#6366f1] text-white w-[52px] flex-shrink-0 py-4">
          <ChevronUp className="h-5 w-5" />
          <span className="text-sm font-bold">{formatCount(idea.voteCount)}</span>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 relative">
          {idea.category && (
            <span className="absolute top-3 right-3">
              <Badge style={{ backgroundColor: `${idea.category.color}20`, color: idea.category.color }}>
                {idea.category.name}
              </Badge>
            </span>
          )}

          <h3 className="text-base font-semibold text-gray-900 pr-24 line-clamp-1">
            {idea.title}
          </h3>

          <p className="mt-1 text-sm text-gray-500 line-clamp-2">{idea.shortDescription}</p>

          <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {idea.commentCount}
            </span>
            {idea.author && <span>by {idea.author.name}</span>}
            <span>{timeAgo(idea.createdAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
