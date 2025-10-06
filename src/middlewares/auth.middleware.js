import { asyncHandler } from "../utils/Handler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";

 const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    // Get token from cookies or headers
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "No token provided");
    }

    // Verify token
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      throw new ApiError(401, "Invalid or expired token");
    }

    // Find user
    const user = await User.findById(decodedToken._id).select("+refreshToken");
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
});
export default verifyJWT;