'use client';

import { useForm } from '@tanstack/react-form';
import * as v from 'valibot';
import { CreateIdeaSchema, type CreateIdeaInput, type UpdateIdeaInput } from '@lp/shared';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { type Category } from '@lp/shared';

interface IdeaFormProps {
  categories: Category[];
  defaultValues?: Partial<CreateIdeaInput>;
  onSubmit: (data: CreateIdeaInput | UpdateIdeaInput) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function IdeaForm({ categories, defaultValues, onSubmit, onCancel, isLoading }: IdeaFormProps) {
  const form = useForm({
    defaultValues: {
      title: defaultValues?.title || '',
      categoryId: defaultValues?.categoryId || '',
      shortDescription: defaultValues?.shortDescription || '',
      fullDescription: defaultValues?.fullDescription || '',
      status: defaultValues?.status || ('published' as const),
    },
    onSubmit: async ({ value }) => {
      const result = v.safeParse(CreateIdeaSchema, value);
      if (result.success) {
        await onSubmit(result.output);
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="space-y-5"
    >
      <form.Field name="title">
        {(field) => (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <Input
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Enter idea title (3-100 characters)"
              error={field.state.meta.errors[0]?.toString()}
            />
          </div>
        )}
      </form.Field>

      <form.Field name="categoryId">
        {(field) => (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <Select
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              error={field.state.meta.errors[0]?.toString()}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </Select>
          </div>
        )}
      </form.Field>

      <form.Field name="shortDescription">
        {(field) => (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Short Description <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Brief summary (10-200 characters)"
              rows={3}
              showCounter
              maxLength={200}
              error={field.state.meta.errors[0]?.toString()}
            />
          </div>
        )}
      </form.Field>

      <form.Field name="fullDescription">
        {(field) => (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Description <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Detailed description of your idea (min 20 characters)"
              rows={6}
              showCounter
              error={field.state.meta.errors[0]?.toString()}
            />
          </div>
        )}
      </form.Field>

      <form.Field name="status">
        {(field) => (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <Select
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value as 'draft' | 'published')}
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </Select>
          </div>
        )}
      </form.Field>

      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading || form.state.isSubmitting}>
          {isLoading || form.state.isSubmitting ? 'Saving...' : 'Submit Idea'}
        </Button>
      </div>
    </form>
  );
}
