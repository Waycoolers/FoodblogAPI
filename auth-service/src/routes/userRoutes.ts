import { Router } from "express";
import {
  getUsers,
  getCurrentUser,
  updateCurrentUser,
  deleteCurrentUser,
  getUserById,
} from "../controllers/userController";
import { authenticate, AuthRequest } from "../middleware/authMiddleware";

const router = Router();

router.get("/", authenticate, getUsers);

router.get("/me", authenticate, (req: AuthRequest, res) => {
  req.params.id = String(req.user!.id);
  return getCurrentUser(req, res);
});

router.put("/me", authenticate, (req: AuthRequest, res) => {
  req.params.id = String(req.user!.id);
  return updateCurrentUser(req, res);
});

router.delete("/me", authenticate, (req: AuthRequest, res) => {
  req.params.id = String(req.user!.id);
  return deleteCurrentUser(req, res);
});

router.get("/:id", getUserById);

export default router;
