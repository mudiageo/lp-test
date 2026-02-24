'use client';

import { AlertTriangle } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useDeleteIdea } from '@/hooks/use-ideas';

interface DeleteConfirmModalProps {
  ideaId: string | null;
  ideaTitle?: string;
  onClose: () => void;
}

export function DeleteConfirmModal({ ideaId, ideaTitle, onClose }: DeleteConfirmModalProps) {
  const deleteIdea = useDeleteIdea();

  const handleDelete = async () => {
    if (!ideaId) return;
    await deleteIdea.mutateAsync(ideaId);
    onClose();
  };

  return (
    <Dialog open={!!ideaId} onClose={onClose}>
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">Are you sure you want to delete?</h2>
        <p className="mt-2 text-sm text-gray-500">
          You&apos;re attempting to delete &ldquo;{ideaTitle}&rdquo;
        </p>
        <p className="mt-1 text-sm font-bold text-red-600">This action cannot be undone!</p>

        <div className="mt-6 flex items-center gap-4 w-full justify-center">
          <button
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Cancel
          </button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteIdea.isPending}
          >
            {deleteIdea.isPending ? 'Deleting...' : 'Proceed'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
