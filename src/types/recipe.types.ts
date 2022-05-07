export interface IRecipeReview {
    rating: number
    comment: string
    user: string | any
}

export interface IRecipe {
    user: string | any
    name: string
    description: string
    price: number
    reviews: IRecipeReview[]
    rating: number
    numReviews: number
}
