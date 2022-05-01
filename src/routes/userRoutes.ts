import express from "express";
import * as authController from "../controllers/authController";
import * as scoreController from "../controllers/scoreController";

const router = express.Router();

// Register our sign up and login routes
//router.post("/signup", authController.prepEmail, authController.signUp);
router.post("/login", authController.logIn);
router.post("/score", scoreController.updateScore);
router.post("/room", authController.updateRoom);
router.post("/material", scoreController.updateMaterial);

export default router;