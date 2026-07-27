import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

type ValidateTarget = 'body' | 'query' | 'params';

/**
 * Factory middleware that validates an Express request against a Zod schema.
 * Mutates the request property with parsed (coerced) values.
 */
export function validate(schema: ZodSchema, target: ValidateTarget = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const formatted = result.error.flatten();
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: formatted.fieldErrors,
      });
      return;
    }

    req[target] = result.data;
    next();
  };
}
