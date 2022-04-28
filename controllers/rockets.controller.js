const axios = require('axios')
const { SET_ASYNC, GET_ASYNC } = require('../helpers/init_redis')

const getRockets = async (req, res, next) => {
  try {
    const reply = await GET_ASYNC('rockets')
    if (reply) {
      res.send(JSON.parse(reply))
      return
    }

    const response = await axios.get('https://api.spacexdata.com/v4/rockets')
    const savedResult = await SET_ASYNC('rockets', JSON.stringify(response.data), 'EX', 5)

    res.send(response.data)
  } catch (error) {
    next(error)
  }
}

const getSingleRocket = async (req, res, next) => {
  try {
    const { id } = req.params
    const reply = await GET_ASYNC(`rocket-${id}`)
    if (reply) {
      res.send(JSON.parse(reply))
      return
    }

    const response = await axios.get(`https://api.spacexdata.com/v4/rockets/${id}`)
    const savedResult = await SET_ASYNC(`rocket-${id}`, JSON.stringify(response.data), 'EX', 5)

    res.send(response.data)
  } catch (error) {
    next(error)
  }
}

module.exports = { getRockets, getSingleRocket }

