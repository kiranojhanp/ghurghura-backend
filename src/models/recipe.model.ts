import { model, Schema } from "mongoose"
import { IRecipe, IRecipeReview } from "../types/recipe.types"

const reviewSchema = new Schema<IRecipeReview>(
    {
        rating: { type: Number, required: true },
        comment: { type: String, required: true },
        user: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "user",
        },
    },
    {
        timestamps: true,
    }
)

const RecipeSchema = new Schema<IRecipe>(
    {
        user: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "user",
        },
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        reviews: [reviewSchema],
        rating: {
            type: Number,
            required: true,
            default: 0,
        },
        numReviews: {
            type: Number,
            required: true,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
)

RecipeSchema.set("toJSON", {
    virtuals: true,
})

const Recipe = model("recipe", RecipeSchema)
export default Recipe
