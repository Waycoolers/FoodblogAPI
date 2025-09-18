import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { RecipeCategory } from "../models/RecipeCategory";
import { Recipe } from "../models/Recipe";
import { Category } from "../models/Category";

const recipeCategoryRepository = AppDataSource.getRepository(RecipeCategory);
const recipeRepository = AppDataSource.getRepository(Recipe);
const categoryRepository = AppDataSource.getRepository(Category);

export const addRecipeCategory = async (req: Request, res: Response) => {
  try {
    const { recipeId, categoryId } = req.body;

    const recipe = await recipeRepository.findOneBy({ id: recipeId });
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    const category = await categoryRepository.findOneBy({ id: categoryId });
    if (!category) return res.status(404).json({ message: "Category not found" });

    const recipeCategory = recipeCategoryRepository.create({ recipe, category });
    const saved = await recipeCategoryRepository.save(recipeCategory);

    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getRecipeCategories = async (_req: Request, res: Response) => {
  const list = await recipeCategoryRepository.find({
    relations: ["recipe", "category"],
  });
  res.json(list);
};

// все категории рецепта
export const getCategoriesByRecipe = async (req: Request, res: Response) => {
  const { recipeId } = req.params;
  const list = await recipeCategoryRepository.find({
    where: { recipe: { id: +recipeId } },
    relations: ["category"],
  });
  res.json(list.map(rc => rc.category));
};

// все рецепты категории
export const getRecipesByCategory = async (req: Request, res: Response) => {
  const { categoryId } = req.params;
  const list = await recipeCategoryRepository.find({
    where: { category: { id: +categoryId } },
    relations: ["recipe"],
  });
  res.json(list.map(rc => rc.recipe));
};

export const deleteRecipeCategory = async (req: Request, res: Response) => {
  const { id } = req.params;

  const rc = await recipeCategoryRepository.findOneBy({ id: +id });
  if (!rc) return res.status(404).json({ message: "Relation not found" });

  await recipeCategoryRepository.remove(rc);
  res.json({ message: "Relation deleted" });
};
