import express from "express";
import { recommendDoctor, recommendDoctors } from "../controllers/aiController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/recommend", protect, recommendDoctor);
router.post("/recommend-doctors", recommendDoctors);

export default router;
