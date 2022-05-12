import { Router } from "express"
import { changePassword, getProfile, login, logout, refreshToken, register } from "../controllers/auth.controller"
import { verifyAccessToken } from "../middlewares/auth.middleware"
const router = Router()

router.post("/register", register)
router.post("/login", login)
router.post("/refresh-token", refreshToken)
router.post("/logout", logout)
router.post("/change-password", changePassword)

router.post("/profile", verifyAccessToken, getProfile)

export default router
