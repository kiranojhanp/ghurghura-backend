import express from "express"
import morgan from "morgan"
import createError from "http-errors"
import responseTime from "response-time"
import helmet from "helmet"
import cors from "cors"
import { verifyAccessToken } from "./middlewares/auth.middleware"
require("./helpers/init_db")

// routes
import AuthRoute from "./routes/auth.route"
import RocketsRoute from "./routes/rockets.route"
import RecipeRoute from "./routes/recipe.route"

const app = express()

app.use(cors())
app.use(helmet())
app.use(morgan("dev"))
app.use(responseTime())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get("/", verifyAccessToken, async (req, res, next) => {
    res.send("Hello from express.")
})

app.use("/auth", AuthRoute)
app.use("/recipes", RecipeRoute)
app.use("/rockets", RocketsRoute)

// error handlers
app.use(async (req, res, next) => {
    next(new createError.NotFound())
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

export default app
