import { Response } from "express";
import { AppDataSource } from "../config/database";
import { User } from "../models/User";
import { AuthRequest } from "../middleware/authMiddleware";

const userRepository = AppDataSource.getRepository(User);

export const removePassword = (user: User) => {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const getUsers = async (_req: AuthRequest, res: Response) => {
  try {
    const users = await userRepository.find();
    res.json(users.map(removePassword));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = await userRepository.findOneBy({ id: parseInt(req.params.id) });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(removePassword(user));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = await userRepository.findOneBy({ id: parseInt(req.params.id) });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.id !== req.user!.id) {
      return res.status(403).json({ message: "You can only update your own profile" });
    }

    userRepository.merge(user, req.body);
    const result = await userRepository.save(user);
    res.json(removePassword(result));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = await userRepository.findOneBy({ id: parseInt(req.params.id) });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.id !== req.user!.id) {
      return res.status(403).json({ message: "You can only delete your own account" });
    }

    await userRepository.remove(user);
    res.json({ deleted: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    const user = await userRepository.findOneBy({ id: parseInt(req.params.id) });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Получить данные текущего пользователя
 *     description: Возвращает данные профиля авторизованного пользователя.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Данные пользователя
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Требуется авторизация
 *       404:
 *         description: Пользователь не найден
 *       500:
 *         description: Ошибка сервера
 */


/**
 * @swagger
 * /users/me:
 *   put:
 *     summary: Обновить данные текущего пользователя
 *     description: Позволяет авторизованному пользователю обновить свои данные (email, имя и т.д.).
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Данные пользователя обновлены
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Требуется авторизация
 *       403:
 *         description: Можно изменять только свой профиль
 *       404:
 *         description: Пользователь не найден
 *       500:
 *         description: Ошибка сервера
 */


/**
 * @swagger
 * /users/me:
 *   delete:
 *     summary: Удалить текущего пользователя
 *     description: Удаляет аккаунт авторизованного пользователя.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Пользователь удалён
 *       401:
 *         description: Требуется авторизация
 *       403:
 *         description: Можно удалить только свой аккаунт
 *       404:
 *         description: Пользователь не найден
 *       500:
 *         description: Ошибка сервера
 */


/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         username:
 *           type: string
 *         email:
 *           type: string
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 */