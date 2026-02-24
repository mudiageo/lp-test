'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronUp, MessageSquare, Edit, Trash2 } from 'lucide-react';
import { type Idea } from '@lp/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { timeAgo, formatCount } from '@/lib/utils';

interface IdeaCardMyProps {
  idea: Idea;
  onEdit: (idea: Idea) => void;
  onDelete: (idea: Idea) => void;
}

export function IdeaCardMy({ idea, onEdit, onDelete }: IdeaCardMyProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow flex overflow-hidden relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Vote box */}
      <div className="flex flex-col items-center justify-center bg-[#6366f1] text-white w-[52px] flex-shrink-0 py-4">
        <ChevronUp className="h-5 w-5" />
        <span className="text-sm font-bold">{formatCount(idea.voteCount)}</span>
      </div>

      {/* Content */}
      <Link href={`/ideas/${idea.id}`} className="flex-1 p-4 relative block">
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <Badge variant={idea.status === 'published' ? 'success' : 'warning'}>
            {idea.status === 'published' ? 'Published' : 'Draft'}
          </Badge>
          {idea.category && (
            <Badge style={{ backgroundColor: `${idea.category.color}20`, color: idea.category.color }}>
              {idea.category.name}
            </Badge>
          )}
        </div>

        <h3 className="text-base font-semibold text-gray-900 pr-36 line-clamp-1">
          {idea.title}
        </h3>

        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{idea.shortDescription}</p>

        <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <ChevronUp className="h-3 w-3" />
            {idea.voteCount} upvotes
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            {idea.commentCount} comments
          </span>
          <span>{timeAgo(idea.createdAt)}</span>
        </div>
      </Link>

      {/* Action buttons on hover */}
      {isHovered && (
        <div className="absolute right-4 bottom-4 flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => { e.preventDefault(); onEdit(idea); }}
          >
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50"
            onClick={(e) => { e.preventDefault(); onDelete(idea); }}
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Delete
          </Button>
        </div>
      )}
    </div>
  );
}
