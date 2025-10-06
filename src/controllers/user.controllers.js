import { asyncHandler } from "../utils/Handler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOneCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

// Generate tokens
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError("User not found for token generation", 404);
    }

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (err) {
    throw new ApiError("Failed to generate tokens", 500);
  }
};

// Register user
export const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, password, username } = req.body;

  if ([fullName, email, password, username].some((f) => !f || f.trim() === "")) {
    throw new ApiError("All fields are required", 400);
  }

  if (!/\S+@\S+\.\S+/.test(email)) {
    throw new ApiError("Invalid email format", 400);
  }

  const existedUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existedUser) {
    throw new ApiError("User already exists", 409);
  }

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError("Avatar file is required", 400);
  }

  const avatar = await uploadOneCloudinary(avatarLocalPath);
  const coverImage = coverImageLocalPath
    ? await uploadOneCloudinary(coverImageLocalPath)
    : null;

  if (!avatar) {
    throw new ApiError("Failed to upload avatar", 500);
  }

  const newUser = await User.create({
    fullName,
    username: username.toLowerCase(),
    email,
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  const createdUser = await User.findById(newUser._id).select("-password -refreshToken");
  if (!createdUser) {
    throw new ApiError("Failed to create user", 500);
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

// Login user
export const login = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if ((!email && !username) || !password) {
    throw new ApiError("Email/Username and password are required", 400);
  }

  const user = await User.findOne({ $or: [{ email }, { username }] });
  if (!user) {
    throw new ApiError("User not found", 404);
  }

  const isPasswordValid = await user.isPassword(password);
  if (!isPasswordValid) {
    throw new ApiError("Invalid password", 400);
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  const options = { httpOnly: true, secure: true };

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});

// Logout user
export const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $set: { refreshToken: undefined } },
    { new: true }
  );

  const options = { httpOnly: true, secure: true };

  return res
    .status(200)
    .clearCookie("refreshToken", options)
    .clearCookie("accessToken", options)
    .json(new ApiResponse(200, null, "User logged out successfully"));
});

// Refresh token
export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError("Refresh token is required", 401);
  }

  try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.JWT_SECRET);
    const user = await User.findById(decodedToken._id || decodedToken.id);
    if (!user) {
      throw new ApiError("User not found", 404);
    }

    if (incomingRefreshToken !== user.refreshToken) {
      throw new ApiError("Invalid refresh token", 401);
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
    const options = { httpOnly: true, secure: true };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(new ApiResponse(200, { accessToken, refreshToken }, "Tokens refreshed successfully"));
  } catch (err) {
    throw new ApiError("Invalid or expired refresh token", 401);
  }
});
