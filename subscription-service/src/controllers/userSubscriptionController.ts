import axios from "axios";
import { getUser } from '../rabbit/client';
import { Response } from "express";
import { AppDataSource } from "../config/database";
import { UserSubscription } from "../models/UserSubscription";
import { AuthRequest } from "../middleware/middleware";

const subscriptionRepository = AppDataSource.getRepository(UserSubscription);

export const createSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const { followedId } = req.body;
    const followerId = req.user!.id;

    if (!followedId) {
      return res.status(400).json({ message: "followedId is required" });
    }

    if (followerId === followedId) {
      return res.status(400).json({ message: "You can't subscribe to yourself" });
    }

    const exists = await subscriptionRepository.findOne({
      where: { followerId, followedId },
    });
    if (exists) {
      return res.status(400).json({ message: "Subscription already exists" });
    }

    const newSubscription = subscriptionRepository.create({
      followerId,
      followedId,
    });

    const saved = await subscriptionRepository.save(newSubscription);
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getFollowing = async (req: AuthRequest, res: Response) => {
  try {
    const following = await subscriptionRepository.find({
        where: { followerId: req.user!.id },
    });

    const followedIds = following.map(s => s.followedId);
    const usersPromises = followedIds.map(id => getUser(id));
    const users = await Promise.all(usersPromises);

    res.json(users.filter(u => u !== null));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getFollowers = async (req: AuthRequest, res: Response) => {
  try {
    const followers = await subscriptionRepository.find({
        where: { followedId: req.user!.id },
    });

    const followerIds = followers.map(s => s.followerId);
    const usersPromises = followerIds.map(id => getUser(id));
    const users = await Promise.all(usersPromises);

    res.json(users.filter(u => u !== null));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const { followedId } = req.body;
    const followerId = req.user!.id;

    if (!followedId) {
      return res.status(400).json({ message: "followedId is required" });
    }

    const result = await subscriptionRepository.delete({
      followerId,
      followedId,
    });

    if (!result.affected) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    res.json({ deleted: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @swagger
 * /us:
 *   post:
 *     summary: Создать подписку (подписаться на пользователя)
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - followedId
 *             properties:
 *               followedId:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       201:
 *         description: Подписка создана
 *       400:
 *         description: Ошибка (например, подписка уже существует или попытка подписаться на себя)
 *       401:
 *         description: Неавторизован
 *       404:
 *         description: Пользователь не найден
 */


/**
 * @swagger
 * /us/following:
 *   get:
 *     summary: Получить пользователей, на которых подписан авторизованный пользователь
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID пользователя
 *     responses:
 *       200:
 *         description: Список пользователей, на которых подписан авторизованный пользователь
 */


/**
 * @swagger
 * /us/followers:
 *   get:
 *     summary: Получить подписчиков авторизованного пользователя
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID пользователя
 *     responses:
 *       200:
 *         description: Список подписчиков
 */


/**
 * @swagger
 * /us:
 *   delete:
 *     summary: Удалить подписку (отписаться от пользователя)
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - followedId
 *             properties:
 *               followedId:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Подписка удалена
 *       400:
 *         description: Ошибка валидации
 *       401:
 *         description: Неавторизован
 *       404:
 *         description: Подписка не найдена
 */