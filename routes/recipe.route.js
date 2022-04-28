const express = require("express")
const router = express.Router()
const { verifyAccessToken } = require("../middlewares/auth.middleware")
const { addRecipe, getRecipes, getSingleRecipes } = require("../controllers/recipe.controller")

router.get("/", getRecipes)
router.post("/", verifyAccessToken, addRecipe)
router.get("/:id", getSingleRecipes)

module.exports = router
