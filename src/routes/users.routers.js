import {registerUser,loggedIn} from "../controllers/user.controller.js"
import {upload} from "../middleware/multer.middleware.js";

import { Router } from "express";
const router = Router();

router.route("/register").post(
     upload.fields([{ name: "avatar", maxCount: 1 }, { name: "coverImage", maxCount: 1 }])

    ,registerUser);

    router.route("/login").post(loggedIn)
export default router