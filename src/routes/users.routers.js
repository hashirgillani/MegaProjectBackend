import {registerUser,loggedIn,logoutUser,generateAccessToken} from "../controllers/user.controller.js"
import {upload} from "../middleware/multer.middleware.js";
import get_Record_user_when_login from "../middleware/getRecordofUserWhenlogin.js"


import { Router } from "express";
const router = Router();

router.route("/register").post(
     upload.fields([{ name: "avatar", maxCount: 1 }, { name: "coverImage", maxCount: 1 }])

    ,registerUser);

router.route("/login").post(loggedIn)
export default router


router.route("/logout").post(get_Record_user_when_login,logoutUser)

router.route("/generate-access-token").post(generateAccessToken)