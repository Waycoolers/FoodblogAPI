import { Router } from "express";
import {
  addRecipeCategory,
  getRecipeCategories,
  getCategoriesByRecipe,
  getRecipesByCategory,
  deleteRecipeCategory,
} from "../controllers/recipeCategoryController";

const router = Router();

router.post("/", addRecipeCategory);
router.get("/", getRecipeCategories);
router.get("/recipe/:recipeId", getCategoriesByRecipe); // все категории рецепта
router.get("/category/:categoryId", getRecipesByCategory); // все рецепты категории
router.delete("/:id", deleteRecipeCategory);

export default router;
