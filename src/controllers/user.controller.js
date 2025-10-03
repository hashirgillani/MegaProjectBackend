import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { User } from "../models/User.models.js";
import uploadonCloudinary from "../utils/cloudinary.js";

const registerUser = async (req, res) => {
  try {
    const { username, email, fullName, password } = req.body;

    // Validation
    if ([username, email, fullName, password].some(field => !field?.trim())) {
      throw new ApiError(400, "All fields are required");
    }

    // Check if user exists
    const existing_user = await User.findOne({ $or: [{ username }, { email }] });
    if (existing_user) {
      throw new ApiError(409, "User with email or username already exists");
    }

    // Get avatar and coverImage
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if (!avatarLocalPath) {
      throw new ApiError(400, "Avatar is required");
    }

    // Upload to cloudinary
    const avatar_img = await uploadonCloudinary(avatarLocalPath);
    let cover_img;
    if (coverImageLocalPath) {
      cover_img = await uploadonCloudinary(coverImageLocalPath);
    }

    // Create user
    const user = await User.create({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      fullName,
      password,
      avatar: avatar_img.url,
      coverImage: cover_img?.url || "",
    });

    const created_user = await User.findById(user._id).select("-password -refreshToken");

    if (!created_user) {
      throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(200).json(
      new ApiResponse(200, created_user, "User created successfully")
    );

  } catch (error) {
    return res.status(500).json(
      new ApiError(500, error.message || "Something went wrong while creating account")
    );
  }
};

export default registerUser;
