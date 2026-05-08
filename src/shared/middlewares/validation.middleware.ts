import { z } from "zod";
import { Request, Response, NextFunction } from "express";
import { ValidationError } from "src/shared/errors/app-error";
export function validate(schema: z.ZodObject<z.ZodRawShape>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      const fields: Record<string, string[]> = {};
      for (const issue of result.error.issues) {
        // Strip "body.", "query.", "params." prefix for cleaner client messages
        const path = issue.path.slice(1).join(".");
        if (!fields[path]) {
          fields[path] = [];
        }
        fields[path].push(issue.message);
      }
      return next(new ValidationError("Validation failed", fields));
    }

    // Attach validated+coerced body back to req so controller sees clean data
    if (result.data.body) {
      req.body = result.data.body;
    }
    next();
  };
}
