const mongoose = require("mongoose")
const Schema = mongoose.Schema

const reviewSchema = mongoose.Schema(
    {
        rating: { type: Number, required: true },
        comment: { type: String, required: true },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "user",
        },
    },
    {
        timestamps: true,
    }
)

const RecipeSchema = new Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
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

module.exports = mongoose.model("recipe", RecipeSchema)
