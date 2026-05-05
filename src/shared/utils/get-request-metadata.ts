import { Request } from "express";
export function getRequestMetadata(req: Request) {
  return {
    ipAddress: req.ip ?? req.socket.remoteAddress ?? null,
    userAgent: req.headers["user-agent"] ?? null,
  };
}
