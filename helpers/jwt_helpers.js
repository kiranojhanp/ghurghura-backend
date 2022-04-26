const JWT = require('jsonwebtoken')
const createError = require('http-errors')
const client = require('./init_redis')
const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = process.env

const signAccessToken = (userId) => {
  return new Promise((resolve, reject) => {
    const payload = {}
    const secret = ACCESS_TOKEN_SECRET
    const options = {
      expiresIn: '1h',
      issuer: 'www.ghurghura.com',
      audience: userId,
    }
    JWT.sign(payload, secret, options, (err, token) => {
      if (err) {
        console.log(err.message)
        reject(createError.InternalServerError())
        return
      }
      resolve(token)
    })
  })
}

const verifyAccessToken = (req, res, next) => {
  if (!req.headers['authorization']) return next(createError.Unauthorized())
  const authHeader = req.headers['authorization']
  const bearerToken = authHeader.split(' ')
  const token = bearerToken[1]
  JWT.verify(token, ACCESS_TOKEN_SECRET, (err, payload) => {
    if (err) {
      const message =
        err.name === 'JsonWebTokenError' ? 'Unauthorized' : err.message
      return next(createError.Unauthorized(message))
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
      expiresIn: '1y',
      issuer: 'www.ghurghura.com',
      audience: userId,
    }
    JWT.sign(payload, secret, options, (err, token) => {
      if (err) {
        console.log(err.message)
        reject(createError.InternalServerError())
      }

      client.SET(userId, token, 'EX', 365 * 24 * 60 * 60, (err, reply) => {
        if (err) {
          console.log(err.message)
          reject(createError.InternalServerError())
          return
        }
        resolve(token)
      })
    })
  })
}

const verifyRefreshToken = (refreshToken) => {
  return new Promise((resolve, reject) => {
    JWT.verify(
      refreshToken,
      REFRESH_TOKEN_SECRET,
      (err, payload) => {
        if (err) return reject(createError.Unauthorized())
        const userId = payload.aud
        client.GET(userId, (err, result) => {
          if (err) {
            console.log(err.message)
            reject(createError.InternalServerError())
            return
          }
          if (refreshToken === result) return resolve(userId)
          reject(createError.Unauthorized())
        })
      }
    )
  })
}
module.exports = { signAccessToken, verifyAccessToken, signRefreshToken, verifyRefreshToken }
