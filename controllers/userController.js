import User from "../models/userModel.js";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import { v2 as cloudinary } from 'cloudinary';
import fs, { fdatasync } from "fs";
import configEnv from "../config/configEnv.js";
import transporter from "../utils/mailer.js";
import { welcomeMailOptions, verificationMailOptions, resetPasswordMailOptions, passwordResetConfirmationMailOptions } from "../utils/mailOptions.js"
import crypto from "crypto";

// create function that create the verticalAlign:  
const generateVerificationCode = (length = 6) => {
  const min = 100000;
  const max = 999999;
  const code = Math.floor(Math.random() * (max - min + 1)) + min;
  return code.toString();
}

// create user 
const createUser = async (req, res, next) => {
  try {
    //  destructure req body data 
    const { axy, userName, email, password } = req.body;

    if (!userName || !email || !password) {
      const err = new Error();
      err.message = "All fields are required";
      err.statusCode = 400;
      return next(err);
    }
    const exitsUser = await User.findOne({ email });

    // check user already exits or not
    if (exitsUser) {
      const err = new Error();
      err.message = "User already exits";
      err.statusCode = 400;
      return next(err);
    }

    //  upload image to cloudinary
    cloudinary.config({
      cloud_name: configEnv.cloudinary_cloud_name,
      api_key: configEnv.cloudinary_api_key,
      api_secret: configEnv.cloudinary_api_secret,
    });

    const result = await cloudinary.uploader.upload(req.file.path);
    const profilePhoto = result.secure_url;
    // delete image from server
    fs.unlinkSync(req.file.path);



    //  hashed  password
    const HashedPassword = await bcrypt.hash(password, 10);



    // create new User
    const newUser = new User({
      profilePhoto: profilePhoto,
      userName,
      email,
      password: HashedPassword
    })

    // create token 
    const token = jwt.sign({ userId: newUser._id }, configEnv.jwt_secret, {
      expiresIn: "90d"
    })

    // Send welcome mail
    transporter.sendMail(welcomeMailOptions(email, userName));
    // save user 
    await newUser.save();




    res.status(201).json({
      success: true,
      message: "User created successfully",
      token,
    })

  } catch (error) {
    return next(error);
  }
}

// login user with email and password 
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return next(createError("All fields are required", 400));
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return next(createError("User  not found", 400));
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(createError("Password is incorrect", 400));
    }


    // Create a new token
    const token = jwt.sign({ userId: user._id }, configEnv.jwt_secret, {
      expiresIn: "90d",
    });

    const verifyCode = generateVerificationCode();
    user.otp = verifyCode;
    user.optExpired = Date.now() + 1000 * 60 * 5;
    transporter.sendMail(verificationMailOptions(email, verifyCode), (err, info) => {
      if (err) {
        const err = new Error();
        err.message = "Error sending email";
        err.statusCode = 500;
        return next(err);
      } else {
        res.status(200).json({
          success: true,
          token,
          message: "otp sent to your email",
        });
      }
    });
    await user.save();
  } catch (err) {
    return next(err);
  }
};

// create api for verify user
const verifyUser = async (req, res, next) => {

  try {
    const { verifyCode } = req.body;
    const user = await User.findOne(req.userId);
    if (!verifyCode) {
      const err = new Error();
      err.message = "All fields are required";
      err.statusCode = 400;
      return next(err);
    }

    if (user.otp !== verifyCode) {
      const err = new Error();
      err.message = "Invalid verification code";
      err.statusCode = 400;
      return next(err);
    }

    user.otp = null;
    user.optExpired = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: "you are login successfully",
    })

  } catch (error) {
    return next(error);
  }
}

//  get user profile info
const profileInfo = async (req, res, next) => {

  try {
    // decode token and get id 

    const user = await User.findById({ _id: req.userId });
    // check user exits or not
    if (!user) {
      const err = new Error();
      err.message = "User not found";
      err.statusCode = 400;
      return next(err);
    }


    res.status(200).json({
      success: true,
      user: user
    })

  } catch (error) {
    return next(error);
  }
}



const logout = async (req, res, next) => {
  try {
    res.clearCookie("token");
    res.status(200).json({
      success: true,
      message: "User logout successfully"
    })
  } catch (error) {
    return next(error);
  }
}

//  delete Account
const deleteAccount = async (req, res, next) => {
  try {
    if (!req.userId) {
      const err = new Error();
      err.message = "User not found";
      err.statusCode = 400;
      return next(err);
    }
    await User.findByIdAndDelete(req.userId);
    res.status(200).json({
      success: true,
      message: "User deleted successfully"
    })

  } catch (error) {
    return next(error);
  }
}


// Utility function to create errors
function createError(message, statusCode) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

// forgetpassword 
const forgetpassword = async (req, res, next) => {
  try {
    // get email and user 
    const user = await User.findOne({ email: req.body.email });
    // check user exits or not
    if (!user) {
      const err = new Error();
      err.message = "User not found";
      err.statusCode = 400;
      return next(err);
    }


    // create resetpasswordToken 
    const resetToken = user.createResetPasswordToken();
    console.log(resetToken);
    await user.save();

    // create resetUrl 
    const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/user/resetpassword/${resetToken}`;
    console.log(resetUrl);
    // send email 
    transporter.sendMail(resetPasswordMailOptions(user.email, resetUrl), () => {
      res.status(200).json({
        success: true,
        message: "Password reset link sent to your email",
      });
    });

  } catch (error) {
    return next(error);
  }
}

// create resetpassword 
const resetpassword = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!password && !email) {
      const err = new Error();
      err.message = " required All Field";
      err.statusCode = 400;
      return next(err);
    }

    const user = await User.findOne({ email });
    if (!user) {
      const err = new Error();
      err.message = "User not found";
      err.statusCode = 400;
      return next(err);
    }



    const reqToken = await req.params.token;

    // check token is +nt or not 
    if (!reqToken) {
      const err = new Error();
      err.message = "Token is required";
      err.statusCode = 400;
      return next(err);
    };



    // hash the req token 
    const hashedToken = crypto.createHash("sha256").update(reqToken).digest("hex");

    // check if both token and hashedToken are same or not
    if (hashedToken !== user.resetPasswordToken) {
      const err = new Error();
      err.message = "Invalid token";
      err.statusCode = 400;
      return next(err);
    }

    // hashed the password 

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    // reset password token and reset password token expired
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();





    // send email for password reset confirmation
    transporter.sendMail(passwordResetConfirmationMailOptions(email, user.userName), () => {

      res.status(200).json({
        success: true,
        message: "Password reset successfully",
      });

    });

  } catch (error) {
    return next(error);

  }
}

export { createUser, loginUser, profileInfo, logout, deleteAccount, verifyUser, resetpassword, forgetpassword }
