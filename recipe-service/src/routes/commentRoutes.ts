import { Router } from "express";
import {
  createComment,
  getComments,
  getCommentById,
  getCommentsByRecipeId,
  getCommentsByUserId,
  updateComment,
  likeComment,
  unlikeComment,
  deleteComment,
  getCommentCountByRecipe
} from "../controllers/commentController";

const router = Router();

router.post("/", createComment);
router.get("/", getComments);

router.get("/recipe/:recipeId", getCommentsByRecipeId);
router.get("/user/:userId", getCommentsByUserId);
router.get("/count/recipe/:recipeId", getCommentCountByRecipe);
router.put("/:id/like", likeComment);
router.put("/:id/unlike", unlikeComment);

router.get("/:id", getCommentById);
router.put("/:id", updateComment);
router.delete("/:id", deleteComment);

export default router;