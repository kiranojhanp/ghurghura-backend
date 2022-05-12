import { NextFunction, Request, Response } from "express"
import createError from "http-errors"
import { client } from "../helpers/init_redis"
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../middlewares/auth.middleware"
import User from "../models/user.model"
import { authSchema, changePasswordSchema } from "../validation/auth.schema"

// @desc register an account , @route POST /auth/register, @access Public
const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await authSchema.validateAsync(req.body)
        const { email } = result
        const doesExist = await User.findOne({ email })

        if (doesExist) throw new createError.Conflict(`${result.email} is already been registered`)

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
const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await authSchema.validateAsync(req.body)
        const user = await User.findOne({
            email: result.email,
        })
        if (!user) throw new createError.NotFound("User not registered")

        const isMatch = await user.isValidPassword(result.password)
        if (!isMatch) throw new createError.Unauthorized("Username/password not valid")

        const accessToken = await signAccessToken(user.id)
        const refreshToken = await signRefreshToken(user.id)

        res.send({ accessToken, refreshToken })
    } catch (error) {
        if (error.isJoi === true) return next(new createError.BadRequest("Invalid Username/Password"))
        next(error)
    }
}

// @desc change password , @route POST /auth/change-password, @access Private
const changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await changePasswordSchema.validateAsync(req.body)
        const { email, currentPassword, password } = result

        const user = await User.findOne({ email })
        if (!user) throw new createError.NotFound("User not registered")

        const isMatch = await user.isValidPassword(currentPassword)
        if (!isMatch) throw new createError.Unauthorized()

        user.password = password

        const savedUser = await user.save()
        const accessToken = await signAccessToken(savedUser.id)
        const refreshToken = await signRefreshToken(savedUser.id)

        res.send({ accessToken, refreshToken })
    } catch (error) {
        if (error.isJoi === true) return next(new createError.BadRequest())
        next(error)
    }
}

// @desc generate new access token , @route POST /auth/refresh-token, @access Private
const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { refreshToken } = req.body
        if (!refreshToken) throw new createError.BadRequest()

        const userId = (await verifyRefreshToken(refreshToken)) as string
        // remove refresh token from list
        // allow one refresh token to sign access token only once
        await client.lRem(`refreshTokens-${userId}`, 0, refreshToken)
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
const logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { refreshToken } = req.body
        if (!refreshToken) throw new createError.BadRequest()
        const userId = (await verifyRefreshToken(refreshToken)) as string

        // remove refresh token from list
        const removeRefreshToken = await client.lRem(`refreshTokens-${userId}`, 0, refreshToken)

        if (!removeRefreshToken) {
            throw new createError.InternalServerError()
        }

        res.status(204).json({ message: "Token invalidated successfully" })
    } catch (error) {
        next(error)
    }
}

// @desc get Profile , @route GET /auth/profile, @access Private
const getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { aud } = req.payload
        const user = await User.findById(aud)
        if (!user) throw new createError.NotFound()
        res.status(200).json(user)
    } catch (error) {
        next(error)
    }
}

export { register, login, getProfile, refreshToken, logout, changePassword }
