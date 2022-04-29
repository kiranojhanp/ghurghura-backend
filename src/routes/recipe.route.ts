import express from "express"
const router = express.Router()
import { verifyAccessToken } from "../middlewares/auth.middleware"
import {
    addRecipe,
    getRecipes,
    getSingleRecipe,
    updateSingleRecipe,
    deleteSingleRecipe,
} from "../controllers/recipe.controller"

router.get("/", getRecipes)
router.post("/", verifyAccessToken, addRecipe)
router.get("/:id", getSingleRecipe)
router.put("/:id", verifyAccessToken, updateSingleRecipe)
router.delete("/:id", verifyAccessToken, deleteSingleRecipe)

export default router
