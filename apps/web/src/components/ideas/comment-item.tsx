import { Trash2 } from 'lucide-react';
import { type Comment } from '@lp/shared';
import { Avatar } from '@/components/ui/avatar';
import { timeAgo } from '@/lib/utils';

interface CommentItemProps {
  comment: Comment & { author?: { id: string; name: string; image?: string | null } };
  currentUserId?: string;
  onDelete?: (id: string) => void;
}

export function CommentItem({ comment, currentUserId, onDelete }: CommentItemProps) {
  return (
    <div className="flex gap-3 py-4 border-b border-gray-100 last:border-0">
      <Avatar src={comment.author?.image} name={comment.author?.name} size="sm" />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">
              {comment.author?.name || 'Anonymous'}
            </span>
            <span className="text-xs text-gray-400">{timeAgo(comment.createdAt)}</span>
          </div>
          {currentUserId === comment.authorId && onDelete && (
            <button
              onClick={() => onDelete(comment.id)}
              className="text-gray-300 hover:text-red-500 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
        <p className="mt-1 text-sm text-gray-600">{comment.content}</p>
      </div>
    </div>
  );
}
