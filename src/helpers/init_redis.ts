import createHttpError from "http-errors"
import * as redis from "redis"
const { REDIS_HOST } = process.env as { [key: string]: string }

const client = redis.createClient({ url: `${REDIS_HOST}` })
client.connect()

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

// convert sync functions to promise
export const GET_ASYNC = async (key: string) => {
    return new Promise(async (resolve, reject) => {
        try {
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
            await client.SETEX(key, time, value)
            client.quit()
            resolve(value)
        } catch (error) {
            console.log(error.message)
            reject(new createHttpError.InternalServerError())
            return
        }
    })
}

export const DELETE_ASYNC = async (key: string) => {
    return new Promise(async (resolve, reject) => {
        try {
            await client.DEL(key)
            resolve(key)
        } catch (error) {
            console.log(error.message)
            reject(new createHttpError.InternalServerError())
            return
        }
    })
}

export default client
