import { Response } from "express";
import { AppDataSource } from "../config/database";
import { Comment } from "../models/Comment";
import { Recipe } from "../models/Recipe";
import { AuthRequest } from "../middleware/middleware";

const commentRepository = AppDataSource.getRepository(Comment);
const recipeRepository = AppDataSource.getRepository(Recipe);

export const createComment = async (req: AuthRequest, res: Response) => {
  try {
    const { text, recipeId } = req.body;
    if (!text || !recipeId) return res.status(400).json({ message: "text and recipeId are required" });

    const recipe = await recipeRepository.findOneBy({ id: parseInt(recipeId) });
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    const newComment = commentRepository.create({
      text,
      userId: req.user!.id,
      recipe,
      likes: 0,
      date: new Date(),
    });

    await commentRepository.save(newComment);

    const savedComment = await commentRepository.findOne({
      where: { id: newComment.id },
      relations: ["recipe"],
    });

    res.status(201).json(savedComment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getComments = async (_req: AuthRequest, res: Response) => {
  try {
    const comments = await commentRepository.find({
      order: { date: "DESC" },
    });
    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getCommentById = async (req: AuthRequest, res: Response) => {
  try {
    const comment = await commentRepository.findOneBy({ id: parseInt(req.params.id) });
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    res.json(comment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getCommentsByRecipeId = async (req: AuthRequest, res: Response) => {
  try {
    const comments = await commentRepository.find({
      where: { recipe: { id: parseInt(req.params.recipeId) } },
      order: { date: "DESC" },
    });
    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getCommentsByUserId = async (req: AuthRequest, res: Response) => {
  try {
    const comments = await commentRepository.find({
      where: { userId: parseInt(req.params.userId) },
      order: { date: "DESC" },
    });
    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateComment = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid comment id" });

    const comment = await commentRepository.findOneBy({ id });
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.userId !== req.user!.id) {
      return res.status(403).json({ message: "You can only update your own comments" });
    }

    comment.text = req.body.text ?? comment.text;
    await commentRepository.save(comment);

    const updatedComment = await commentRepository.findOneBy({ id });
    res.json(updatedComment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const likeComment = async (req: AuthRequest, res: Response) => {
  try {
    const comment = await commentRepository.findOneBy({ id: parseInt(req.params.id) });
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    comment.likes += 1;
    await commentRepository.save(comment);
    res.json(comment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const unlikeComment = async (req: AuthRequest, res: Response) => {
  try {
    const comment = await commentRepository.findOneBy({ id: parseInt(req.params.id) });
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    comment.likes = Math.max(0, comment.likes - 1);
    await commentRepository.save(comment);
    res.json(comment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteComment = async (req: AuthRequest, res: Response) => {
  try {
    const comment = await commentRepository.findOneBy({ id: parseInt(req.params.id) });
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.userId !== req.user!.id) return res.status(403).json({ message: "You can only delete your own comments" });

    await commentRepository.remove(comment);
    res.json({ deleted: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getCommentCountByRecipe = async (req: AuthRequest, res: Response) => {
  try {
    const count = await commentRepository.count({
      where: { recipe: { id: parseInt(req.params.recipeId) } },
    });
    res.json({ count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @swagger
 * /comments:
 *   post:
 *     summary: Создание нового комментария
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *               - recipeId
 *             properties:
 *               text:
 *                 type: string
 *                 example: "Очень вкусный рецепт!"
 *               recipeId:
 *                 type: integer
 *                 example: 5
 *     responses:
 *       201:
 *         description: Комментарий успешно создан
 *       400:
 *         description: Не хватает обязательных параметров
 *       404:
 *         description: Рецепт не найден
 *       500:
 *         description: Ошибка сервера
 */

/**
 * @swagger
 * /comments:
 *   get:
 *     summary: Получение всех комментариев
 *     tags: [Comments]
 *     responses:
 *       200:
 *         description: Список комментариев
 *       500:
 *         description: Ошибка сервера
 */

/**
 * @swagger
 * /comments/{id}:
 *   get:
 *     summary: Получение комментария по ID
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID комментария
 *     responses:
 *       200:
 *         description: Комментарий найден
 *       404:
 *         description: Комментарий не найден
 *       500:
 *         description: Ошибка сервера
 */

/**
 * @swagger
 * /comments/recipe/{recipeId}:
 *   get:
 *     summary: Получение комментариев по рецепту
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: recipeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID рецепта
 *     responses:
 *       200:
 *         description: Список комментариев по рецепту
 *       500:
 *         description: Ошибка сервера
 */

/**
 * @swagger
 * /comments/user/{userId}:
 *   get:
 *     summary: Получение комментариев пользователя
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID пользователя
 *     responses:
 *       200:
 *         description: Список комментариев пользователя
 *       500:
 *         description: Ошибка сервера
 */

/**
 * @swagger
 * /comments/{id}:
 *   put:
 *     summary: Обновление комментария
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID комментария
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 example: "Обновленный комментарий"
 *     responses:
 *       200:
 *         description: Комментарий обновлен
 *       403:
 *         description: Нельзя обновлять чужие комментарии
 *       404:
 *         description: Комментарий не найден
 *       500:
 *         description: Ошибка сервера
 */

/**
 * @swagger
 * /comments/{id}/like:
 *   put:
 *     summary: Поставить лайк комментарию
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID комментария
 *     responses:
 *       200:
 *         description: Лайк добавлен
 *       404:
 *         description: Комментарий не найден
 *       500:
 *         description: Ошибка сервера
 */

/**
 * @swagger
 * /comments/{id}/unlike:
 *   put:
 *     summary: Убрать лайк с комментария
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID комментария
 *     responses:
 *       200:
 *         description: Лайк убран
 *       404:
 *         description: Комментарий не найден
 *       500:
 *         description: Ошибка сервера
 */

/**
 * @swagger
 * /comments/{id}:
 *   delete:
 *     summary: Удаление комментария
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID комментария
 *     responses:
 *       200:
 *         description: Комментарий удален
 *       403:
 *         description: Нельзя удалять чужие комментарии
 *       404:
 *         description: Комментарий не найден
 *       500:
 *         description: Ошибка сервера
 */

/**
 * @swagger
 * /comments/count/recipe/{recipeId}:
 *   get:
 *     summary: Получение количества комментариев по рецепту
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: recipeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID рецепта
 *     responses:
 *       200:
 *         description: Количество комментариев
 *       500:
 *         description: Ошибка сервера
 */
