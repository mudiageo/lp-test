import { Router, Request, Response } from 'express';
import { db } from '../db';
import { categories, ideas } from '../db/schema';
import { eq, sql } from 'drizzle-orm';

const router = Router();

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        description: categories.description,
        color: categories.color,
        ideaCount: sql<number>`cast(count(${ideas.id}) as int)`,
      })
      .from(categories)
      .leftJoin(ideas, eq(ideas.categoryId, categories.id))
      .groupBy(categories.id);

    res.json({ success: true, data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch categories' });
  }
});

router.get('/:slug', async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const result = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        description: categories.description,
        color: categories.color,
        ideaCount: sql<number>`cast(count(${ideas.id}) as int)`,
      })
      .from(categories)
      .leftJoin(ideas, eq(ideas.categoryId, categories.id))
      .where(eq(categories.slug, slug))
      .groupBy(categories.id);

    if (!result.length) {
      res.status(404).json({ success: false, error: 'Category not found' });
      return;
    }

    res.json({ success: true, data: result[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch category' });
  }
});

export default router;
