import { Request, Response, NextFunction } from 'express';
import * as v from 'valibot';

export function validate<T extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>>(schema: T) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = v.safeParse(schema, req.body);
    if (!result.success) {
      const errors = v.flatten(result.issues);
      res.status(400).json({ success: false, error: 'Validation failed', details: errors });
      return;
    }
    req.body = result.output;
    next();
  };
}
