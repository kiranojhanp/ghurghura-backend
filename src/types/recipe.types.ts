export interface IRecipeReview {
    rating: Number
    comment: String
    user: string | any
}

export interface IRecipe {
    user: string | any
    name: string
    description: string
    price: Number
    reviews: IRecipeReview[]
    rating: Number
    numReviews: Number
}
