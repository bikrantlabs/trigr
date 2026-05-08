import { Request } from "express";
export function getRequestMetadata<
  P = object,
  ResBody = object,
  ReqBody = object,
  ReqQuery = object,
>(req: Request<P, ResBody, ReqBody, ReqQuery>) {
  return {
    ipAddress: req.ip ?? req.socket.remoteAddress ?? null,
    userAgent: req.headers["user-agent"] ?? null,
  };
}
