import { Router } from "express"
const router = Router()
import { verifyAccessToken } from "../middlewares/auth.middleware"
import { register, login, refreshToken, logout, getProfile, changePassword } from "../controllers/auth.controller"

router.post("/register", register)
router.post("/login", login)
router.post("/refresh-token", refreshToken)
router.post("/logout", logout)
router.post("/change-password", changePassword)

router.post("/profile", verifyAccessToken, getProfile)

export default router
