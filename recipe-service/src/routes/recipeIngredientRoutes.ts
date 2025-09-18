import { Router } from "express";
import {
  addRecipeIngredient,
  getRecipeIngredients,
  getIngredientsByRecipe,
  updateRecipeIngredient,
  deleteRecipeIngredient,
} from "../controllers/recipeIngredientController";

const router = Router();

router.post("/", addRecipeIngredient);
router.get("/", getRecipeIngredients);
router.get("/recipe/:recipeId", getIngredientsByRecipe); // все ингредиенты рецепта
router.put("/:id", updateRecipeIngredient);
router.delete("/:id", deleteRecipeIngredient);

export default router;
