import axios from "axios"
import { NextFunction, Request, Response } from "express"
import { client } from "../helpers/init_redis"

const getRockets = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const reply = await client.GET(`rockets`)

        if (reply) {
            res.send(JSON.parse(reply))
            return
        }

        const response = await axios.get("https://api.spacexdata.com/v4/rockets")
        await client.setEx("recipes", 15, JSON.stringify(response.data))

        res.send(response.data)
    } catch (error) {
        next(error)
    }
}

const getSingleRocket = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const reply = await client.GET(`rocket-${id}`)
        if (reply) {
            res.send(JSON.parse(reply))
            return
        }

        const response = await axios.get(`https://api.spacexdata.com/v4/rockets/${id}`)
        await client.setEx(`rocket-${id}`, 15, JSON.stringify(response.data))

        res.send(response.data)
    } catch (error) {
        next(error)
    }
}

export { getRockets, getSingleRocket }
