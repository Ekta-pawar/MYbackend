import { asyncHandler } from "../utils/Handler.js";

// Register user
export const registerUser = asyncHandler(async (req, res) => {
  res.status(201).json({ message: "User registered successfully" });
});

// Login user
export const login = asyncHandler(async (req, res) => {
  res.status(200).json({ message: "User logged in successfully" });
});
