const createError = require("http-errors")
const User = require("../models/user.model")
const { authSchema, changePasswordSchema } = require("../validation/auth.schema")
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require("../middlewares/auth.middleware")
const { DELETE_ASYNC } = require("../helpers/init_redis")

// @desc register an account , @route POST /auth/register, @access Public
const register = async (req, res, next) => {
    try {
        const result = await authSchema.validateAsync(req.body)
        const { email } = result
        const doesExist = await User.findOne({ email })

        if (doesExist) throw createError.Conflict(`${result.email} is already been registered`)

        const user = new User(result)
        const savedUser = await user.save()
        const accessToken = await signAccessToken(savedUser.id)
        const refreshToken = await signRefreshToken(savedUser.id)

        res.send({ accessToken, refreshToken })
    } catch (error) {
        if (error.isJoi === true) error.status = 422
        next(error)
    }
}

// @desc login , @route POST /auth/login, @access Public
const login = async (req, res, next) => {
    try {
        const result = await authSchema.validateAsync(req.body)
        const user = await User.findOne({
            email: result.email,
        })
        if (!user) throw createError.NotFound("User not registered")

        const isMatch = await user.isValidPassword(result.password)
        if (!isMatch) throw createError.Unauthorized("Username/password not valid")

        const accessToken = await signAccessToken(user.id)
        const refreshToken = await signRefreshToken(user.id)

        res.send({ accessToken, refreshToken })
    } catch (error) {
        if (error.isJoi === true) return next(createError.BadRequest("Invalid Username/Password"))
        next(error)
    }
}

// @desc change password , @route POST /auth/change-password, @access Private
const changePassword = async (req, res, next) => {
    try {
        const result = await changePasswordSchema.validateAsync(req.body)
        const { email, currentPassword, password } = result

        const user = await User.findOne({ email })
        if (!user) throw createError.NotFound("User not registered")

        const isMatch = await user.isValidPassword(currentPassword)
        if (!isMatch) throw createError.Unauthorized()

        user.password = password

        const savedUser = await user.save()
        const accessToken = await signAccessToken(savedUser.id)
        const refreshToken = await signRefreshToken(savedUser.id)

        res.send({ accessToken, refreshToken })
    } catch (error) {
        if (error.isJoi === true) return next(createError.BadRequest())
        next(error)
    }
}

// @desc generate new access token , @route POST /auth/refresh-token, @access Private
const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body
        if (!refreshToken) throw createError.BadRequest()
        const userId = await verifyRefreshToken(refreshToken)

        const accessToken = await signAccessToken(userId)
        const refToken = await signRefreshToken(userId)
        res.send({
            accessToken: accessToken,
            refreshToken: refToken,
        })
    } catch (error) {
        next(error)
    }
}

// @desc invalidate refresh token , @route POST /auth/logout, @access Private
const logout = async (req, res, next) => {
    try {
        const { refreshToken } = req.body
        if (!refreshToken) throw createError.BadRequest()
        const userId = await verifyRefreshToken(refreshToken)

        const deleteRefreshToken = await DELETE_ASYNC(userId)
        if (!deleteRefreshToken) {
            console.log(err.message)
            throw createError.InternalServerError()
        }

        res.statusMessage = "Token invalidated"
        res.status = 204
        res.json({
            message: "Token invalidated successfully",
        })
    } catch (error) {
        next(error)
    }
}

// @desc get Profile , @route GET /auth/profile, @access Private
const getProfile = async (req, res, next) => {
    try {
        const { aud } = req.payload
        const user = await User.findById(aud)
        if (!user) throw new createError.NotFound()
        res.status(200).json(user)
    } catch (error) {
        next(error)
    }
}

// Flow for multi device
// Add new refresh token along with old on every login
// Remove old refresh token and add new on every /refresh-token
// Remove old refresh token on every logout

module.exports = { register, login, getProfile, refreshToken, logout, changePassword }
