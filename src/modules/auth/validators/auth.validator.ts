import { z } from "zod";

// ─── Reusable field schemas ───────────────────────────────────────────────────

const emailSchema = z
  .string({ error: "Email is required" })
  .email("Must be a valid email address")
  .toLowerCase()
  .trim();

const passwordSchema = z
  .string({ error: "Password is required" })
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must not exceed 128 characters")
  // Require at least one uppercase, one lowercase, one digit
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

const nameSchema = z
  .string({ error: "Name is required" })
  .min(2, "Name must be at least 2 characters")
  .max(100, "Name must not exceed 100 characters")
  .trim();

// ─── Request schemas ──────────────────────────────────────────────────────────

export const registerSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: passwordSchema,
    name: nameSchema,
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: z.string({ error: "Password is required" }),
    // Don't validate password format on login — just check credentials
  }),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string({ error: "Refresh token is required" }).min(1),
  }),
});

export const logoutSchema = z.object({
  body: z.object({
    refreshToken: z.string({ error: "Refresh token is required" }).min(1),
  }),
});

// ─── Inferred input types ─────────────────────────────────────────────────────

export type RegisterBody = z.infer<typeof registerSchema>["body"];
export type LoginBody = z.infer<typeof loginSchema>["body"];
export type RefreshBody = z.infer<typeof refreshSchema>["body"];
export type LogoutBody = z.infer<typeof logoutSchema>["body"];

// ─── Validation middleware factory ────────────────────────────────────────────

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
