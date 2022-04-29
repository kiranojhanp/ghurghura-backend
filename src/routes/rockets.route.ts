import express from "express"
import { getRockets, getSingleRocket } from "../controllers/rockets.controller"
const router = express.Router()

router.get("/", getRockets)
router.get("/:id", getSingleRocket)

export default router
