import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { Category } from "../models/Category";

const categoryRepository = AppDataSource.getRepository(Category);

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const newCategory = categoryRepository.create({name,});

    await categoryRepository.save(newCategory);

    return res.status(201).json(newCategory);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getCategories = async (_req: Request, res: Response) => {
  const categories = await categoryRepository.find();
  res.json(categories);
};

export const getCategoryById = async (req: Request, res: Response) => {
  const category = await categoryRepository.findOneBy({ id: parseInt(req.params.id) });
  if (!category) return res.status(404).json({ message: "Category not found" });
  res.json(category);
};

export const updateCategory = async (req: Request, res: Response) => {
  const category = await categoryRepository.findOneBy({ id: parseInt(req.params.id) });
  if (!category) return res.status(404).json({ message: "Category not found" });

  categoryRepository.merge(category, req.body);
  const result = await categoryRepository.save(category);
  res.json(result);
};

export const deleteCategory = async (req: Request, res: Response) => {
  const result = await categoryRepository.delete(req.params.id);
  res.json({ deleted: result.affected });
};
