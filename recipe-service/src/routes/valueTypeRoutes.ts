import { Router } from "express";
import {
  createValueType,
  getValueTypeById,
  getValueTypes,
  updateValueType,
  deleteValueType,
} from "../controllers/valueTypeController";

const router = Router();

router.post("/", createValueType);
router.get("/", getValueTypes);
router.get("/:id", getValueTypeById);
router.put("/:id", updateValueType);
router.delete("/:id", deleteValueType);

export default router;
