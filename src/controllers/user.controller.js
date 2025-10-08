import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { User } from "../models/User.models.js";
import uploadonCloudinary from "../utils/cloudinary.js";

const generateAccessandRefreshToken = async (userID) => {
  try {
    const user = await User.findById(userID);
    if (!user) {
      throw new ApiError(409, "User is not existed");
    }
    const accessToken = user.AccessTokenGenerated();
    const refreshToken = user.RefreshTokenGenerated();

    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token"
    );
  }
};

const registerUser = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILES:", req.files);

    const { username, email, fullName, password } = req.body;

    // Validate required fields
    if ([username, email, fullName, password].some((f) => !f?.trim())) {
      throw new ApiError(400, "All fields are required");
    }

    // Check if user already exists
    const existing_user = await User.findOne({
      $or: [{ username }, { email }],
    });
    if (existing_user) {
      throw new ApiError(409, "User with email or username already exists");
    }

    // Get file paths
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    console.log("Avatar Path:", avatarLocalPath);
    console.log("Cover Image Path:", coverImageLocalPath);

    // Validate avatar is provided
    if (!avatarLocalPath) {
      throw new ApiError(400, "Avatar is required");
    }

    // Upload avatar (required)
    const avatar_img = await uploadonCloudinary(avatarLocalPath);
    if (!avatar_img) {
      throw new ApiError(500, "Failed to upload avatar");
    }

    // Upload cover image (optional) - only if file exists
    let cover_img = null;
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

    // Fetch created user without sensitive data
    const created_user = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    if (!created_user) {
      throw new ApiError(
        500,
        "Something went wrong while registering the user"
      );
    }

    return res
      .status(200)
      .json(new ApiResponse(200, created_user, "User created successfully"));
  } catch (error) {
    console.error("RegisterUser Error:", error);

    // Handle ApiError instances
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({
        statusCode: error.statusCode,
        message: error.message,
        success: false,
        errors: error.errors,
      });
    }

    // Handle other errors
    return res.status(500).json({
      statusCode: 500,
      message: error.message || "Something went wrong while creating account",
      success: false,
      errors: [],
    });
  }
};

const loggedIn = async (req, res) => {
  //loggedIn user

  // get data from body
  // check validation for email and password is not empty
  // search user based on email
  // check user password correct or not
  // generate access and refresh token
  // set refresh toekn into databse
  // set coth refresh and access cookies
  // return response
  try {
    console.log(req.body);

    const { email, password } = req.body;
    if ([email, password].some((field) => !field.trim())) {
      throw new ApiError(401, "Both Fields are Required");
    }
    const user = await User.findOne({ email });

    if (!user) {
      throw new ApiError(409, "User is not existed");
    }
    const isPasseordCorrect = await user.isPasswordCorrect(password);

    if (!isPasseordCorrect) {
      throw new ApiError(409, "Incorrect Password");
    }
    const { accessToken, refreshToken } = await generateAccessandRefreshToken(
      user._id
    );

    const user_data = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(new ApiResponse(200, user_data, "User login successfully"));
  } catch (error) {
    console.error("login Failed:", error);

    // Handle ApiError instances
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({
        statusCode: error.statusCode,
        message: error.message,
        success: false,
        errors: error.errors,
      });
    }

    // Handle other errors
    return res.status(500).json({
      statusCode: 500,
      message: error.message || "Something went wrong while login account",
      success: false,
      errors: [],
    });
  }
};

const logoutUser = async (req, res) => {
  try {
    // get user_id
    // search user
    // if user exist updat refrestoken field empty
    // delete cookie
    // return response
    await User.findByIdAndUpdate(
      req.user?._id,
      {
        $unset: {
          refreshToken: 1,
        },
      },
      {
        new: true,
      }
    );
    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(200, {}, "User loggedOut Successfully"));
  } catch (error) {
    console.error("logut Failed:", error);

    // Handle ApiError instances
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({
        statusCode: error.statusCode,
        message: error.message,
        success: false,
        errors: error.errors,
      });
    }

    // Handle other errors
    return res.status(500).json({
      statusCode: 500,
      message: error.message || "Something went wrong while logout account",
      success: false,
      errors: [],
    });
  }
};

export { registerUser, loggedIn, logoutUser };
