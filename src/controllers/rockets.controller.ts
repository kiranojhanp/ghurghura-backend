import axios from "axios"
import { NextFunction, Request, Response } from "express"
import { SET_ASYNC, GET_ASYNC } from "../helpers/init_redis"

const getRockets = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const reply = (await GET_ASYNC("rockets")) as any
        if (reply) {
            res.send(JSON.parse(reply))
            return
        }

        const response = await axios.get("https://api.spacexdata.com/v4/rockets")
        await SET_ASYNC("rockets", JSON.stringify(response.data), 5)

        res.send(response.data)
    } catch (error) {
        next(error)
    }
}

const getSingleRocket = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const reply = (await GET_ASYNC(`rocket-${id}`)) as any
        if (reply) {
            res.send(JSON.parse(reply))
            return
        }

        const response = await axios.get(`https://api.spacexdata.com/v4/rockets/${id}`)
        await SET_ASYNC(`rocket-${id}`, JSON.stringify(response.data), 5)

        res.send(response.data)
    } catch (error) {
        next(error)
    }
}

export { getRockets, getSingleRocket }
