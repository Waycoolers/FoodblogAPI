import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { UserRecipe } from "../models/UserRecipe";
import { Recipe } from "../models/Recipe";
import { AuthRequest } from "../middleware/middleware";

const userRecipeRepository = AppDataSource.getRepository(UserRecipe);
const recipeRepository = AppDataSource.getRepository(Recipe);

export const saveUserRecipe = async (req: AuthRequest, res: Response) => {
  try {
    const { recipeId, isAuthor } = req.body;

    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (!recipeId) return res.status(400).json({ message: "recipeId is required" });

    const recipe = await recipeRepository.findOneBy({ id: parseInt(recipeId, 10) });
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    const existing = await userRecipeRepository.findOne({
      where: { userId: req.user.id, recipe: { id: recipe.id } },
    });
    if (existing) return res.status(400).json({ message: "This recipe is already saved by user" });

    const newUserRecipe = userRecipeRepository.create({
      userId: req.user.id,
      recipe,
      isAuthor: isAuthor ?? false,
    });

    const saved = await userRecipeRepository.save(newUserRecipe);

    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserRecipes = async (_req: Request, res: Response) => {
  try {
    const userRecipes = await userRecipeRepository.find({ relations: ["recipe"] });
    res.json(userRecipes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserRecipeById = async (req: Request, res: Response) => {
  try {
    const userRecipe = await userRecipeRepository.findOne({
      where: { id: parseInt(req.params.id, 10) },
      relations: ["recipe"],
    });
    if (!userRecipe) return res.status(404).json({ message: "User-Recipe relation not found" });
    res.json(userRecipe);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserRecipesByUserId = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const userRecipes = await userRecipeRepository.find({
      where: { userId },
      relations: ["recipe"],
    });
    res.json(userRecipes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserRecipesByRecipeId = async (req: Request, res: Response) => {
  try {
    const recipeId = parseInt(req.params.recipeId, 10);
    const userRecipes = await userRecipeRepository.find({
      where: { recipe: { id: recipeId } },
    });
    res.json(userRecipes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteUserRecipe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const userRecipe = await userRecipeRepository.findOne({
      where: { id: parseInt(req.params.id, 10) },
    });
    if (!userRecipe) return res.status(404).json({ message: "User-Recipe relation not found" });

    if (userRecipe.userId !== req.user.id) {
      return res.status(403).json({ message: "You can only delete your own saved recipes" });
    }

    await userRecipeRepository.remove(userRecipe);
    res.json({ deleted: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getSavedRecipesCountByUser = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const count = await userRecipeRepository.count({
      where: { userId, isAuthor: false },
    });
    res.json({ count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUsersCountByRecipe = async (req: Request, res: Response) => {
  try {
    const recipeId = parseInt(req.params.recipeId, 10);
    const count = await userRecipeRepository.count({
      where: { recipe: { id: recipeId }, isAuthor: false },
    });
    res.json({ count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAuthoredRecipesByUserId = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const authoredRecipes = await userRecipeRepository.find({
      where: { userId, isAuthor: true },
      relations: ["recipe"],
    });

    res.json(authoredRecipes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


/**
 * @swagger
 * /ur/user/{userId}/authored:
 *   get:
 *     summary: Получить рецепты, созданные пользователем
 *     tags: [UserRecipes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID пользователя
 *     responses:
 *       200:
 *         description: Авторские рецепты пользователя
 */


/**
 * @swagger
 * /ur/user/{userId}:
 *   get:
 *     summary: Получить все рецепты, сохранённые пользователем
 *     tags: [UserRecipes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Список рецептов
 */


/**
 * @swagger
 * /ur/recipe/{recipeId}:
 *   get:
 *     summary: Получить всех пользователей, сохранивших рецепт
 *     tags: [UserRecipes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: recipeId
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Список пользователей
 */


/**
 * @swagger
 * /ur/count/user/{userId}:
 *   get:
 *     summary: Получить количество сохранённых рецептов пользователя
 *     tags: [UserRecipes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Количество рецептов
 */


/**
 * @swagger
 * /ur/count/recipe/{recipeId}:
 *   get:
 *     summary: Получить количество пользователей, сохранивших рецепт
 *     tags: [UserRecipes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: recipeId
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Количество пользователей
 */
