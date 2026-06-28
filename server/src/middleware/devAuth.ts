import type { Request, Response, NextFunction } from "express";

// TODO: replace entirely with real Cognito JWT verification later
export function devAuth(req: Request, res: Response, next: NextFunction) {
  const devUserId = process.env.DEV_USER_ID;
  if (!devUserId) {
    return res.status(500).json({ error: "DEV_USER_ID not set in .env" });
  }
  req.userId = devUserId;
  next();
}