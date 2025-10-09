import {registerUser,loggedIn,logoutUser,generateAccessToken,changePassword,getCurrentUser,updateAccountdetails,updateAvatar,updateCoverImage} from "../controllers/user.controller.js"
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
router.route("/change-password").post(get_Record_user_when_login,changePassword)
router.route("/get-current-user").post(get_Record_user_when_login,getCurrentUser)
router.route("/update-user-record").post(get_Record_user_when_login,updateAccountdetails)
router.route("/update-avatar").post(
    upload.single("avatar"),
    get_Record_user_when_login,
    updateAvatar
)

router.route("/updat-coverImage").post(
    upload.single("coverImage"),
    get_Record_user_when_login,
    updateCoverImage
)