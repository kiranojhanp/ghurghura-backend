const { promisify } = require('util')
const redis = require('redis')

const client = redis.createClient({
  port: 6379,
  host: '127.0.0.1',
})

client.on('connect', () => {
  console.log('Client connected to redis...')
})

client.on('ready', () => {
  console.log('Client connected to redis and ready to use...')
})

client.on('error', (err) => {
  console.log(err.message)
})

client.on('end', () => {
  console.log('Client disconnected from redis')
})

process.on('SIGINT', () => {
  client.quit()
})

// convert callback functions to promise
const GET_ASYNC = promisify(client.get).bind(client)
const SET_ASYNC = promisify(client.set).bind(client)
const DELETE_ASYNC = promisify(client.del).bind(client)

module.exports = { client, GET_ASYNC, SET_ASYNC, DELETE_ASYNC }