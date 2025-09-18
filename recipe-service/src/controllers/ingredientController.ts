import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { Ingredient } from "../models/Ingredient";

const ingredientRepository = AppDataSource.getRepository(Ingredient);

export const createIngredient = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const newIngredient = ingredientRepository.create({name,});

    await ingredientRepository.save(newIngredient);

    return res.status(201).json(newIngredient);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getIngredients = async (_req: Request, res: Response) => {
  const ingredients = await ingredientRepository.find();
  res.json(ingredients);
};

export const getIngredientById = async (req: Request, res: Response) => {
  const ingredient = await ingredientRepository.findOneBy({ id: parseInt(req.params.id) });
  if (!ingredient) return res.status(404).json({ message: "Ingredient not found" });
  res.json(ingredient);
};

export const updateIngredient = async (req: Request, res: Response) => {
  const ingredient = await ingredientRepository.findOneBy({ id: parseInt(req.params.id) });
  if (!ingredient) return res.status(404).json({ message: "Ingredient not found" });

  ingredientRepository.merge(ingredient, req.body);
  const result = await ingredientRepository.save(ingredient);
  res.json(result);
};

export const deleteIngredient = async (req: Request, res: Response) => {
  const result = await ingredientRepository.delete(req.params.id);
  res.json({ deleted: result.affected });
};
