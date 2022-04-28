const express = require("express")
const router = express.Router()
const { verifyAccessToken } = require("../middlewares/auth.middleware")
const {
    addRecipe,
    getRecipes,
    getSingleRecipe,
    updateSingleRecipe,
    deleteSingleRecipe,
} = require("../controllers/recipe.controller")

router.get("/", getRecipes)
router.post("/", verifyAccessToken, addRecipe)
router.get("/:id", getSingleRecipe)
router.put("/:id", verifyAccessToken, updateSingleRecipe)
router.delete("/:id", verifyAccessToken, deleteSingleRecipe)

module.exports = router
