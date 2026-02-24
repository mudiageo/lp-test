'use client';

import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';
import type { Category, ApiResponse } from '@lp/shared';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () =>
      apiRequest<ApiResponse<Category[]>>('/api/categories').then((r) => r.data!),
  });
}

export function useCategory(slug: string) {
  return useQuery({
    queryKey: ['category', slug],
    queryFn: () =>
      apiRequest<ApiResponse<Category>>(`/api/categories/${slug}`).then((r) => r.data!),
    enabled: !!slug,
  });
}
