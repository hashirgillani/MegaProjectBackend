import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { User } from "../models/User.models.js";
import uploadonCloudinary from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";


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
const generateAccessToken = async (req,res)=>{
  // get userRefreshToken from cookies or from body
// check if efreshToken not received
// if received then verify toekn expire and validate and decode It
// decoded toekn has userId search user based on id from database
// match user incoming teken and databse toekn if match
// generated new accesstoekn token 
// send response
  try {

    const inocmingUserrefreshToken =   req.cookies.refreshToken || req.body.refreshToken
    if (!inocmingUserrefreshToken) {
      throw new ApiError(401, "unauthorized request");
    }

     const decodedRefreshToken =  jwt.verify(inocmingUserrefreshToken,process.env.REFRESH_TOKEN_SECRET)

  const user_data = await  User.findById(decodedRefreshToken?._id)
  if (!user_data) {
    throw new ApiError(401, "Invalid Refresh Token");
  }

  if (inocmingUserrefreshToken != user_data?.refreshToken) {
    throw new ApiError(401, "Refresh Token is expired");
  }
  const { accessToken, refreshToken }  = await  generateAccessandRefreshToken(user_data?._id)
  const options = {
    httpOnly:true,
    secure:true
  }

  res.status(200)
  .cookie("accessToken",accessToken,options)
  .cookie("refreshToken",refreshToken,options)
  .json(
    new ApiResponse(200,{ accessToken, refreshToken },"AccessTokenRefreshed")
  )
  }  catch (error) {
    console.error("Failed to generateAccessToken", error);

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
      message: error.message || "Something went wrong while generating AccessToken",
      success: false,
      errors: [],
    });
  }
} 

// todo : { getCurrentuser, updateAccountdetails, updateAcatar,updateCoverImage}

const changePassword = async (req,res)=>{
  // get  oldpass and new pass from user
  // check both fields are not empty
  // check oldpassword is correct or not fromdb
  // if oldpassword correct then update newpass and save into db
  // return resp

  
  const {oldpassword,newpassword} = req.body
  try {
    if([oldpassword,newpassword].some(field=>!field.trim())){
      throw new ApiError(401,"Both Fields Required")
    }
    // console.log("user_data",req.user);
      if (oldpassword == newpassword) {
        throw new ApiError(401,"New Password mush be diffrent form old password try diffrent one")
      }
    const user = await User.findById(req.user?._id)
    // console.log(user);
    
     const isPasswordCorrect = await user.isPasswordCorrect(oldpassword)
     if (!isPasswordCorrect) {
        throw new ApiError(401,"oldPassword is not correct")
     }
     user.password = newpassword
     await user.save({validateBeforeSave:false})
  
     return res.status(200).json(
      new ApiResponse(200,{},"password changed successfully")
     )
  } catch (error) {
    console.error("Failed to Changed Password", error);

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
      message: error.message || "Something went wrong while Changing Password",
      success: false,
      errors: [],
    });
  }



 
}
const getCurrentUser = async(req,res)=>{
    try {
        
         return res.status(200).json(
            new ApiResponse(200,req.user,"user feched successfully")
         )
    } catch (error) {
    console.error("Failed to get current user", error);

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
      message: error.message || "Something went wrong while getting current user",
      success: false,
      errors: [],
    });
  }

}

export { registerUser, loggedIn, logoutUser,generateAccessToken,changePassword,getCurrentUser };
