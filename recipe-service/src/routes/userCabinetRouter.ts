import { Router } from "express";
import { 
    getUserCabinet,
    removeRecipeFromFavorites,
    addRecipeToFavorites,
 } from "../controllers/userCabinetController";

const router = Router();

router.get("/me", getUserCabinet);
router.post("/favorites", addRecipeToFavorites);
router.delete("/favorites", removeRecipeFromFavorites);

export default router;
