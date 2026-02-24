import { Router } from 'express';
import ideasRouter from './ideas.routes';
import categoriesRouter from './categories.routes';
import commentsRouter from './comments.routes';

const router = Router();

router.use('/ideas', ideasRouter);
router.use('/categories', categoriesRouter);
router.use('/comments', commentsRouter);

export default router;
