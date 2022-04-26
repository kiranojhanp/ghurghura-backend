const JWT = require('jsonwebtoken')
const createError = require('http-errors')
const { ACCESS_TOKEN_SECRET } = process.env

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

module.exports = { signAccessToken, verifyAccessToken }
