import { Request, Response, NextFunction } from "express";

export interface AuthRequest extends Request {
  user?: { id: number; username: string };
}

export const extractUserFromHeaders = (req: AuthRequest, _res: Response, next: NextFunction) => {
  const userId = req.header("x-user-id");
  const username = req.header("x-user-name");

  if (userId && username) {
    req.user = {
      id: parseInt(userId, 10),
      username,
    };
  }

  next();
};
