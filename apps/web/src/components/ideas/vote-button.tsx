'use client';

import { ChevronUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToggleVote } from '@/hooks/use-ideas';
import { useAuth } from '@/hooks/use-auth';
import { cn, formatCount } from '@/lib/utils';

interface VoteButtonProps {
  ideaId: string;
  voteCount: number;
  hasVoted?: boolean;
  size?: 'default' | 'large';
}

export function VoteButton({ ideaId, voteCount, hasVoted, size = 'default' }: VoteButtonProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { mutate: toggleVote, isPending } = useToggleVote(ideaId);

  const handleClick = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    toggleVote();
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        'flex flex-col items-center justify-center rounded-lg transition-colors',
        hasVoted
          ? 'bg-[#6366f1] text-white'
          : 'bg-gray-100 text-gray-600 hover:bg-[#6366f1] hover:text-white',
        size === 'large' ? 'w-16 h-16 gap-0.5' : 'w-12 h-12 gap-0.5',
        isPending && 'opacity-50 cursor-not-allowed'
      )}
    >
      <ChevronUp className={size === 'large' ? 'h-6 w-6' : 'h-4 w-4'} />
      <span className={cn('font-bold', size === 'large' ? 'text-base' : 'text-sm')}>
        {formatCount(voteCount)}
      </span>
    </button>
  );
}
