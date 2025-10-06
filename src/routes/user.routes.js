import { Router } from "express";
import { registerUser, login,logoutUser,refreshAccessToken } from "../controllers/user.controllers.js"; // fixed import and filename
import upload from "../middlewares/multer.js";
import verifyJWT from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/register").post(upload.fields([{ name: "avatar", maxCount: 1 },{ name: "cover", maxCount: 1 }]), registerUser);//middleware for single file upload
//router.route("/login").post(login);
router.route("/login").post(login);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
export default router;

