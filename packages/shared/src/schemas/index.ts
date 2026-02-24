import * as v from 'valibot';

export const CreateIdeaSchema = v.object({
  title: v.pipe(
    v.string(),
    v.minLength(3, 'Title must be at least 3 characters'),
    v.maxLength(100, 'Title must be at most 100 characters')
  ),
  shortDescription: v.pipe(
    v.string(),
    v.minLength(10, 'Short description must be at least 10 characters'),
    v.maxLength(200, 'Short description must be at most 200 characters')
  ),
  fullDescription: v.pipe(
    v.string(),
    v.minLength(20, 'Full description must be at least 20 characters')
  ),
  categoryId: v.pipe(v.string(), v.minLength(1, 'Category is required')),
  status: v.optional(v.picklist(['draft', 'published']), 'published'),
});

export const UpdateIdeaSchema = v.partial(CreateIdeaSchema);

export const CreateCommentSchema = v.object({
  content: v.pipe(
    v.string(),
    v.minLength(1, 'Comment cannot be empty'),
    v.maxLength(1000, 'Comment must be at most 1000 characters')
  ),
});

export const RegisterSchema = v.object({
  name: v.pipe(v.string(), v.minLength(2, 'Name must be at least 2 characters')),
  email: v.pipe(v.string(), v.email('Invalid email address')),
  password: v.pipe(v.string(), v.minLength(8, 'Password must be at least 8 characters')),
});

export const LoginSchema = v.object({
  email: v.pipe(v.string(), v.email('Invalid email address')),
  password: v.pipe(v.string(), v.minLength(1, 'Password is required')),
  rememberMe: v.optional(v.boolean(), false),
});

export type CreateIdeaInput = v.InferInput<typeof CreateIdeaSchema>;
export type UpdateIdeaInput = v.InferInput<typeof UpdateIdeaSchema>;
export type CreateCommentInput = v.InferInput<typeof CreateCommentSchema>;
export type RegisterInput = v.InferInput<typeof RegisterSchema>;
export type LoginInput = v.InferInput<typeof LoginSchema>;
