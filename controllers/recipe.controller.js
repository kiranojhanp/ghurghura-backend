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
        if (!recipes) throw new createError.NotFound()
        res.send(recipes)
    } catch (error) {
        next(error)
    }
}

// @desc Fetch single recipe , @route GET /recipes/:id, @access Public
const getSingleRecipe = async (req, res, next) => {
    try {
        const { id } = req.params
        const recipe = await Recipe.findById(id)
        if (!recipe) throw new createError.NotFound(`Recipe of id:"${id}" not found`)
        res.send(recipe)
    } catch (error) {
        next(error)
    }
}

// @desc Delete single recipe , @route DELETE /recipes/:id, @access Private
const updateSingleRecipe = async (req, res, next) => {
    try {
        const { id } = req.params
        const { name, description, price } = req.body
        const user = req.payload.aud
        const result = await recipeSchema.validateAsync({ user, name, description, price })
        // set {new: true} so it returns latest value
        const recipe = await Recipe.findByIdAndUpdate(id, result, { new: true })
        res.send(recipe)
    } catch (error) {
        if (error.isJoi === true) error.status = 422
        next(error)
    }
}

// @desc Delete single recipe , @route DELETE /recipes/:id, @access Private
const deleteSingleRecipe = async (req, res, next) => {
    try {
        const { id } = req.params
        const { aud } = req.payload
        const recipe = await Recipe.findById(id)
        if (!recipe) throw new createError.NotFound()
        const { user } = recipe
        // allow user to delete only their recipes
        if (user.toString() !== aud) throw new createError.Unauthorized("Only owner can delete the recipe")

        await recipe.remove()
        res.status(202).json({ message: "Recipe deleted" })
    } catch (error) {
        next(error)
    }
}

module.exports = { addRecipe, getRecipes, getSingleRecipe, updateSingleRecipe, deleteSingleRecipe }
