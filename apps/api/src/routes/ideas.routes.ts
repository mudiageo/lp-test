import { Router, Request, Response } from 'express';
import { db } from '../db';
import { ideas, categories, votes, comments, user } from '../db/schema';
import { eq, and, sql, ilike, desc, asc, inArray } from 'drizzle-orm';
import { requireAuth, optionalAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { CreateIdeaSchema, UpdateIdeaSchema, CreateCommentSchema } from '@lp/shared';
import { randomUUID } from 'crypto';

const router = Router();

// GET /ideas - List published ideas
router.get('/', optionalAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      categoryId,
      sort = 'newest',
      search,
      page = '1',
      pageSize = '10',
    } = req.query as Record<string, string>;
    const currentUser = (req as any).user;

    const pageNum = Math.max(1, parseInt(page));
    const pageSizeNum = Math.min(50, Math.max(1, parseInt(pageSize)));
    const offset = (pageNum - 1) * pageSizeNum;

    const conditions = [eq(ideas.status, 'published')];
    if (categoryId) conditions.push(eq(ideas.categoryId, categoryId));
    if (search) conditions.push(ilike(ideas.title, `%${search}%`));

    let orderBy;
    switch (sort) {
      case 'oldest': orderBy = asc(ideas.createdAt); break;
      case 'most_voted': orderBy = desc(ideas.voteCount); break;
      case 'most_commented': orderBy = desc(ideas.commentCount); break;
      default: orderBy = desc(ideas.createdAt);
    }

    const [totalResult, rows] = await Promise.all([
      db.select({ count: sql<number>`cast(count(*) as int)` }).from(ideas).where(and(...conditions)),
      db
        .select({
          id: ideas.id,
          title: ideas.title,
          shortDescription: ideas.shortDescription,
          fullDescription: ideas.fullDescription,
          status: ideas.status,
          categoryId: ideas.categoryId,
          authorId: ideas.authorId,
          voteCount: ideas.voteCount,
          commentCount: ideas.commentCount,
          createdAt: ideas.createdAt,
          updatedAt: ideas.updatedAt,
          category: {
            id: categories.id,
            name: categories.name,
            slug: categories.slug,
            description: categories.description,
            color: categories.color,
          },
          author: {
            id: user.id,
            name: user.name,
            image: user.image,
          },
        })
        .from(ideas)
        .leftJoin(categories, eq(ideas.categoryId, categories.id))
        .leftJoin(user, eq(ideas.authorId, user.id))
        .where(and(...conditions))
        .orderBy(orderBy)
        .limit(pageSizeNum)
        .offset(offset),
    ]);

    const total = totalResult[0]?.count ?? 0;

    let ideaList: any[] = rows;

    if (currentUser) {
      const ideaIds = rows.map((r) => r.id);
      if (ideaIds.length > 0) {
        const userVotes = await db
          .select({ ideaId: votes.ideaId })
          .from(votes)
          .where(and(eq(votes.userId, currentUser.id), inArray(votes.ideaId, ideaIds)));
        const votedSet = new Set(userVotes.map((v) => v.ideaId));
        ideaList = rows.map((r) => ({ ...r, hasVoted: votedSet.has(r.id) }));
      }
    }

    res.json({
      success: true,
      data: {
        data: ideaList,
        total,
        page: pageNum,
        pageSize: pageSizeNum,
        totalPages: Math.ceil(total / pageSizeNum),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch ideas' });
  }
});

// GET /ideas/trending
router.get('/trending', optionalAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { period = 'week', categoryId } = req.query as Record<string, string>;
    const currentUser = (req as any).user;

    const now = new Date();
    let since: Date | null = null;
    if (period === 'today') since = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    else if (period === 'week') since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    else if (period === 'month') since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const conditions = [eq(ideas.status, 'published')];
    if (since) conditions.push(sql`${ideas.createdAt} >= ${since.toISOString()}`);
    if (categoryId) conditions.push(eq(ideas.categoryId, categoryId));

    const rows = await db
      .select({
        id: ideas.id,
        title: ideas.title,
        shortDescription: ideas.shortDescription,
        fullDescription: ideas.fullDescription,
        status: ideas.status,
        categoryId: ideas.categoryId,
        authorId: ideas.authorId,
        voteCount: ideas.voteCount,
        commentCount: ideas.commentCount,
        createdAt: ideas.createdAt,
        updatedAt: ideas.updatedAt,
        score: sql<number>`${ideas.voteCount} + ${ideas.commentCount} * 0.5`,
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          description: categories.description,
          color: categories.color,
        },
        author: {
          id: user.id,
          name: user.name,
          image: user.image,
        },
      })
      .from(ideas)
      .leftJoin(categories, eq(ideas.categoryId, categories.id))
      .leftJoin(user, eq(ideas.authorId, user.id))
      .where(and(...conditions))
      .orderBy(desc(sql`${ideas.voteCount} + ${ideas.commentCount} * 0.5`))
      .limit(20);

    let ideaList: any[] = rows;
    if (currentUser && rows.length > 0) {
      const ideaIds = rows.map((r) => r.id);
      const userVotes = await db
        .select({ ideaId: votes.ideaId })
        .from(votes)
        .where(and(eq(votes.userId, currentUser.id), inArray(votes.ideaId, ideaIds)));
      const votedSet = new Set(userVotes.map((v) => v.ideaId));
      ideaList = rows.map((r) => ({ ...r, hasVoted: votedSet.has(r.id) }));
    }

    res.json({ success: true, data: ideaList });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch trending ideas' });
  }
});

// GET /ideas/my
router.get('/my', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const currentUser = (req as any).user;

    const rows = await db
      .select({
        id: ideas.id,
        title: ideas.title,
        shortDescription: ideas.shortDescription,
        fullDescription: ideas.fullDescription,
        status: ideas.status,
        categoryId: ideas.categoryId,
        authorId: ideas.authorId,
        voteCount: ideas.voteCount,
        commentCount: ideas.commentCount,
        createdAt: ideas.createdAt,
        updatedAt: ideas.updatedAt,
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          description: categories.description,
          color: categories.color,
        },
      })
      .from(ideas)
      .leftJoin(categories, eq(ideas.categoryId, categories.id))
      .where(eq(ideas.authorId, currentUser.id))
      .orderBy(desc(ideas.createdAt));

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch ideas' });
  }
});

// POST /ideas - Create idea
router.post('/', requireAuth, validate(CreateIdeaSchema), async (req: Request, res: Response): Promise<void> => {
  try {
    const currentUser = (req as any).user;
    const { title, shortDescription, fullDescription, categoryId, status } = req.body;

    const id = randomUUID();
    await db.insert(ideas).values({
      id,
      title,
      shortDescription,
      fullDescription,
      categoryId,
      status: status || 'published',
      authorId: currentUser.id,
    });

    const [idea] = await db
      .select({
        id: ideas.id,
        title: ideas.title,
        shortDescription: ideas.shortDescription,
        fullDescription: ideas.fullDescription,
        status: ideas.status,
        categoryId: ideas.categoryId,
        authorId: ideas.authorId,
        voteCount: ideas.voteCount,
        commentCount: ideas.commentCount,
        createdAt: ideas.createdAt,
        updatedAt: ideas.updatedAt,
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          description: categories.description,
          color: categories.color,
        },
      })
      .from(ideas)
      .leftJoin(categories, eq(ideas.categoryId, categories.id))
      .where(eq(ideas.id, id));

    res.status(201).json({ success: true, data: idea });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to create idea' });
  }
});

// GET /ideas/:id
router.get('/:id', optionalAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const currentUser = (req as any).user;

    const [idea] = await db
      .select({
        id: ideas.id,
        title: ideas.title,
        shortDescription: ideas.shortDescription,
        fullDescription: ideas.fullDescription,
        status: ideas.status,
        categoryId: ideas.categoryId,
        authorId: ideas.authorId,
        voteCount: ideas.voteCount,
        commentCount: ideas.commentCount,
        createdAt: ideas.createdAt,
        updatedAt: ideas.updatedAt,
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          description: categories.description,
          color: categories.color,
        },
        author: {
          id: user.id,
          name: user.name,
          image: user.image,
        },
      })
      .from(ideas)
      .leftJoin(categories, eq(ideas.categoryId, categories.id))
      .leftJoin(user, eq(ideas.authorId, user.id))
      .where(eq(ideas.id, id));

    if (!idea) {
      res.status(404).json({ success: false, error: 'Idea not found' });
      return;
    }

    let hasVoted = false;
    if (currentUser) {
      const vote = await db
        .select()
        .from(votes)
        .where(and(eq(votes.ideaId, id), eq(votes.userId, currentUser.id)))
        .limit(1);
      hasVoted = vote.length > 0;
    }

    res.json({ success: true, data: { ...idea, hasVoted } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch idea' });
  }
});

// PUT /ideas/:id
router.put('/:id', requireAuth, validate(UpdateIdeaSchema), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const currentUser = (req as any).user;

    const [idea] = await db.select().from(ideas).where(eq(ideas.id, id)).limit(1);
    if (!idea) {
      res.status(404).json({ success: false, error: 'Idea not found' });
      return;
    }

    if (idea.authorId !== currentUser.id) {
      res.status(403).json({ success: false, error: 'Forbidden' });
      return;
    }

    await db
      .update(ideas)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(ideas.id, id));

    const [updated] = await db
      .select({
        id: ideas.id,
        title: ideas.title,
        shortDescription: ideas.shortDescription,
        fullDescription: ideas.fullDescription,
        status: ideas.status,
        categoryId: ideas.categoryId,
        authorId: ideas.authorId,
        voteCount: ideas.voteCount,
        commentCount: ideas.commentCount,
        createdAt: ideas.createdAt,
        updatedAt: ideas.updatedAt,
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          description: categories.description,
          color: categories.color,
        },
      })
      .from(ideas)
      .leftJoin(categories, eq(ideas.categoryId, categories.id))
      .where(eq(ideas.id, id));

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to update idea' });
  }
});

// DELETE /ideas/:id
router.delete('/:id', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const currentUser = (req as any).user;

    const [idea] = await db.select().from(ideas).where(eq(ideas.id, id)).limit(1);
    if (!idea) {
      res.status(404).json({ success: false, error: 'Idea not found' });
      return;
    }

    if (idea.authorId !== currentUser.id) {
      res.status(403).json({ success: false, error: 'Forbidden' });
      return;
    }

    await db.delete(ideas).where(eq(ideas.id, id));
    res.json({ success: true, message: 'Idea deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to delete idea' });
  }
});

// POST /ideas/:id/vote - Toggle vote
router.post('/:id/vote', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const currentUser = (req as any).user;

    const [idea] = await db.select().from(ideas).where(eq(ideas.id, id)).limit(1);
    if (!idea) {
      res.status(404).json({ success: false, error: 'Idea not found' });
      return;
    }

    const existing = await db
      .select()
      .from(votes)
      .where(and(eq(votes.ideaId, id), eq(votes.userId, currentUser.id)))
      .limit(1);

    if (existing.length > 0) {
      // Remove vote
      await db.delete(votes).where(and(eq(votes.ideaId, id), eq(votes.userId, currentUser.id)));
      await db
        .update(ideas)
        .set({ voteCount: sql`${ideas.voteCount} - 1` })
        .where(eq(ideas.id, id));
      res.json({ success: true, data: { hasVoted: false, voteCount: idea.voteCount - 1 } });
    } else {
      // Add vote
      await db.insert(votes).values({ id: randomUUID(), ideaId: id, userId: currentUser.id });
      await db
        .update(ideas)
        .set({ voteCount: sql`${ideas.voteCount} + 1` })
        .where(eq(ideas.id, id));
      res.json({ success: true, data: { hasVoted: true, voteCount: idea.voteCount + 1 } });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to toggle vote' });
  }
});

// GET /ideas/:id/comments
router.get('/:id/comments', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const rows = await db
      .select({
        id: comments.id,
        content: comments.content,
        ideaId: comments.ideaId,
        authorId: comments.authorId,
        createdAt: comments.createdAt,
        updatedAt: comments.updatedAt,
        author: {
          id: user.id,
          name: user.name,
          image: user.image,
        },
      })
      .from(comments)
      .leftJoin(user, eq(comments.authorId, user.id))
      .where(eq(comments.ideaId, id))
      .orderBy(asc(comments.createdAt));

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch comments' });
  }
});

// POST /ideas/:id/comments
router.post('/:id/comments', requireAuth, validate(CreateCommentSchema), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const currentUser = (req as any).user;
    const { content } = req.body;

    const [idea] = await db.select().from(ideas).where(eq(ideas.id, id)).limit(1);
    if (!idea) {
      res.status(404).json({ success: false, error: 'Idea not found' });
      return;
    }

    const commentId = randomUUID();
    await db.insert(comments).values({
      id: commentId,
      content,
      ideaId: id,
      authorId: currentUser.id,
    });

    await db
      .update(ideas)
      .set({ commentCount: sql`${ideas.commentCount} + 1` })
      .where(eq(ideas.id, id));

    const [comment] = await db
      .select({
        id: comments.id,
        content: comments.content,
        ideaId: comments.ideaId,
        authorId: comments.authorId,
        createdAt: comments.createdAt,
        updatedAt: comments.updatedAt,
        author: {
          id: user.id,
          name: user.name,
          image: user.image,
        },
      })
      .from(comments)
      .leftJoin(user, eq(comments.authorId, user.id))
      .where(eq(comments.id, commentId));

    res.status(201).json({ success: true, data: comment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to create comment' });
  }
});

export default router;
