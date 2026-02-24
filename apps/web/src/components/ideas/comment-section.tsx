'use client';

import { useState } from 'react';
import { useComments, useCreateComment, useDeleteComment } from '@/hooks/use-comments';
import { useAuth } from '@/hooks/use-auth';
import { CommentItem } from './comment-item';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface CommentSectionProps {
  ideaId: string;
  commentCount: number;
}

export function CommentSection({ ideaId, commentCount }: CommentSectionProps) {
  const { user, isAuthenticated } = useAuth();
  const [content, setContent] = useState('');
  const { data: comments = [], isLoading } = useComments(ideaId);
  const createComment = useCreateComment(ideaId);
  const deleteComment = useDeleteComment(ideaId);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    await createComment.mutateAsync({ content });
    setContent('');
  };

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Comments ({commentCount})
      </h3>

      {isAuthenticated && (
        <div className="mb-6">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a comment..."
            rows={3}
            showCounter
            maxLength={1000}
          />
          <div className="mt-2 flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={!content.trim() || createComment.isPending}
              size="sm"
            >
              Post Comment
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-gray-400">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-gray-400">No comments yet. Be the first to comment!</p>
      ) : (
        <div>
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={user?.id}
              onDelete={(id) => deleteComment.mutate(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
