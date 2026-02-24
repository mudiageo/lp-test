'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';
import type { Idea, PaginatedResponse, ApiResponse, CreateIdeaInput, UpdateIdeaInput } from '@lp/shared';

interface IdeasFilters {
  categoryId?: string;
  sort?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export function useIdeas(filters: IdeasFilters = {}) {
  const params = new URLSearchParams();
  if (filters.categoryId) params.set('categoryId', filters.categoryId);
  if (filters.sort) params.set('sort', filters.sort);
  if (filters.search) params.set('search', filters.search);
  if (filters.page) params.set('page', String(filters.page));
  if (filters.pageSize) params.set('pageSize', String(filters.pageSize));

  return useQuery({
    queryKey: ['ideas', filters],
    queryFn: () =>
      apiRequest<ApiResponse<PaginatedResponse<Idea>>>(`/api/ideas?${params.toString()}`).then(
        (r) => r.data!
      ),
  });
}

export function useIdea(id: string) {
  return useQuery({
    queryKey: ['idea', id],
    queryFn: () =>
      apiRequest<ApiResponse<Idea>>(`/api/ideas/${id}`).then((r) => r.data!),
    enabled: !!id,
  });
}

export function useMyIdeas() {
  return useQuery({
    queryKey: ['my-ideas'],
    queryFn: () =>
      apiRequest<ApiResponse<Idea[]>>('/api/ideas/my').then((r) => r.data!),
  });
}

export function useTrendingIdeas(period?: string, categoryId?: string) {
  const params = new URLSearchParams();
  if (period) params.set('period', period);
  if (categoryId) params.set('categoryId', categoryId);

  return useQuery({
    queryKey: ['trending-ideas', period, categoryId],
    queryFn: () =>
      apiRequest<ApiResponse<Idea[]>>(`/api/ideas/trending?${params.toString()}`).then(
        (r) => r.data!
      ),
  });
}

export function useCreateIdea() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateIdeaInput) =>
      apiRequest<ApiResponse<Idea>>('/api/ideas', {
        method: 'POST',
        body: JSON.stringify(data),
      }).then((r) => r.data!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ideas'] });
      queryClient.invalidateQueries({ queryKey: ['my-ideas'] });
    },
  });
}

export function useUpdateIdea() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateIdeaInput }) =>
      apiRequest<ApiResponse<Idea>>(`/api/ideas/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }).then((r) => r.data!),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ideas'] });
      queryClient.invalidateQueries({ queryKey: ['idea', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['my-ideas'] });
    },
  });
}

export function useDeleteIdea() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiRequest<ApiResponse>(`/api/ideas/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ideas'] });
      queryClient.invalidateQueries({ queryKey: ['my-ideas'] });
    },
  });
}

export function useToggleVote(ideaId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiRequest<ApiResponse<{ hasVoted: boolean; voteCount: number }>>(`/api/ideas/${ideaId}/vote`, {
        method: 'POST',
      }).then((r) => r.data!),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['idea', ideaId] });
      const previousIdea = queryClient.getQueryData<Idea>(['idea', ideaId]);
      if (previousIdea) {
        queryClient.setQueryData(['idea', ideaId], {
          ...previousIdea,
          hasVoted: !previousIdea.hasVoted,
          voteCount: previousIdea.hasVoted
            ? previousIdea.voteCount - 1
            : previousIdea.voteCount + 1,
        });
      }
      return { previousIdea };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousIdea) {
        queryClient.setQueryData(['idea', ideaId], context.previousIdea);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['idea', ideaId] });
      queryClient.invalidateQueries({ queryKey: ['ideas'] });
    },
  });
}
