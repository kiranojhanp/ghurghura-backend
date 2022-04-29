const express = require('express')
const router = express.Router()
const { getRockets, getSingleRocket } = require('../controllers/rockets.controller')

router.get("/", getRockets);
router.get("/:id", getSingleRocket);

module.exports = router
