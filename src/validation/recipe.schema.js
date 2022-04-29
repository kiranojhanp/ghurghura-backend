const Joi = require("joi")

const recipeSchema = Joi.object({
    user: Joi.string().required(),
    name: Joi.string().lowercase().required(),
    description: Joi.string().min(6).required(),
    price: Joi.number().required(),
})

module.exports = {
    recipeSchema,
}
