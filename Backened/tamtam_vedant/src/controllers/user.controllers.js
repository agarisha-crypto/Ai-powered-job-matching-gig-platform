import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js';
import {User} from '../models/user.models.js';
import {uploadToCloudinary} from "../utils/cloudinary.js";
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        
        user.refreshToken = refreshToken;

        user.save({validateBeforeSave: false});

        return { accessToken, refreshToken };

    }catch (error) {
        throw new ApiError(500, "something went wrong while generating tokens");
    }
}

const registerUser = asyncHandler(async (req, res) => {
    
    const {fullName,username, email, passwordHash,phoneNumber} = req.body;

    if([fullName, username, email, passwordHash,phoneNumber].some((field) => field?.trim() === ""))
            {throw new ApiError(400,"all fields are required");};
    
    const existedUser = await User.findOne({
    $or: [{ email }, { username }]
    });

    if(existedUser){
        throw new ApiError(409,"User with email or username already exists,if you are alreay register please LOGIN");
    }
    
    let profilePictureLocalPath = req.file?.path;

    if(!profilePictureLocalPath){
        console.log("No profile picture uploaded, using default profile picture.");
        profilePictureLocalPath = "public/default_profile_picture.png";
    }
    
    const profilePictureData = await uploadToCloudinary(profilePictureLocalPath);

    if(!profilePictureData){
        throw new ApiError(500, "Failed to upload profile picture");
    }

    const user = await User.create({
        username: username.toLowerCase(),
        email,
        passwordHash,
        fullName,
        phoneNumber,
        profilePicture: profilePictureData.secure_url,
    }); 

    const createdUser = await User.findById(user._id).select("-passwordHash -refreshToken");

    if(!createdUser){
        throw new ApiError(500, "Failed to create user in data base");
    };
    
    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    );


});


const loginUser = asyncHandler(async (req, res) => {
    const{username ,email,passwordHash} = req.body;

    if(!(username || email)){
        throw new ApiError(400,"username or email is required");
    }
    if(!passwordHash){
        throw new ApiError(400,"password is required");
    }
    const user = await User.findOne({
        $or: [{ email }, { username }]
    });

    if(!user){
        throw new ApiError(404,"User not found, please register");
    };

    const isPasswordValid = await user.comparePassword(passwordHash);
    
    if(!isPasswordValid){
        throw new ApiError(401,"invalid user credential");
    };
    
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-passwordHash -refreshToken");
    
    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "none"
    }
    
    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
             { 
                user: loggedInUser, accessToken
             }, 
             "User logged in successfully")
    );
    
    
});

const logoutUser = asyncHandler(async (req, res) => {
    console.log("Logging out user is being called");

    await User.findByIdAndUpdate(req.user._id, 
    {
        $set : { 
            refreshToken: null }
    },
    {
        new: true,
    });

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res.status(200)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(
        new ApiResponse(200, null, "User logged out successfully")
    );


});

const refreshAccessToken = asyncHandler(async (req, res) => {

    const incomingRefreshToken = req.cookies?.refreshToken || req.headers("Authorization")?.replace("Bearer ", "");
    
    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized request, refresh token is missing");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    
        const user =  await User.findById(decodedToken.userId)
        
        if(!user){
            throw new ApiError(401, "Unauthorized request, user not found");
        }
    
        if(user.refreshToken !== incomingRefreshToken){
            throw new ApiError(401, "refresh token is expired or used");
        }
    
        const options = {
            httpOnly: true,
            secure: true,
        }
    
        const { accessToken, newrefreshToken } = await generateAccessAndRefreshTokens(user._id);
    
        return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newrefreshToken, options)
        .json(
            new ApiResponse(200, { accessToken, newrefreshToken}, "Access token refreshed successfully")
        );
       
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid refresh token");
    }

}); 

const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    
    if(!(newPassword === confirmPassword)){
        throw new ApiError(400, "new password and confirm password do not match");
    }

    const user = await User.findById(req.user._id);
    
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    
    if(!isCurrentPasswordValid){
        throw new ApiError(400, "current password is incorrect");
    }
    user.passwordHash = newPassword;

    await user.save({validateBeforeSave: false});
    
    res.status(200).json(
        new ApiResponse(200, null, "Password changed successfully")
    );

});

const getCurrentUser = asyncHandler(async (req, res) => {
    res.status(200).
    json(
        new ApiResponse(200, req.user, "Current user fetched successfully")
    )
});

const addSkill = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { skill } = req.body;

  if (!skill) {
    return res.status(400).json({
      message: "Skill is required"
    });
  }

  const user = await User.findById(userId);

  if (!user) {
    return res.status(401).json({
      message: "Invalid or unauthorized user"
    });
  }

  user.skills.push(skill);

  await user.save();

  res.status(200).json({
    message: "Skill added successfully",
    skills: user.skills
  });
});

export { registerUser, loginUser, logoutUser, refreshAccessToken,changePassword, getCurrentUser,addSkill };