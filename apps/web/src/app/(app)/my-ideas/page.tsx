'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useMyIdeas } from '@/hooks/use-ideas';
import { IdeaCardMy } from '@/components/ideas/idea-card-my';
import { EditIdeaModal } from '@/components/modals/edit-idea-modal';
import { DeleteConfirmModal } from '@/components/modals/delete-confirm-modal';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { type Idea } from '@lp/shared';

export default function MyIdeasPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: ideas = [], isLoading } = useMyIdeas();

  const [editIdea, setEditIdea] = useState<Idea | null>(null);
  const [deleteIdeaId, setDeleteIdeaId] = useState<string | null>(null);
  const [deleteIdeaTitle, setDeleteIdeaTitle] = useState<string | undefined>();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const totalVotes = ideas.reduce((sum, idea) => sum + idea.voteCount, 0);
  const totalComments = ideas.reduce((sum, idea) => sum + idea.commentCount, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Ideas</h1>
          <p className="mt-1 text-gray-500">Manage and track your submitted ideas</p>
        </div>
        <Link href="/ideas/new">
          <Button>
            <Plus className="h-4 w-4 mr-1" />
            New Idea
          </Button>
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{ideas.length}</p>
          <p className="text-sm text-gray-500">Total Ideas</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-[#6366f1]">{totalVotes}</p>
          <p className="text-sm text-gray-500">Total Upvotes</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{totalComments}</p>
          <p className="text-sm text-gray-500">Total Comments</p>
        </div>
      </div>

      {isLoading || authLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : ideas.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">No ideas yet</p>
          <p className="text-sm mt-1">Share your first startup idea!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {ideas.map((idea) => (
            <IdeaCardMy
              key={idea.id}
              idea={idea}
              onEdit={setEditIdea}
              onDelete={(idea) => {
                setDeleteIdeaId(idea.id);
                setDeleteIdeaTitle(idea.title);
              }}
            />
          ))}
        </div>
      )}

      <EditIdeaModal idea={editIdea} onClose={() => setEditIdea(null)} />
      <DeleteConfirmModal
        ideaId={deleteIdeaId}
        ideaTitle={deleteIdeaTitle}
        onClose={() => {
          setDeleteIdeaId(null);
          setDeleteIdeaTitle(undefined);
        }}
      />
    </div>
  );
}
