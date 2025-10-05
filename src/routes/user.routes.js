import { Router } from "express";
import { registerUser, login } from "../controllers/user.controllers.js"; // fixed import and filename

const router = Router();

router.route("/register").post(registerUser);
//router.route("/login").post(login);

export default router;

