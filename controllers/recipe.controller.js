const createError = require("http-errors")
const { recipeSchema } = require("../validation/recipe.schema")
const Recipe = require("../models/recipe.model")

// @desc Add new recipe , @route POST /recipes, @access Private
const addRecipe = async (req, res, next) => {
    try {
        const user = req.payload.aud
        const { name, description, price } = req.body
        const result = await recipeSchema.validateAsync({ user, name, description, price })
        const recipe = new Recipe(result)
        const saveRecipe = await recipe.save()
        res.status(201).json(saveRecipe)
    } catch (error) {
        if (error.isJoi === true) error.status = 422
        next(error)
    }
}

// @desc Fetch all recipes , @route GET /recipes, @access Public
const getRecipes = async (req, res, next) => {
    try {
        const recipes = await Recipe.find()
        if (!recipes) return createError.NotFound()
        res.send(recipes)
    } catch (error) {
        next(error)
    }
}

// @desc Fetch single recipe , @route GET /recipes/:id, @access Public
const getSingleRecipes = async (req, res, next) => {
    try {
        const { id } = req.params
        const recipe = await Recipe.findById(id)
        if (!recipe) return createError.NotFound()
        res.send(recipe)
    } catch (error) {
        next(error)
    }
}

module.exports = { addRecipe, getRecipes, getSingleRecipes }
