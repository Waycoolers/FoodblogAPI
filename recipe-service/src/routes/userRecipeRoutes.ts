import { Router } from "express";
import {
  saveUserRecipe,
  getUserRecipes,
  getUserRecipeById,
  getUserRecipesByUserId,
  getUserRecipesByRecipeId,
  deleteUserRecipe,
  getSavedRecipesCountByUser,
  getUsersCountByRecipe,
  getAuthoredRecipesByUserId
} from "../controllers/userRecipeController";

const router = Router();

router.post("/", saveUserRecipe);
router.get("/", getUserRecipes);

router.get("/user/:userId/authored", getAuthoredRecipesByUserId);
router.get("/user/:userId", getUserRecipesByUserId);
router.get("/recipe/:recipeId", getUserRecipesByRecipeId);
router.get("/count/user/:userId", getSavedRecipesCountByUser);
router.get("/count/recipe/:recipeId", getUsersCountByRecipe);

router.get("/:id", getUserRecipeById);
router.delete("/:id", deleteUserRecipe);


export default router;