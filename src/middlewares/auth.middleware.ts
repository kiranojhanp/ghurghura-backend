import { NextFunction, Request, Response } from "express"
import createError from "http-errors"
import JWT from "jsonwebtoken"
import { client } from "../helpers/init_redis"

const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = process.env as { [key: string]: string }

const signAccessToken = (userId: string): Promise<string> => {
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
            resolve(token as string)
        })
    })
}

const verifyAccessToken = (req: Request, res: Response, next: NextFunction) => {
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

const signRefreshToken = (userId: string): Promise<string> => {
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
                // add new refresh token to redis list
                const saveResult = await client.rPush(`refreshTokens-${userId}`, [token as string])

                if (saveResult) return resolve(token as string)
            } catch (err) {
                console.log(err.message)
                reject(new createError.InternalServerError())
            }
        })
    })
}

const verifyRefreshToken = (refreshToken: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        JWT.verify(refreshToken, REFRESH_TOKEN_SECRET, async (err, payload: any) => {
            if (err) {
                return reject(new createError.Unauthorized())
            }

            const userId = payload.aud

            try {
                const getRefreshTokenFromList = await client.lRange(`refreshTokens-${userId}`, 0, -1)
                getRefreshTokenFromList.forEach((token) => {
                    if (token === refreshToken) {
                        return resolve(userId)
                    }
                })

                await client.lRem(`refreshTokens-${userId}`, 0, refreshToken)
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
