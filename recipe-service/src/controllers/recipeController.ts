import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { Recipe } from "../models/Recipe";
import { Ingredient } from "../models/Ingredient";
import { Category } from "../models/Category";
import { RecipeIngredient } from "../models/RecipeIngredient";
import { RecipeCategory } from "../models/RecipeCategory";
import { ValueType } from "../models/ValueType";
import { AuthRequest } from "../middleware/middleware";
import { UserRecipe } from "../models/UserRecipe";

const recipeRepository = AppDataSource.getRepository(Recipe);
const ingredientRepository = AppDataSource.getRepository(Ingredient);
const categoryRepository = AppDataSource.getRepository(Category);
const recipeIngredientRepository = AppDataSource.getRepository(RecipeIngredient);
const recipeCategoryRepository = AppDataSource.getRepository(RecipeCategory);
const valueTypeRepository = AppDataSource.getRepository(ValueType);
const userRecipeRepository = AppDataSource.getRepository(UserRecipe);

export const createRecipe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "User not authenticated" });

    const { name, photo, description, difficulty, recipeText, categories, ingredients } = req.body;
    console.log("WOW");
    const newRecipe = recipeRepository.create({
      name,
      photo,
      description,
      difficulty,
      recipeText,
      authorId: req.user.id,
    });

    const savedRecipe = await recipeRepository.save(newRecipe);

    const userRecipe = userRecipeRepository.create({
      userId: req.user.id,
      recipe: savedRecipe,
      isAuthor: true,
    });
    await userRecipeRepository.save(userRecipe);

    if (categories?.length) {
      for (const catId of categories) {
        const category = await categoryRepository.findOneBy({ id: catId });
        if (!category) return res.status(404).json({ message: `Category ${catId} not found` });

        const rc = recipeCategoryRepository.create({ recipe: savedRecipe, category });
        await recipeCategoryRepository.save(rc);
      }
    }

    if (ingredients?.length) {
      for (const ing of ingredients) {
        const ingredient = await ingredientRepository.findOneBy({ id: ing.ingredientId });
        const valueType = await valueTypeRepository.findOneBy({ id: ing.valueTypeId });
        if (!ingredient || !valueType) return res.status(404).json({ message: "Ingredient or ValueType not found" });

        const ri = recipeIngredientRepository.create({
          recipe: savedRecipe,
          ingredient,
          value: ing.value,
          valueType,
        });
        await recipeIngredientRepository.save(ri);
      }
    }

    const result = await recipeRepository.findOne({
      where: { id: savedRecipe.id },
      relations: [
        "categories",
        "categories.category",
        "ingredients",
        "ingredients.ingredient",
        "ingredients.valueType",
        "comments",
        "savedByUsers",
      ],
    });

    res.status(201).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


export const getRecipes = async (req: Request, res: Response) => {
  try {
    const { categoryIds, difficulty, ingredientIds } = req.query;

    let query = recipeRepository
      .createQueryBuilder("recipe")
      .leftJoinAndSelect("recipe.categories", "recipeCategory")
      .leftJoinAndSelect("recipeCategory.category", "category")
      .leftJoinAndSelect("recipe.ingredients", "recipeIngredient")
      .leftJoinAndSelect("recipeIngredient.ingredient", "ingredient")
      .leftJoinAndSelect("recipeIngredient.valueType", "valueType")
      .leftJoinAndSelect("recipe.savedByUsers", "userRecipe");

    if (categoryIds) {
      const ids = (categoryIds as string).split(",").map(Number);
      query = query.andWhere("category.id IN (:...ids)", { ids });
    }

    if (difficulty) {
      query = query.andWhere("recipe.difficulty = :difficulty", { difficulty: Number(difficulty) });
    }

    if (ingredientIds) {
      const ids = (ingredientIds as string).split(",").map(Number);
      ids.forEach((id, index) => {
        query = query.andWhere(
          `EXISTS (
            SELECT 1 FROM recipe_ingredient ri
            WHERE ri."recipeId" = recipe.id AND ri."ingredientId" = :id${index}
          )`,
          { [`id${index}`]: id }
        );
      });
    }

    const recipes = await query.orderBy("recipe.id", "DESC").getMany();
    res.json(recipes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


export const getRecipeById = async (req: Request, res: Response) => {
  try {
    const recipe = await recipeRepository.findOne({
      where: { id: +req.params.id },
      relations: [
        "categories",
        "categories.category",
        "ingredients",
        "ingredients.ingredient",
        "ingredients.valueType",
        "comments",
        "savedByUsers",
      ],
    });

    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    res.json(recipe);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateRecipe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "User not authenticated" });

    const userRecipe = await userRecipeRepository.findOne({
      where: { userId: req.user.id, recipe: { id: +req.params.id }, isAuthor: true },
      relations: ["recipe"],
    });
    if (!userRecipe) return res.status(403).json({ message: "You can only update your own recipes" });

    const recipe = userRecipe.recipe;

    const { name, recipeText, photo, description, difficulty, categories, ingredients } = req.body;

    if (name) recipe.name = name;
    if (recipeText) recipe.recipeText = recipeText;
    if (photo) recipe.photo = photo;
    if (description) recipe.description = description;
    if (difficulty) recipe.difficulty = difficulty;

    const updatedRecipe = await recipeRepository.save(recipe);

    if (categories) {
      await recipeCategoryRepository.delete({ recipe: { id: updatedRecipe.id } });
      for (const catId of categories) {
        const category = await categoryRepository.findOneBy({ id: catId });
        if (category) {
          const rc = recipeCategoryRepository.create({ recipe: updatedRecipe, category });
          await recipeCategoryRepository.save(rc);
        }
      }
    }

    if (ingredients) {
      await recipeIngredientRepository.delete({ recipe: { id: updatedRecipe.id } });
      for (const ing of ingredients) {
        const ingredient = await ingredientRepository.findOneBy({ id: ing.ingredientId });
        const valueType = await valueTypeRepository.findOneBy({ id: ing.valueTypeId });
        if (ingredient && valueType) {
          const ri = recipeIngredientRepository.create({
            recipe: updatedRecipe,
            ingredient,
            value: ing.value,
            valueType,
          });
          await recipeIngredientRepository.save(ri);
        }
      }
    }

    const result = await recipeRepository.findOne({
      where: { id: updatedRecipe.id },
      relations: [
        "categories",
        "categories.category",
        "ingredients",
        "ingredients.ingredient",
        "ingredients.valueType",
        "comments",
        "savedByUsers",
      ],
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteRecipe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "User not authenticated" });

    const userRecipe = await userRecipeRepository.findOne({
      where: { userId: req.user.id, recipe: { id: +req.params.id }, isAuthor: true },
      relations: ["recipe"],
    });
    if (!userRecipe) return res.status(403).json({ message: "You can only delete your own recipes" });

    await recipeRepository.remove(userRecipe.recipe);
    res.json({ deleted: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @swagger
 * /recipes:
 *   post:
 *     summary: Создать новый рецепт
 *     description: Создает рецепт, добавляет категории и ингредиенты, а также привязывает автора.
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               photo:
 *                 type: string
 *               description:
 *                 type: string
 *               difficulty:
 *                 type: integer
 *               recipeText:
 *                 type: string
 *               categories:
 *                 type: array
 *                 items:
 *                   type: integer
 *               ingredients:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     ingredientId:
 *                       type: integer
 *                     valueTypeId:
 *                       type: integer
 *                     value:
 *                       type: number
 *     responses:
 *       201:
 *         description: Успешное создание рецепта
 *       404:
 *         description: Категория, ингредиент или тип значения не найдены
 *       500:
 *         description: Ошибка сервера
 */

/**
 * @swagger
 * /recipes:
 *   get:
 *     summary: Получить список рецептов
 *     description: Возвращает рецепты с возможностью фильтрации по категориям, сложности и ингредиентам.
 *     tags: [Recipes]
 *     parameters:
 *       - in: query
 *         name: categoryIds
 *         schema:
 *           type: string
 *         description: Список ID категорий через запятую
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: integer
 *         description: Уровень сложности
 *       - in: query
 *         name: ingredientIds
 *         schema:
 *           type: string
 *         description: Список ID ингредиентов через запятую
 *     responses:
 *       200:
 *         description: Список рецептов
 *       500:
 *         description: Ошибка сервера
 */

/**
 * @swagger
 * /recipes/{id}:
 *   get:
 *     summary: Получить рецепт по ID
 *     tags: [Recipes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID рецепта
 *     responses:
 *       200:
 *         description: Найденный рецепт
 *       404:
 *         description: Рецепт не найден
 */

/**
 * @swagger
 * /recipes/{id}:
 *   put:
 *     summary: Обновить рецепт
 *     description: Доступно только автору рецепта.
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               photo:
 *                 type: string
 *               description:
 *                 type: string
 *               difficulty:
 *                 type: integer
 *               recipeText:
 *                 type: string
 *               categories:
 *                 type: array
 *                 items:
 *                   type: integer
 *               ingredients:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     ingredientId:
 *                       type: integer
 *                     valueTypeId:
 *                       type: integer
 *                     value:
 *                       type: number
 *     responses:
 *       200:
 *         description: Успешное обновление рецепта
 *       403:
 *         description: Пользователь не является автором
 *       404:
 *         description: Рецепт не найден
 *       500:
 *         description: Ошибка сервера
 */

/**
 * @swagger
 * /recipes/{id}:
 *   delete:
 *     summary: Удалить рецепт
 *     description: Удаляет рецепт, доступно только автору.
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID рецепта
 *     responses:
 *       200:
 *         description: Рецепт удален
 *       403:
 *         description: Пользователь не является автором
 *       404:
 *         description: Рецепт не найден
 *       500:
 *         description: Ошибка сервера
 */
