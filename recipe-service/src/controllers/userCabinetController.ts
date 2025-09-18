import { Response } from "express";
import { AppDataSource } from "../config/database";
import { UserRecipe } from "../models/UserRecipe";
import { AuthRequest } from "../middleware/middleware";
import { Recipe } from "../models/Recipe";

const userRecipeRepository = AppDataSource.getRepository(UserRecipe);
const recipeRepository = AppDataSource.getRepository(Recipe);

export const getUserCabinet = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const authoredRecipes = await userRecipeRepository.find({
      where: { userId, isAuthor: true },
      relations: ["recipe"],
    });

    const savedRecipes = await userRecipeRepository.find({
      where: { userId, isAuthor: false },
      relations: ["recipe"],
    });

    res.json({
      authoredRecipes: authoredRecipes.map(r => r.recipe),
      savedRecipes: savedRecipes.map(r => r.recipe),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const addRecipeToFavorites = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "User not authenticated" });
    const userId = req.user.id;
    const { recipeId } = req.body;

    if (!recipeId) return res.status(400).json({ message: "recipeId is required" });

    const recipe = await recipeRepository.findOneBy({ id: recipeId });
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    const existing = await userRecipeRepository.findOne({
      where: { userId, recipe: { id: recipeId } },
    });

    if (existing) return res.status(400).json({ message: "Recipe already in favorites" });

    const userRecipe = userRecipeRepository.create({
      userId,
      recipe,
      isAuthor: false,
    });

    const saved = await userRecipeRepository.save(userRecipe);
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const removeRecipeFromFavorites = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "User not authenticated" });
    const userId = req.user.id;
    const { recipeId } = req.body;

    if (!recipeId) return res.status(400).json({ message: "recipeId is required" });

    const result = await userRecipeRepository.delete({
      userId,
      recipe: { id: recipeId },
      isAuthor: false,
    });

    if (!result.affected) return res.status(404).json({ message: "Recipe not found in favorites" });

    res.json({ deleted: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @swagger
 * /cabinet/me:
 *   get:
 *     summary: Получить личный кабинет пользователя
 *     description: Возвращает рецепты, созданные пользователем, и рецепты, добавленные в избранное.
 *     tags: [User Cabinet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Личный кабинет пользователя
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 authoredRecipes:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Recipe'
 *                 savedRecipes:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Recipe'
 *       401:
 *         description: Требуется авторизация
 *       500:
 *         description: Ошибка сервера
 */


/**
 * @swagger
 * /cabinet/favorites:
 *   post:
 *     summary: Добавить рецепт в избранное
 *     tags: [User Cabinet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               recipeId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Рецепт добавлен в избранное
 *       400:
 *         description: recipeId отсутствует или рецепт уже добавлен
 *       404:
 *         description: Пользователь или рецепт не найдены
 *       500:
 *         description: Ошибка сервера
 */


/**
 * @swagger
 * /cabinet/favorites:
 *   delete:
 *     summary: Удалить рецепт из избранного
 *     tags: [User Cabinet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               recipeId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Рецепт удален из избранного
 *       400:
 *         description: recipeId отсутствует
 *       404:
 *         description: Пользователь не найден или рецепт отсутствует в избранном
 *       500:
 *         description: Ошибка сервера
 */
