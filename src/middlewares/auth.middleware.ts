const JWT = require("jsonwebtoken")
const createError = require("http-errors")
const { SET_ASYNC, GET_ASYNC } = require("../helpers/init_redis")
const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = process.env as { [key: string]: string }

const signAccessToken = (userId) => {
    return new Promise((resolve, reject) => {
        const payload = {}
        const secret = ACCESS_TOKEN_SECRET
        const options = {
            expiresIn: "1h",
            issuer: "www.ghurghura.com",
            audience: userId,
        }
        JWT.sign(payload, secret, options, (err, token) => {
            if (err) {
                console.log(err.message)
                reject(new createError.InternalServerError())
                return
            }
            resolve(token)
        })
    })
}

const verifyAccessToken = (req, res, next) => {
    if (!req.headers["authorization"]) return next(new createError.Unauthorized())
    const authHeader = req.headers["authorization"]
    const bearerToken = authHeader.split(" ")
    const token = bearerToken[1]
    JWT.verify(token, ACCESS_TOKEN_SECRET, (err, payload) => {
        if (err) {
            const message = err.name === "JsonWebTokenError" ? "Unauthorized" : err.message
            return next(new createError.Unauthorized(message))
        }
        req.payload = payload
        next()
    })
}

const signRefreshToken = (userId) => {
    return new Promise((resolve, reject) => {
        const payload = {}
        const secret = REFRESH_TOKEN_SECRET
        const options = {
            expiresIn: "1y",
            issuer: "www.ghurghura.com",
            audience: userId,
        }
        JWT.sign(payload, secret, options, async (err, token) => {
            if (err) {
                console.log(err.message)
                reject(new createError.InternalServerError())
            }

            try {
                const saveResult = await SET_ASYNC(userId, token, "EX", 365 * 24 * 60 * 60)
                if (saveResult) return resolve(token)
            } catch (err) {
                console.log(err.message)
                reject(new createError.InternalServerError())
            }
        })
    })
}

const verifyRefreshToken = (refreshToken) => {
    return new Promise((resolve, reject) => {
        JWT.verify(refreshToken, REFRESH_TOKEN_SECRET, async (err, payload) => {
            if (err) return reject(new createError.Unauthorized())
            const userId = payload.aud

            try {
                const getRefreshToken = await GET_ASYNC(userId)
                if (refreshToken === getRefreshToken) return resolve(userId)
                reject(new createError.Unauthorized())
            } catch (err) {
                console.log(err.message)
                reject(new createError.InternalServerError())
                return
            }
        })
    })
}

export { signAccessToken, verifyAccessToken, signRefreshToken, verifyRefreshToken }
