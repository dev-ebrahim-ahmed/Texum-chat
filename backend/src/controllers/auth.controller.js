import User from "../models/user.model.js";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
   
    const { fullName, email, password } = req.body; // input from frontend signup form
    try {
        if(!email || !password || !fullName){
        return res.status(400).json({message: "All fields are required"}); // finding all the fields
    }
        if(password.length < 6){
            return res.status(400).json({message: "Password must be at least 6 characters"}); // checking password length
        }
    const user = await User.findOne({email}); // finding user in database before creating account{

    if(user){
        return res.status(400).json({message: "User already exists"}); // if user already exists in database
    }

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt); // hashing password for security

        const newUser = await User.create({
            fullName,
            email,
            password: hashPassword,
        });

        if(newUser){
            generateToken(newUser._id, res); // jwt authentication process provide token
            await newUser.save();
            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic,
            }); // return back user information
        }else{
            res.status(400).json({message: "Invalid user data"});       
        }
    
        } catch (error) {
            console.log("Error in signup controller", error.message);
            res.status(500).json({ message: error.message });
        }
    
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(400).json({ message: "Incorrect Email" });
      }
  
      const isPasswordCorrect = await bcrypt.compare(password, user.password);
      if (!isPasswordCorrect) {
        return res.status(400).json({ message: "Incorrect Password" });
      }
  
      generateToken(user._id, res);
  
      res.status(200).json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePic: user.profilePic,
      });
    } catch (error) {
      console.log("Error in login controller", error.message);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };

export const logout =async (req, res) => {
    try {
        res.cookie("jwt", "", {maxAge: 0}); // clearing cookie
        res.status(200).json({message: "Logged out successfully"});
    } catch (error) {
        console.log("Error in logout controller", error.message);
        res.status(500).json({ message: error.message });
        
    }
    
};

export const updateProfile = async (req, res) => {
    try {
      const { profilePic } = req.body;
      const userId = req.user._id;
  
      if (!profilePic) {
        return res.status(400).json({ message: "Profile pic is required" });
      }
  
      const uploadResponse = await cloudinary.uploader.upload(profilePic);
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { profilePic: uploadResponse.secure_url },
        { new: true }
      );
  
      res.status(200).json(updatedUser);
    } catch (error) {
      console.log("error in update profile:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
  


export const checkAuth = async (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log("Error in checkAuth", error.message);
        res.status(500).json({ message: error.message });

    }
};
