const createError = require("http-errors")
const Recipe = require("../models/recipe.model")

const getRecipes = (req, res, next) => {
    res.send("All the recipes")
}

const getSingleRecipes = (req, res, next) => {
    res.send("Single recipes")
}

module.exports = { getRecipes, getSingleRecipes }
