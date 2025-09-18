import axios from "axios";
import { Request, Response, NextFunction } from "express";

export interface AuthRequest extends Request {
  user?: { id: number; username: string };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "No token" });
  }

  try {
    const response = await axios.get(`http://${process.env.AUTH_SERVICE_HOST}/auth/verify`, {
      headers: { Authorization: authHeader }
    });

    req.user = {
      id: parseInt(response.headers["x-user-id"], 10),
      username: response.headers["x-user-name"],
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
