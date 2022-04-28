const express = require("express")
const router = express.Router()
const { verifyAccessToken } = require("../middlewares/auth.middleware")
const { register, login, refreshToken, logout, getProfile, changePassword } = require("../controllers/auth.controller")

router.post("/register", register)
router.post("/login", login)
router.post("/refresh-token", refreshToken)
router.post("/logout", logout)
router.post("/change-password", changePassword)

router.post("/profile", verifyAccessToken, getProfile)

module.exports = router
