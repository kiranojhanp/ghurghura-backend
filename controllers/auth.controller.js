const createError = require('http-errors')
const User = require('../models/user.model')
const { authSchema } = require('../validation/auth.schema')
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../middlewares/auth.middleware')
const { DELETE_ASYNC } = require('../helpers/init_redis')

const register = async (req, res, next) => {
  try {
    const result = await authSchema.validateAsync(req.body)
    const doesExist = await User.findOne({ email: result.email })

    if (doesExist)
      throw createError.Conflict(`${result.email} is already been registered`)

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

const login = async (req, res, next) => {
  try {
    const result = await authSchema.validateAsync(req.body)
    const user = await User.findOne({ email: result.email })
    if (!user) throw createError.NotFound('User not registered')

    const isMatch = await user.isValidPassword(result.password)
    if (!isMatch)
      throw createError.Unauthorized('Username/password not valid')

    const accessToken = await signAccessToken(user.id)
    const refreshToken = await signRefreshToken(user.id)

    res.send({ accessToken, refreshToken })

  } catch (error) {
    if (error.isJoi === true)
      return next(createError.BadRequest('Invalid Username/Password'))
    next(error)
  }
}

const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body
    if (!refreshToken) throw createError.BadRequest()
    const userId = await verifyRefreshToken(refreshToken)

    const accessToken = await signAccessToken(userId)
    const refToken = await signRefreshToken(userId)
    res.send({ accessToken: accessToken, refreshToken: refToken })
  } catch (error) {
    next(error)
  }
}

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
    res.json({ message: "Token invalidated successfully" })

  } catch (error) {
    next(error)
  }
}

module.exports = { register, login, refreshToken, logout }
