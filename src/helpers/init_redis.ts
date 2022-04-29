import * as redis from "redis"
import createHttpError from "http-errors"
import { promisify } from "util"

const client = redis.createClient({ url: "redis://127.0.0.1:6379" })

client.on("connect", () => {
    console.log("Client connected to redis...")
})

client.on("ready", () => {
    console.log("Client connected to redis and ready to use...")
})

client.on("error", (err) => {
    console.log(err.message)
})

client.on("end", () => {
    console.log("Client disconnected from redis")
})

process.on("SIGINT", () => {
    client.quit()
})

// convert callback functions to promise
// export const GET_ASYNC = promisify(client.get).bind(client)
// export const SET_ASYNC = promisify(client.set).bind(client)
export const DELETE_ASYNC = promisify(client.del).bind(client)

export const GET_ASYNC = async (key: string) => {
    return new Promise(async (resolve, reject) => {
        try {
            await client.connect()
            const response = await client.GET(key)
            resolve(response)
        } catch (error) {
            console.log(error.message)
            reject(new createHttpError.InternalServerError())
            return
        }
    })
}

export const SET_ASYNC = async (key: string, value: string, time: number) => {
    return new Promise(async (resolve, reject) => {
        try {
            await client.connect()
            await client.SETEX(key, time, value)
            // client.quit();
            resolve(value)
        } catch (error) {
            console.log(error.message)
            reject(new createHttpError.InternalServerError())
            return
        }
    })
}

export default client
