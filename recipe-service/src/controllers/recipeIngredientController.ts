import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { RecipeIngredient } from "../models/RecipeIngredient";
import { Recipe } from "../models/Recipe";
import { Ingredient } from "../models/Ingredient";
import { ValueType } from "../models/ValueType";

const recipeIngredientRepository = AppDataSource.getRepository(RecipeIngredient);
const recipeRepository = AppDataSource.getRepository(Recipe);
const ingredientRepository = AppDataSource.getRepository(Ingredient);
const valueTypeRepository = AppDataSource.getRepository(ValueType);

export const addRecipeIngredient = async (req: Request, res: Response) => {
  try {
    const { recipeId, ingredientId, valueTypeId, value } = req.body;

    const recipe = await recipeRepository.findOneBy({ id: recipeId });
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    const ingredient = await ingredientRepository.findOneBy({ id: ingredientId });
    if (!ingredient) return res.status(404).json({ message: "Ingredient not found" });

    const valueType = await valueTypeRepository.findOneBy({ id: valueTypeId });
    if (!valueType) return res.status(404).json({ message: "ValueType not found" });

    const recipeIngredient = recipeIngredientRepository.create({
      recipe,
      ingredient,
      valueType,
      value,
    });

    const saved = await recipeIngredientRepository.save(recipeIngredient);
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getRecipeIngredients = async (_req: Request, res: Response) => {
  const list = await recipeIngredientRepository.find({
    relations: ["recipe", "ingredient", "valueType"],
  });
  res.json(list);
};

export const getIngredientsByRecipe = async (req: Request, res: Response) => {
  const { recipeId } = req.params;
  const list = await recipeIngredientRepository.find({
    where: { recipe: { id: +recipeId } },
    relations: ["ingredient", "valueType"],
  });
  res.json(list);
};

export const updateRecipeIngredient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { value, valueTypeId } = req.body;

    const recipeIngredient = await recipeIngredientRepository.findOne({
      where: { id: +id },
      relations: ["valueType"],
    });

    if (!recipeIngredient) return res.status(404).json({ message: "Relation not found" });

    if (value !== undefined) recipeIngredient.value = value;

    if (valueTypeId) {
      const valueType = await valueTypeRepository.findOneBy({ id: valueTypeId });
      if (!valueType) return res.status(404).json({ message: "ValueType not found" });
      recipeIngredient.valueType = valueType;
    }

    const updated = await recipeIngredientRepository.save(recipeIngredient);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteRecipeIngredient = async (req: Request, res: Response) => {
  const { id } = req.params;

  const ri = await recipeIngredientRepository.findOneBy({ id: +id });
  if (!ri) return res.status(404).json({ message: "Relation not found" });

  await recipeIngredientRepository.remove(ri);
  res.json({ message: "Relation deleted" });
};
