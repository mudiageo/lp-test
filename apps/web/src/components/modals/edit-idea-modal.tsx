'use client';

import { type Idea } from '@lp/shared';
import { Dialog } from '@/components/ui/dialog';
import { IdeaForm } from '@/components/ideas/idea-form';
import { useUpdateIdea } from '@/hooks/use-ideas';
import { useCategories } from '@/hooks/use-categories';

interface EditIdeaModalProps {
  idea: Idea | null;
  onClose: () => void;
}

export function EditIdeaModal({ idea, onClose }: EditIdeaModalProps) {
  const { data: categories = [] } = useCategories();
  const updateIdea = useUpdateIdea();

  if (!idea) return null;

  return (
    <Dialog open={!!idea} onClose={onClose} className="max-w-2xl">
      <h2 className="text-lg font-semibold text-gray-900 mb-5 pr-8">
        Edit: {idea.title}
      </h2>
      <IdeaForm
        categories={categories}
        defaultValues={{
          title: idea.title,
          categoryId: idea.categoryId,
          shortDescription: idea.shortDescription,
          fullDescription: idea.fullDescription,
          status: idea.status,
        }}
        onSubmit={async (data) => {
          await updateIdea.mutateAsync({ id: idea.id, data });
          onClose();
        }}
        onCancel={onClose}
        isLoading={updateIdea.isPending}
      />
    </Dialog>
  );
}
