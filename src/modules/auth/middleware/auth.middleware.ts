/* eslint-disable @typescript-eslint/consistent-type-definitions */

import { Request, Response, NextFunction } from "express";
import { AccessTokenPayload } from "../auth.types";
import { UnauthorizedError } from "src/shared/errors/app-error";
import { logger } from "src/shared/logger";
import { tokenService } from "../container";

declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
    }
  }
}

export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return next(new UnauthorizedError("No token provided"));
  }

  logger.info({ authHeader }, "MIDDLEWARE");

  const token = authHeader.slice(7); // Strip "Bearer "

  try {
    const payload = tokenService.verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (err) {
    next(err); // TokenExpiredError or InvalidTokenError — caught by error-handler
  }
}
