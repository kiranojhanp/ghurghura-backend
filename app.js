const express = require("express")
const morgan = require('morgan')
const createError = require('http-errors')
const responseTime = require('response-time')
const { verifyAccessToken } = require('./middlewares/auth.middleware')
require('./helpers/init_db')

// routes
const AuthRoute = require('./routes/auth.route')

const app = express()
app.use(morgan('dev'))
app.use(responseTime())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', verifyAccessToken, async (req, res, next) => {
  res.send('Hello from express.')
})

app.use('/auth', AuthRoute)

// error handlers
app.use(async (req, res, next) => {
  next(createError.NotFound())
})

app.use((err, req, res, next) => {
  res.status(err.status || 500)
  res.send({
    error: {
      status: err.status || 500,
      message: err.message,
    },
  })
})

module.exports = app;
