'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useIdea } from '@/hooks/use-ideas';
import { VoteButton } from '@/components/ideas/vote-button';
import { CommentSection } from '@/components/ideas/comment-section';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { timeAgo } from '@/lib/utils';

export default function IdeaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: idea, isLoading } = useIdea(id);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto">
        <Skeleton className="h-8 w-32 mb-6" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p>Idea not found</p>
        <button onClick={() => router.push('/')} className="mt-2 text-[#6366f1] hover:underline text-sm">
          Back to ideas
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to ideas
      </Link>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex gap-4">
          <VoteButton
            ideaId={idea.id}
            voteCount={idea.voteCount}
            hasVoted={idea.hasVoted}
            size="large"
          />

          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-xl font-bold text-gray-900">{idea.title}</h1>
              {idea.category && (
                <Badge style={{ backgroundColor: `${idea.category.color}20`, color: idea.category.color }}>
                  {idea.category.name}
                </Badge>
              )}
            </div>

            <p className="mt-2 text-sm text-gray-500">
              by {idea.author?.name || 'Anonymous'} · {timeAgo(idea.createdAt)}
            </p>
          </div>
        </div>

        <div className="mt-6 prose prose-sm max-w-none">
          <div className="text-gray-700 whitespace-pre-wrap">{idea.fullDescription}</div>
        </div>
      </div>

      <CommentSection ideaId={idea.id} commentCount={idea.commentCount} />
    </div>
  );
}
