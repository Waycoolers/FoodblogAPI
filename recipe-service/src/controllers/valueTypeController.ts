import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { ValueType } from "../models/ValueType";

const valueTypeRepository = AppDataSource.getRepository(ValueType);

export const createValueType = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const newValueType = valueTypeRepository.create({name,});

    await valueTypeRepository.save(newValueType);

    return res.status(201).json(newValueType);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getValueTypes = async (_req: Request, res: Response) => {
  const valueTypes = await valueTypeRepository.find();
  res.json(valueTypes);
};

export const getValueTypeById = async (req: Request, res: Response) => {
  const valueType = await valueTypeRepository.findOneBy({ id: parseInt(req.params.id) });
  if (!valueType) return res.status(404).json({ message: "ValueType not found" });
  res.json(valueType);
};

export const updateValueType = async (req: Request, res: Response) => {
  const valueType = await valueTypeRepository.findOneBy({ id: parseInt(req.params.id) });
  if (!valueType) return res.status(404).json({ message: "ValueType not found" });

  valueTypeRepository.merge(valueType, req.body);
  const result = await valueTypeRepository.save(valueType);
  res.json(result);
};

export const deleteValueType = async (req: Request, res: Response) => {
  const result = await valueTypeRepository.delete(req.params.id);
  res.json({ deleted: result.affected });
};
