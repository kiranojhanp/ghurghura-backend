import express from "express"
import {
    addRecipe,
    deleteSingleRecipe,
    getRecipes,
    getSingleRecipe,
    updateSingleRecipe,
} from "../controllers/recipe.controller"
import { verifyAccessToken } from "../middlewares/auth.middleware"

const router = express.Router()

router.get("/", getRecipes)
router.post("/", verifyAccessToken, addRecipe)
router.get("/:id", getSingleRecipe)
router.put("/:id", verifyAccessToken, updateSingleRecipe)
router.delete("/:id", verifyAccessToken, deleteSingleRecipe)

export default router
