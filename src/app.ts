import cors from "cors"
import express, { Application, ErrorRequestHandler } from "express"
import helmet from "helmet"
import createError from "http-errors"
import morgan from "morgan"
import responseTime from "response-time"
// routes
import AuthRoute from "./routes/auth.route"
import RecipeRoute from "./routes/recipe.route"
import RocketsRoute from "./routes/rockets.route"
require("./helpers/init_db")

const app: Application = express()

app.use(cors())
app.use(helmet())
app.use(morgan("dev"))
app.use(responseTime())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get("/", async (req, res) => {
    res.send("Hello stranger!, deployed using webhook! update")
})

app.use("/auth", AuthRoute)
app.use("/recipes", RecipeRoute)
app.use("/rockets", RocketsRoute)

// error handlers
app.use(async (req, res, next) => {
    next(new createError.NotFound())
})

const errorHandler: ErrorRequestHandler = (err, req, res) => {
    res.status(err.status || 500)
    res.send({
        error: {
            status: err.status || 500,
            message: err.message,
        },
    })
}

app.use(errorHandler)

export default app
