const createError = require("http-errors")
const { recipeSchema } = require("../validation/recipe.schema")
const Recipe = require("../models/recipe.model")

const addRecipe = async (req, res, next) => {
    try {
        const user = req.payload.aud
        const { name, description, price } = req.body
        const result = await recipeSchema.validateAsync({ user, name, description, price })
        const recipe = new Recipe(result)
        const saveRecipe = await recipe.save()
        res.send(saveRecipe)
    } catch (error) {
        if (error.isJoi === true) error.status = 422
        next(error)
    }
}

const getRecipes = (req, res, next) => {
    try {
        res.send("All the recipes")
    } catch (error) {
        next(error)
    }
}

const getSingleRecipes = (req, res, next) => {
    try {
        res.send("Single recipes")
    } catch (error) {
        next(error)
    }
}

module.exports = { addRecipe, getRecipes, getSingleRecipes }
