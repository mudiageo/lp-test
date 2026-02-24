'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';
import type { Comment, ApiResponse, CreateCommentInput } from '@lp/shared';

export function useComments(ideaId: string) {
  return useQuery({
    queryKey: ['comments', ideaId],
    queryFn: () =>
      apiRequest<ApiResponse<Comment[]>>(`/api/ideas/${ideaId}/comments`).then((r) => r.data!),
    enabled: !!ideaId,
  });
}

export function useCreateComment(ideaId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCommentInput) =>
      apiRequest<ApiResponse<Comment>>(`/api/ideas/${ideaId}/comments`, {
        method: 'POST',
        body: JSON.stringify(data),
      }).then((r) => r.data!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', ideaId] });
      queryClient.invalidateQueries({ queryKey: ['idea', ideaId] });
    },
  });
}

export function useDeleteComment(ideaId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) =>
      apiRequest<ApiResponse>(`/api/comments/${commentId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', ideaId] });
      queryClient.invalidateQueries({ queryKey: ['idea', ideaId] });
    },
  });
}
