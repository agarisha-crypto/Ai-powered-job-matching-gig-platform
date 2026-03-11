import express from "express";

//middle ware import here
import {upload} from '../middlewares/multer.middleware.js';
import {verifyJWT} from '../middlewares/auth.middleware.js';



const userRouter = express.Router();

//o=router import here
import {registerUser,loginUser,logoutUser,refreshAccessToken,changePassword,getCurrentUser,addSkill} from '../controllers/user.controllers.js';



//routes definationhere

userRouter.route("/register").post(
    upload.single("profilePicture"),
    registerUser
);

userRouter.route("/login").post(
    loginUser
);

userRouter.route("/logout").post(
    verifyJWT,
    logoutUser
);

userRouter.route("/refresh-token").post(
    refreshAccessToken
);

userRouter.route("/current-user").get(
    verifyJWT,
    getCurrentUser
)

userRouter.route("/change-password").post(
    verifyJWT,
    changePassword
);

userRouter.route("/add-skill").post(
    verifyJWT,
    addSkill
);

userRouter.route("/check-backend").get(
    (req, res) => {
        res.status(200).json({ message: "Backend cahl rha mera namoono" });
    }
);
export default userRouter;