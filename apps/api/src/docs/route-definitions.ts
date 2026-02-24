import * as v from 'valibot';
import { defineEndpoint } from '@uraniadev/sveltekit-valibot-openapi';
import { CreateIdeaSchema, UpdateIdeaSchema, CreateCommentSchema } from '@lp/shared';

// ─── Shared response schemas ──────────────────────────────────────────────────

const AuthorSchema = v.object({
  id: v.string(),
  name: v.string(),
  image: v.optional(v.nullable(v.string())),
});

const CategorySchema = v.object({
  id: v.string(),
  name: v.string(),
  slug: v.string(),
  description: v.string(),
  color: v.string(),
  ideaCount: v.optional(v.number()),
});

const IdeaSchema = v.object({
  id: v.string(),
  title: v.string(),
  shortDescription: v.string(),
  fullDescription: v.string(),
  status: v.picklist(['draft', 'published']),
  categoryId: v.string(),
  authorId: v.string(),
  voteCount: v.number(),
  commentCount: v.number(),
  hasVoted: v.optional(v.boolean()),
  createdAt: v.string(),
  updatedAt: v.string(),
  category: v.optional(CategorySchema),
  author: v.optional(AuthorSchema),
});

const CommentSchema = v.object({
  id: v.string(),
  content: v.string(),
  ideaId: v.string(),
  authorId: v.string(),
  createdAt: v.string(),
  updatedAt: v.string(),
  author: v.optional(AuthorSchema),
});

const ErrorSchema = v.object({
  success: v.literal(false),
  error: v.string(),
});

const PaginatedIdeasSchema = v.object({
  success: v.literal(true),
  data: v.object({
    data: v.array(IdeaSchema),
    total: v.number(),
    page: v.number(),
    pageSize: v.number(),
    totalPages: v.number(),
  }),
});

const IdeaResponseSchema = v.object({
  success: v.literal(true),
  data: IdeaSchema,
});

const CommentResponseSchema = v.object({
  success: v.literal(true),
  data: CommentSchema,
});

const VoteResponseSchema = v.object({
  success: v.literal(true),
  data: v.object({
    hasVoted: v.boolean(),
    voteCount: v.number(),
  }),
});

const MessageResponseSchema = v.object({
  success: v.literal(true),
  message: v.string(),
});

// ─── Query schemas ────────────────────────────────────────────────────────────

const IdeasQuerySchema = v.object({
  categoryId: v.optional(v.string()),
  sort: v.optional(v.picklist(['newest', 'oldest', 'most_voted', 'most_commented'])),
  search: v.optional(v.string()),
  page: v.optional(v.string()),
  pageSize: v.optional(v.string()),
});

const TrendingQuerySchema = v.object({
  period: v.optional(v.picklist(['today', 'week', 'month', 'all'])),
  categoryId: v.optional(v.string()),
});

// ─── Security ─────────────────────────────────────────────────────────────────

const cookieAuth = [{ cookieAuth: [] }];

// ─── Ideas endpoints ──────────────────────────────────────────────────────────

export const ideasModule = {
  GET: defineEndpoint({
    method: 'GET',
    path: '/api/ideas',
    summary: 'List published ideas',
    description: 'Returns a paginated list of published ideas with optional filtering and sorting.',
    tags: ['Ideas'],
    query: IdeasQuerySchema,
    responses: {
      200: { description: 'Paginated list of ideas', schema: PaginatedIdeasSchema },
      500: { description: 'Server error', schema: ErrorSchema },
    },
  }),
  POST: defineEndpoint({
    method: 'POST',
    path: '/api/ideas',
    summary: 'Create a new idea',
    tags: ['Ideas'],
    body: CreateIdeaSchema,
    security: cookieAuth,
    responses: {
      201: { description: 'Created idea', schema: IdeaResponseSchema },
      400: { description: 'Validation error', schema: ErrorSchema },
      401: { description: 'Unauthorized', schema: ErrorSchema },
      500: { description: 'Server error', schema: ErrorSchema },
    },
  }),
};

export const ideasTrendingModule = {
  GET: defineEndpoint({
    method: 'GET',
    path: '/api/ideas/trending',
    summary: 'Get trending ideas',
    description: 'Returns ideas sorted by trending score (voteCount + commentCount * 0.5) for a given time period.',
    tags: ['Ideas'],
    query: TrendingQuerySchema,
    responses: {
      200: {
        description: 'Trending ideas',
        schema: v.object({ success: v.literal(true), data: v.array(IdeaSchema) }),
      },
      500: { description: 'Server error', schema: ErrorSchema },
    },
  }),
};

export const ideasMyModule = {
  GET: defineEndpoint({
    method: 'GET',
    path: '/api/ideas/my',
    summary: 'Get my ideas',
    description: "Returns all ideas belonging to the authenticated user (all statuses).",
    tags: ['Ideas'],
    security: cookieAuth,
    responses: {
      200: {
        description: 'User ideas',
        schema: v.object({ success: v.literal(true), data: v.array(IdeaSchema) }),
      },
      401: { description: 'Unauthorized', schema: ErrorSchema },
      500: { description: 'Server error', schema: ErrorSchema },
    },
  }),
};

export const ideaByIdModule = {
  GET: defineEndpoint({
    method: 'GET',
    path: '/api/ideas/{id}',
    summary: 'Get idea by ID',
    tags: ['Ideas'],
    responses: {
      200: { description: 'Idea details', schema: IdeaResponseSchema },
      404: { description: 'Not found', schema: ErrorSchema },
      500: { description: 'Server error', schema: ErrorSchema },
    },
  }),
  PUT: defineEndpoint({
    method: 'PUT',
    path: '/api/ideas/{id}',
    summary: 'Update idea',
    tags: ['Ideas'],
    body: UpdateIdeaSchema,
    security: cookieAuth,
    responses: {
      200: { description: 'Updated idea', schema: IdeaResponseSchema },
      400: { description: 'Validation error', schema: ErrorSchema },
      401: { description: 'Unauthorized', schema: ErrorSchema },
      403: { description: 'Forbidden', schema: ErrorSchema },
      404: { description: 'Not found', schema: ErrorSchema },
      500: { description: 'Server error', schema: ErrorSchema },
    },
  }),
  DELETE: defineEndpoint({
    method: 'DELETE',
    path: '/api/ideas/{id}',
    summary: 'Delete idea',
    tags: ['Ideas'],
    security: cookieAuth,
    responses: {
      200: { description: 'Deleted', schema: MessageResponseSchema },
      401: { description: 'Unauthorized', schema: ErrorSchema },
      403: { description: 'Forbidden', schema: ErrorSchema },
      404: { description: 'Not found', schema: ErrorSchema },
      500: { description: 'Server error', schema: ErrorSchema },
    },
  }),
};

export const ideaVoteModule = {
  POST: defineEndpoint({
    method: 'POST',
    path: '/api/ideas/{id}/vote',
    summary: 'Toggle vote on idea',
    description: 'Adds a vote if the user has not voted, removes it if they have.',
    tags: ['Ideas'],
    security: cookieAuth,
    responses: {
      200: { description: 'Vote toggled', schema: VoteResponseSchema },
      401: { description: 'Unauthorized', schema: ErrorSchema },
      404: { description: 'Not found', schema: ErrorSchema },
      500: { description: 'Server error', schema: ErrorSchema },
    },
  }),
};

export const ideaCommentsModule = {
  GET: defineEndpoint({
    method: 'GET',
    path: '/api/ideas/{id}/comments',
    summary: 'List comments for an idea',
    tags: ['Comments'],
    responses: {
      200: {
        description: 'List of comments',
        schema: v.object({ success: v.literal(true), data: v.array(CommentSchema) }),
      },
      500: { description: 'Server error', schema: ErrorSchema },
    },
  }),
  POST: defineEndpoint({
    method: 'POST',
    path: '/api/ideas/{id}/comments',
    summary: 'Add comment to idea',
    tags: ['Comments'],
    body: CreateCommentSchema,
    security: cookieAuth,
    responses: {
      201: { description: 'Created comment', schema: CommentResponseSchema },
      400: { description: 'Validation error', schema: ErrorSchema },
      401: { description: 'Unauthorized', schema: ErrorSchema },
      404: { description: 'Idea not found', schema: ErrorSchema },
      500: { description: 'Server error', schema: ErrorSchema },
    },
  }),
};

// ─── Categories endpoints ─────────────────────────────────────────────────────

export const categoriesModule = {
  GET: defineEndpoint({
    method: 'GET',
    path: '/api/categories',
    summary: 'List all categories',
    description: 'Returns all categories with their idea counts.',
    tags: ['Categories'],
    responses: {
      200: {
        description: 'List of categories',
        schema: v.object({ success: v.literal(true), data: v.array(CategorySchema) }),
      },
      500: { description: 'Server error', schema: ErrorSchema },
    },
  }),
};

export const categoryBySlugModule = {
  GET: defineEndpoint({
    method: 'GET',
    path: '/api/categories/{slug}',
    summary: 'Get category by slug',
    tags: ['Categories'],
    responses: {
      200: {
        description: 'Category details',
        schema: v.object({ success: v.literal(true), data: CategorySchema }),
      },
      404: { description: 'Not found', schema: ErrorSchema },
      500: { description: 'Server error', schema: ErrorSchema },
    },
  }),
};

// ─── Comments endpoints ───────────────────────────────────────────────────────

export const commentByIdModule = {
  DELETE: defineEndpoint({
    method: 'DELETE',
    path: '/api/comments/{id}',
    summary: 'Delete a comment',
    tags: ['Comments'],
    security: cookieAuth,
    responses: {
      200: { description: 'Deleted', schema: MessageResponseSchema },
      401: { description: 'Unauthorized', schema: ErrorSchema },
      403: { description: 'Forbidden', schema: ErrorSchema },
      404: { description: 'Not found', schema: ErrorSchema },
      500: { description: 'Server error', schema: ErrorSchema },
    },
  }),
};

// ─── Health check ─────────────────────────────────────────────────────────────

export const healthModule = {
  GET: defineEndpoint({
    method: 'GET',
    path: '/health',
    summary: 'Health check',
    tags: ['System'],
    responses: {
      200: {
        description: 'OK',
        schema: v.object({
          status: v.string(),
          timestamp: v.string(),
        }),
      },
    },
  }),
};
