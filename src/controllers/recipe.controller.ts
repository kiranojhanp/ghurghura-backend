import { NextFunction, Request, Response } from "express"
import createError from "http-errors"
import { client } from "../helpers/init_redis"
import Recipe from "../models/recipe.model"
import { recipeSchema } from "../validation/recipe.schema"

// @desc Add new recipe , @route POST /recipes, @access Private
const addRecipe = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.payload.aud
        const { name, description, price } = req.body
        const result = await recipeSchema.validateAsync({ user, name, description, price })
        const recipe = new Recipe(result)
        const saveRecipe = await recipe.save()

        if (saveRecipe) await client.SETEX(`recipe-${saveRecipe.id}`, 15, JSON.stringify(saveRecipe))

        res.status(201).json(saveRecipe)
    } catch (error) {
        if (error.isJoi === true) error.status = 422
        next(error)
    }
}

// @desc Fetch all recipes , @route GET /recipes, @access Public
const getRecipes = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const reply = await client.GET("recipes")
        if (reply) {
            res.send(JSON.parse(reply))
            return
        }

        const recipes = await Recipe.find()
        if (!recipes) throw new createError.NotFound()
        await client.setEx("recipes", 15, JSON.stringify(recipes))

        res.send(recipes)
    } catch (error) {
        next(error)
    }
}

// @desc Fetch single recipe , @route GET /recipes/:id, @access Public
const getSingleRecipe = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params

        const reply = await client.GET(`recipe-${id}`)
        if (reply) {
            res.send(JSON.parse(reply))
            return
        }

        const recipe = await Recipe.findById(id)
        if (!recipe) throw new createError.NotFound(`Recipe of id:"${id}" not found`)
        await client.setEx(`recipe-${id}`, 15, JSON.stringify(recipe))

        res.send(recipe)
    } catch (error) {
        next(error)
    }
}

// @desc Delete single recipe , @route DELETE /recipes/:id, @access Private
const updateSingleRecipe = async (req: Request, res: Response, next: NextFunction) => {
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
const deleteSingleRecipe = async (req: Request, res: Response, next: NextFunction) => {
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

// @desc Add a review , @route GET /recipes/:id/review, @access Private
const addReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const { aud } = req.payload
        const { rating, comment } = req.body
        const recipe = await Recipe.findById(id)
        if (!recipe) throw new createError.NotFound()

        // allow single review
        const alreadyReviewed = recipe.reviews.find((item) => item.user.toString() === aud)
        if (alreadyReviewed) throw new createError.Conflict("You can only review once")

        const review = {
            rating: Number(rating),
            comment,
            user: aud,
        }

        recipe.reviews.push(review)
        recipe.numReviews = recipe.reviews.length
        // [1,2,3,4] => 0 + 1 + 2 + 3 + 4 so, 10/4 = 2.5
        recipe.rating = recipe.reviews.reduce((acc, item) => item.rating + acc, 0) / recipe.reviews.length

        await recipe.save()
        res.status(201).json({ message: "Review added" })
    } catch (error) {
        next(error)
    }
}

export { addRecipe, getRecipes, getSingleRecipe, updateSingleRecipe, deleteSingleRecipe, addReview }
