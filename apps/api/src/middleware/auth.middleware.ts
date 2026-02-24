import { Request, Response, NextFunction } from 'express';
import { auth } from '../lib/auth';

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const session = await auth.api.getSession({ headers: req.headers as any });
    if (!session?.user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }
    (req as any).user = session.user;
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Unauthorized' });
  }
}

export async function optionalAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const session = await auth.api.getSession({ headers: req.headers as any });
    if (session?.user) {
      (req as any).user = session.user;
    }
  } catch {
    // ignore
  }
  next();
}
