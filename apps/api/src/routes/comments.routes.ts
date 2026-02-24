import { Router, Request, Response } from 'express';
import { db } from '../db';
import { comments, ideas } from '../db/schema';
import { eq, sql } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.delete('/:id', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const currentUser = (req as any).user;

    const comment = await db.select().from(comments).where(eq(comments.id, id)).limit(1);
    if (!comment.length) {
      res.status(404).json({ success: false, error: 'Comment not found' });
      return;
    }

    if (comment[0].authorId !== currentUser.id) {
      res.status(403).json({ success: false, error: 'Forbidden' });
      return;
    }

    await db.delete(comments).where(eq(comments.id, id));

    // Decrement comment count
    await db
      .update(ideas)
      .set({ commentCount: sql`${ideas.commentCount} - 1` })
      .where(eq(ideas.id, comment[0].ideaId));

    res.json({ success: true, message: 'Comment deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to delete comment' });
  }
});

export default router;
