export interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  ideaCount?: number;
}

export type IdeaStatus = 'draft' | 'published';

export interface Idea {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  status: IdeaStatus;
  categoryId: string;
  category?: Category;
  authorId: string;
  author?: Pick<User, 'id' | 'name' | 'image'>;
  voteCount: number;
  commentCount: number;
  hasVoted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  content: string;
  ideaId: string;
  authorId: string;
  author?: Pick<User, 'id' | 'name' | 'image'>;
  createdAt: string;
  updatedAt: string;
}

export interface Vote {
  id: string;
  ideaId: string;
  userId: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export type SortOption = 'newest' | 'oldest' | 'most_voted' | 'most_commented';
export type TrendingPeriod = 'today' | 'week' | 'month' | 'all';
