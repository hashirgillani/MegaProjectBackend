import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import {User} from "../models/User.models.js";

const get_Record_user_when_login = async (req, res, next) => {
  // get both accesstoken from cookies as well as check for header
  // if token decode data from accestoken
  // if userdata add userdata in req
  // next()
  try {
      const accessToken =  req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
      if (!accessToken) {
         throw new ApiError(401, "Unauthorized request")
      }
      const decodedToekn = jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECRET)
            const user = await User.findById(decodedToekn?._id);
            if (!user) {
                throw new ApiError(401, "Invaild Access Toekn")
            }
            res.user = user;
            next()
  } catch (error) {
    console.error("Erro While Record Fetching:", error);

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
      message: error.message || "Something went wrong while Record Fetching",
      success: false,
      errors: [],
    });
  }
};
export default get_Record_user_when_login;
