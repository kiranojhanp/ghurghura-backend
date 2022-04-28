const express = require("express")
const router = express.Router()
const { getRecipes, getSingleRecipes } = require("../controllers/recipe.controller")

router.get("/", getRecipes)
router.get("/:id", getSingleRecipes)

module.exports = router
