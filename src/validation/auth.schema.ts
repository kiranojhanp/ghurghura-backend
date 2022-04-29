import Joi from "joi"

export const authSchema = Joi.object({
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(2).required(),
})

export const changePasswordSchema = Joi.object({
    email: Joi.string().email().lowercase().required(),
    currentPassword: Joi.string().required(),
    password: Joi.string().required(),
    confirmPassword: Joi.string().required().valid(Joi.ref("password")),
})
