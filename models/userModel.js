import mongoose from "mongoose";
import crypto from "crypto";
const userSchema = new mongoose.Schema({
  profilePhoto: {
    type: String,
  },
  userName: {
    type: String,
    required: [true, "Username is required."],
    minlength: [3, "Username must be at least 3 characters."],
    trim: true, // Automatically trim whitespace
   
  },
  email: {
    type: String,
    required: [true, "Email is required."],
    lowercase: true, // Automatically convert to lowercase
    unique: true, // Ensure email is unique
    trim: true, // Automatically trim whitespace
  },
  password: {
    type: String,
    required: [true, "Password is required."],
    minlength: [8, "Password must be at least 8 characters."],
    
  },
  otp:{
    type:String,
    default:"0"
  },
  optExpired:{
    type:String,
    default:Date
  },

    // Add reset filed as needed
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpire: {
    type: Date,
  }
  
}, { timestamps: true }); // Add timestamps for createdAt and updatedAt


// create createResetPasswordToken function
userSchema.methods.createResetPasswordToken = function(){
   const resetToken = crypto.randomBytes(32).toString("hex"); // this is plain token , to make secure we need to hashed 
   // we need to hash
   this.resetPasswordToken  =  crypto.createHash("sha256").update(resetToken).digest("hex");
   this.resetPasswordExpire = Date.now() + 10*60*1000; // 10 minutes
   return resetToken;
}

// Create and export userModel 
const User = mongoose.model("User ", userSchema);
export default User; 